import { Request, Response } from "express";
import { fn, col } from "sequelize";
import CommissionEarning from "../models/commissionearning";
import CommissionPayout from "../models/commissionpayout";
import CrmActivity from "../models/crmactivity";
import CrmLead from "../models/crmlead";
import Referral from "../models/referral";
import ReferralCode from "../models/referralcode";
import ReferralProgram from "../models/referralprogram";
import User from "../models/user";
import { SalesAgentRequest } from "../middlewares/salesAgentAuthMiddleware";
import logger from "../middlewares/logger";
import { buildReferralUrl } from "./referralCodeController";

const agentId = (req: Request) => (req as SalesAgentRequest).salesAgent!.id;
const fail = (error: unknown, res: Response) => { logger.error("Sales workspace operation failed:", error); res.status(500).json({ message: "Internal server error" }); };

export const me = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = agentId(req), agent = (req as SalesAgentRequest).salesAgent!;
		const [leadCount, referralCount, codeCount, balances] = await Promise.all([
			CrmLead.count({ where: { ownerAgentId: id } }), Referral.count({ where: { agentId: id } }), ReferralCode.count({ where: { agentId: id, status: "ACTIVE" } }),
			CommissionEarning.findAll({ where: { agentId: id }, attributes: ["currency", "status", [fn("SUM", col("amount")), "amount"]], group: ["currency", "status"], raw: true }),
		]);
		res.status(200).json({ data: { agent, summary: { leadCount, referralCount, activeCodeCount: codeCount, balances } } });
	} catch (error) { fail(error, res); }
};
export const leads = async (req: Request, res: Response): Promise<void> => { try { res.status(200).json({ data: await CrmLead.findAll({ where: { ownerAgentId: agentId(req) }, order: [["updatedAt", "DESC"]] }) }); } catch (e) { fail(e, res); } };
export const createLead = async (req: Request, res: Response): Promise<void> => { try { const lead = await CrmLead.create({ ...req.body, ownerAgentId: agentId(req), stage: "NEW" }); await CrmActivity.create({ leadId: lead.id, type: "NOTE", subject: "Lead created by sales agent" }); res.status(201).json({ message: "Lead added", data: lead }); } catch (e) { fail(e, res); } };
export const leadDetails = async (req: Request, res: Response): Promise<void> => { try { const lead = await CrmLead.findOne({ where: { id: req.params.leadId, ownerAgentId: agentId(req) }, include: [{ model: CrmActivity, as: "activities", separate: true, order: [["createdAt", "DESC"]] }, { model: ReferralCode, as: "referralCode" }, { model: User, as: "referredUser", attributes: ["id", "firstName", "lastName", "email", "accountType"] }] }); if (!lead) { res.status(404).json({ message: "Lead not found" }); return; } res.status(200).json({ data: lead }); } catch (e) { fail(e, res); } };
export const updateLeadStage = async (req: Request, res: Response): Promise<void> => { try { const lead = await CrmLead.findOne({ where: { id: req.params.leadId, ownerAgentId: agentId(req) } }); if (!lead) { res.status(404).json({ message: "Lead not found" }); return; } const from = lead.stage; await lead.update({ stage: req.body.stage, lostReason: req.body.stage === "LOST" ? req.body.lostReason : null }); await CrmActivity.create({ leadId: lead.id, type: "STAGE_CHANGE", subject: `${from} to ${req.body.stage}`, details: req.body.lostReason }); res.status(200).json({ message: `Lead moved to ${req.body.stage}`, data: lead }); } catch (e) { fail(e, res); } };
export const addLeadActivity = async (req: Request, res: Response): Promise<void> => { try { const lead = await CrmLead.findOne({ where: { id: req.params.leadId, ownerAgentId: agentId(req) } }); if (!lead) { res.status(404).json({ message: "Lead not found" }); return; } const activity = await CrmActivity.create({ leadId: lead.id, type: req.body.type, subject: req.body.subject, details: req.body.details, dueAt: req.body.dueAt }); if (req.body.type === "TASK" && req.body.dueAt) await lead.update({ nextFollowUpAt: req.body.dueAt }); res.status(201).json({ message: "Activity added", data: activity }); } catch (e) { fail(e, res); } };
export const codes = async (req: Request, res: Response): Promise<void> => { try { const items = await ReferralCode.findAll({ where: { agentId: agentId(req) }, include: [{ model: ReferralProgram, as: "program", attributes: ["id", "name", "code", "status"] }], order: [["createdAt", "DESC"]] }); res.status(200).json({ data: items.map((item) => ({ ...item.toJSON(), referralUrl: buildReferralUrl(item) })) }); } catch (e) { fail(e, res); } };
export const referrals = async (req: Request, res: Response): Promise<void> => { try { res.status(200).json({ data: await Referral.findAll({ where: { agentId: agentId(req) }, include: [{ model: User, as: "referredUser", attributes: ["id", "firstName", "lastName", "email", "accountType"] }], order: [["attributedAt", "DESC"]] }) }); } catch (e) { fail(e, res); } };
export const earnings = async (req: Request, res: Response): Promise<void> => { try { res.status(200).json({ data: await CommissionEarning.findAll({ where: { agentId: agentId(req) }, order: [["earnedAt", "DESC"]] }) }); } catch (e) { fail(e, res); } };
export const payouts = async (req: Request, res: Response): Promise<void> => { try { res.status(200).json({ data: await CommissionPayout.findAll({ where: { agentId: agentId(req) }, order: [["createdAt", "DESC"]] }) }); } catch (e) { fail(e, res); } };
