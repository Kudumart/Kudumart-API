import { Request, Response } from "express";
import { Op } from "sequelize";
import CrmActivity from "../models/crmactivity";
import CrmLead from "../models/crmlead";
import ReferralCode from "../models/referralcode";
import SalesAgent from "../models/salesagent";
import User from "../models/user";
import logger from "../middlewares/logger";

interface AdminRequest extends Request { adminId?: string }
const editable = ["ownerAgentId", "firstName", "lastName", "email", "phoneNumber", "entityType", "source", "referralCodeId", "nextFollowUpAt", "expectedValue", "currency", "lostReason"];
const pick = (body: Record<string, unknown>) => Object.fromEntries(editable.filter((key) => Object.prototype.hasOwnProperty.call(body, key)).map((key) => [key, body[key]]));
const includes = () => [
	{ model: SalesAgent, as: "owner", attributes: ["id", "agentCode", "firstName", "lastName", "email"] },
	{ model: ReferralCode, as: "referralCode", attributes: ["id", "code", "channel"] },
	{ model: User, as: "referredUser", attributes: ["id", "firstName", "lastName", "email", "accountType"] },
];
const failed = (error: unknown, res: Response) => { logger.error("CRM operation failed:", error); res.status(500).json({ message: "Internal server error" }); };

export const listLeads = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1, limit = Number(req.query.limit) || 50;
		const where: Record<string | symbol, unknown> = {};
		if (req.query.stage) where.stage = req.query.stage;
		if (req.query.ownerAgentId) where.ownerAgentId = req.query.ownerAgentId;
		if (req.query.entityType) where.entityType = req.query.entityType;
		if (req.query.search) where[Op.or] = ["firstName", "lastName", "email", "phoneNumber"].map((field) => ({ [field]: { [Op.like]: `%${req.query.search}%` } }));
		const { rows, count } = await CrmLead.findAndCountAll({ where, include: includes(), limit, offset: (page - 1) * limit, order: [["updatedAt", "DESC"]] });
		res.status(200).json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
	} catch (error) { failed(error, res); }
};

export const getLead = async (req: Request, res: Response): Promise<void> => {
	try {
		const lead = await CrmLead.findByPk(req.params.leadId as string, { include: [...includes(), { model: CrmActivity, as: "activities", separate: true, order: [["createdAt", "DESC"]] }] });
		if (!lead) { res.status(404).json({ message: "CRM lead not found" }); return; }
		res.status(200).json({ data: lead });
	} catch (error) { failed(error, res); }
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
	try { const lead = await CrmLead.create({ ...pick(req.body), stage: "NEW" }); res.status(201).json({ message: "CRM lead created", data: lead }); }
	catch (error) { failed(error, res); }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
	try { const lead = await CrmLead.findByPk(req.params.leadId as string); if (!lead) { res.status(404).json({ message: "CRM lead not found" }); return; } await lead.update(pick(req.body)); res.status(200).json({ message: "CRM lead updated", data: lead }); }
	catch (error) { failed(error, res); }
};

export const changeStage = async (req: AdminRequest, res: Response): Promise<void> => {
	try {
		const lead = await CrmLead.findByPk(req.params.leadId as string); if (!lead) { res.status(404).json({ message: "CRM lead not found" }); return; }
		const from = lead.stage; await lead.update({ stage: req.body.stage, lostReason: req.body.stage === "LOST" ? req.body.lostReason : null });
		await CrmActivity.create({ leadId: lead.id, createdByAdminId: req.adminId, type: "STAGE_CHANGE", subject: `${from} to ${req.body.stage}`, details: req.body.lostReason || null });
		res.status(200).json({ message: `Lead moved to ${req.body.stage}`, data: lead });
	} catch (error) { failed(error, res); }
};

export const addActivity = async (req: AdminRequest, res: Response): Promise<void> => {
	try {
		const lead = await CrmLead.findByPk(req.params.leadId as string); if (!lead) { res.status(404).json({ message: "CRM lead not found" }); return; }
		const activity = await CrmActivity.create({ leadId: lead.id, createdByAdminId: req.adminId, type: req.body.type, subject: req.body.subject, details: req.body.details, dueAt: req.body.dueAt, completedAt: req.body.completedAt });
		if (req.body.type === "TASK" && req.body.dueAt) await lead.update({ nextFollowUpAt: req.body.dueAt });
		res.status(201).json({ message: "CRM activity added", data: activity });
	} catch (error) { failed(error, res); }
};
