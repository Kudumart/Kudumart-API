import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import CrmCampaign from "../models/crmcampaign";
import CrmRepresentative from "../models/crmrepresentative";
import CrmCampaignRepresentative from "../models/crmcampaignrepresentative";
import CrmVendorReferral from "../models/crmvendorreferral";
import CrmCommissionRule from "../models/crmcommissionrule";
import CrmCommission from "../models/crmcommission";
import CrmPayout from "../models/crmpayout";
import User from "../models/user";
import Order from "../models/order";

interface AdminRequest extends Request { adminId?: string }
const fail = (res: Response, error: any) => res.status(500).json({ message: error?.message || "Internal server error" });
const required = (body: any, fields: string[]) => fields.filter(field => body[field] === undefined || body[field] === null || body[field] === "");
const page = (req: Request) => ({ limit: Math.min(Math.max(Number(req.query.limit) || 20, 1), 100), offset: (Math.max(Number(req.query.page) || 1, 1) - 1) * Math.min(Math.max(Number(req.query.limit) || 20, 1), 100) });
const paginated = (rows: any[], count: number, req: Request) => ({ data: rows, pagination: { page: Math.max(Number(req.query.page) || 1, 1), limit: Math.min(Math.max(Number(req.query.limit) || 20, 1), 100), total: count, pages: Math.ceil(count / Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)) } });

export const dashboard = async (_req: Request, res: Response) => {
	try {
		const [activeCampaigns, activeRepresentatives, referredVendors, pendingCommission, pendingPayouts] = await Promise.all([
			CrmCampaign.count({ where: { status: "active" } }), CrmRepresentative.count({ where: { status: "active" } }), CrmVendorReferral.count(),
			CrmCommission.sum("amount", { where: { status: { [Op.in]: ["pending", "qualified", "approved"] } } }), CrmPayout.count({ where: { status: "pending" } }),
		]);
		res.json({ data: { activeCampaigns, activeRepresentatives, referredVendors, pendingCommission: Number(pendingCommission || 0), pendingPayouts } });
	} catch (error) { fail(res, error); }
};

export const listCampaigns = async (req: Request, res: Response) => {
	try {
		const where: any = {}; if (req.query.status) where.status = req.query.status; if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
		const result = await CrmCampaign.findAndCountAll({ where, ...page(req), order: [["createdAt", "DESC"]], include: [{ model: CrmRepresentative, as: "representatives", attributes: ["id", "firstName", "lastName", "referralCode"], through: { attributes: [] } }] });
		res.json(paginated(result.rows, result.count, req));
	} catch (error) { fail(res, error); }
};

export const createCampaign = async (req: AdminRequest, res: Response) => {
	try {
		const missing = required(req.body, ["name", "code", "startsAt", "endsAt"]); if (missing.length) return res.status(422).json({ message: `Required fields: ${missing.join(", ")}` });
		if (new Date(req.body.endsAt) <= new Date(req.body.startsAt)) return res.status(422).json({ message: "endsAt must be after startsAt" });
		const campaign = await CrmCampaign.create({ ...req.body, code: String(req.body.code).trim().toUpperCase(), createdBy: req.adminId });
		res.status(201).json({ message: "Campaign created", data: campaign });
	} catch (error: any) { if (error?.name === "SequelizeUniqueConstraintError") return res.status(409).json({ message: "Campaign code already exists" }); fail(res, error); }
};

export const updateCampaign = async (req: Request, res: Response) => {
	try { const campaign = await CrmCampaign.findByPk(String(req.params.campaignId)); if (!campaign) return res.status(404).json({ message: "Campaign not found" }); await campaign.update(req.body); res.json({ message: "Campaign updated", data: campaign }); } catch (error) { fail(res, error); }
};

export const listRepresentatives = async (req: Request, res: Response) => {
	try {
		const where: any = {}; if (req.query.status) where.status = req.query.status; if (req.query.search) where[Op.or] = [{ firstName: { [Op.like]: `%${req.query.search}%` } }, { lastName: { [Op.like]: `%${req.query.search}%` } }, { email: { [Op.like]: `%${req.query.search}%` } }];
		const result = await CrmRepresentative.findAndCountAll({ where, ...page(req), order: [["createdAt", "DESC"]], attributes: { include: [[fn("COUNT", col("referrals.id")), "vendorCount"]] }, include: [{ model: CrmVendorReferral, as: "referrals", attributes: [] }], group: ["CrmRepresentative.id"], distinct: true });
		res.json(paginated(result.rows, Array.isArray(result.count) ? result.count.length : result.count, req));
	} catch (error) { fail(res, error); }
};

export const createRepresentative = async (req: AdminRequest, res: Response) => {
	try {
		const missing = required(req.body, ["firstName", "lastName", "email"]); if (missing.length) return res.status(422).json({ message: `Required fields: ${missing.join(", ")}` });
		const referralCode = String(req.body.referralCode || `REP-${Math.random().toString(36).slice(2, 8)}`).toUpperCase();
		const representative = await CrmRepresentative.create({ ...req.body, email: String(req.body.email).trim().toLowerCase(), referralCode, createdBy: req.adminId });
		res.status(201).json({ message: "Representative created", data: representative });
	} catch (error: any) { if (error?.name === "SequelizeUniqueConstraintError") return res.status(409).json({ message: "Email or referral code already exists" }); fail(res, error); }
};

export const updateRepresentative = async (req: Request, res: Response) => {
	try { const representative = await CrmRepresentative.findByPk(String(req.params.representativeId)); if (!representative) return res.status(404).json({ message: "Representative not found" }); await representative.update(req.body); res.json({ message: "Representative updated", data: representative }); } catch (error) { fail(res, error); }
};

export const assignRepresentative = async (req: Request, res: Response) => {
	try {
		const [campaign, representative] = await Promise.all([CrmCampaign.findByPk(String(req.params.campaignId)), CrmRepresentative.findByPk(req.body.representativeId)]);
		if (!campaign || !representative) return res.status(404).json({ message: "Campaign or representative not found" });
		const [assignment, created] = await CrmCampaignRepresentative.findOrCreate({ where: { campaignId: campaign.id, representativeId: representative.id } });
		res.status(created ? 201 : 200).json({ message: created ? "Representative assigned" : "Representative already assigned", data: assignment });
	} catch (error) { fail(res, error); }
};

export const listReferrals = async (req: Request, res: Response) => {
	try {
		const where: any = {}; for (const key of ["campaignId", "representativeId", "status"]) if (req.query[key]) where[key] = req.query[key];
		const result = await CrmVendorReferral.findAndCountAll({ where, ...page(req), order: [["createdAt", "DESC"]], include: [{ model: CrmCampaign, as: "campaign", attributes: ["id", "name", "code"] }, { model: CrmRepresentative, as: "representative", attributes: ["id", "firstName", "lastName", "referralCode"] }, { model: User, as: "vendor", attributes: ["id", "firstName", "lastName", "email", "phoneNumber"] }, { model: CrmCommission, as: "commission" }] });
		res.json(paginated(result.rows, result.count, req));
	} catch (error) { fail(res, error); }
};

export const createReferral = async (req: Request, res: Response) => {
	try {
		const missing = required(req.body, ["campaignId", "representativeId", "vendorId"]); if (missing.length) return res.status(422).json({ message: `Required fields: ${missing.join(", ")}` });
		const [campaign, representative, vendor] = await Promise.all([CrmCampaign.findByPk(req.body.campaignId), CrmRepresentative.findByPk(req.body.representativeId), User.findOne({ where: { id: req.body.vendorId, accountType: "Vendor" } })]);
		if (!campaign || !representative || !vendor) return res.status(404).json({ message: "Campaign, representative or vendor not found" });
		const referral = await CrmVendorReferral.create({ ...req.body, referralCode: representative.referralCode, referredAt: req.body.referredAt || new Date() });
		res.status(201).json({ message: "Vendor referral recorded", data: referral });
	} catch (error: any) { if (error?.name === "SequelizeUniqueConstraintError") return res.status(409).json({ message: "This vendor already has referral attribution" }); fail(res, error); }
};

export const qualifyReferral = async (req: Request, res: Response) => {
	try {
		const referral = await CrmVendorReferral.findByPk(String(req.params.referralId)); if (!referral) return res.status(404).json({ message: "Referral not found" });
		const status = req.body.status; if (!["verified", "qualified", "rejected"].includes(status)) return res.status(422).json({ message: "Invalid referral status" });
		await referral.update({ status, verifiedAt: status === "verified" ? new Date() : (referral as any).verifiedAt, qualifiedAt: status === "qualified" ? new Date() : (referral as any).qualifiedAt, firstOrderId: req.body.firstOrderId, notes: req.body.notes });
		if (status === "qualified") {
			const rule = await CrmCommissionRule.findOne({ where: { status: "active", [Op.or]: [{ campaignId: (referral as any).campaignId }, { campaignId: null }] }, order: [["campaignId", "DESC"]] });
			if (!rule) return res.status(422).json({ message: "Referral qualified, but no active commission rule is configured", data: referral });
			await CrmCommission.findOrCreate({ where: { referralId: referral.id }, defaults: { ruleId: rule.id, representativeId: (referral as any).representativeId, amount: (rule as any).amount, currency: (rule as any).currency, status: "qualified", qualifiedAt: new Date() } });
		}
		res.json({ message: "Referral status updated", data: referral });
	} catch (error) { fail(res, error); }
};

export const listRules = async (_req: Request, res: Response) => { try { res.json({ data: await CrmCommissionRule.findAll({ include: [{ model: CrmCampaign, as: "campaign", attributes: ["id", "name", "code"] }], order: [["createdAt", "DESC"]] }) }); } catch (error) { fail(res, error); } };
export const createRule = async (req: AdminRequest, res: Response) => { try { const missing = required(req.body, ["name", "amount"]); if (missing.length) return res.status(422).json({ message: `Required fields: ${missing.join(", ")}` }); const rule = await CrmCommissionRule.create({ ...req.body, createdBy: req.adminId }); res.status(201).json({ message: "Commission rule created", data: rule }); } catch (error) { fail(res, error); } };

export const listCommissions = async (req: Request, res: Response) => {
	try { const where: any = {}; if (req.query.status) where.status = req.query.status; if (req.query.representativeId) where.representativeId = req.query.representativeId; const result = await CrmCommission.findAndCountAll({ where, ...page(req), order: [["createdAt", "DESC"]], include: [{ model: CrmRepresentative, as: "representative", attributes: ["id", "firstName", "lastName", "referralCode"] }, { model: CrmVendorReferral, as: "referral", include: [{ model: User, as: "vendor", attributes: ["id", "firstName", "lastName", "email"] }] }, { model: CrmCommissionRule, as: "rule", attributes: ["id", "name", "qualificationType"] }] }); res.json(paginated(result.rows, result.count, req)); } catch (error) { fail(res, error); }
};

export const updateCommission = async (req: AdminRequest, res: Response) => {
	try { const commission = await CrmCommission.findByPk(String(req.params.commissionId)); if (!commission) return res.status(404).json({ message: "Commission not found" }); const status = req.body.status; if (!["approved", "rejected"].includes(status)) return res.status(422).json({ message: "Commission can only be approved or rejected here" }); await commission.update({ status, approvedBy: req.adminId, approvedAt: status === "approved" ? new Date() : null, notes: req.body.notes }); res.json({ message: `Commission ${status}`, data: commission }); } catch (error) { fail(res, error); }
};

export const listPayouts = async (req: Request, res: Response) => { try { const where: any = {}; if (req.query.status) where.status = req.query.status; const result = await CrmPayout.findAndCountAll({ where, ...page(req), order: [["createdAt", "DESC"]], include: [{ model: CrmRepresentative, as: "representative" }] }); res.json(paginated(result.rows, result.count, req)); } catch (error) { fail(res, error); } };

export const createPayout = async (req: Request, res: Response) => {
	try {
		const missing = required(req.body, ["representativeId"]); if (missing.length || !Array.isArray(req.body.commissionIds) || !req.body.commissionIds.length) return res.status(422).json({ message: "representativeId and at least one commissionId are required" });
		const currency = req.body.currency || "NGN";
		const commissions = await CrmCommission.findAll({ where: { id: { [Op.in]: req.body.commissionIds }, representativeId: req.body.representativeId, status: "approved", currency } });
		if (commissions.length !== req.body.commissionIds.length) return res.status(422).json({ message: "Every selected commission must be approved and belong to this representative" });
		const existingPayouts = await CrmPayout.findAll({ where: { status: { [Op.in]: ["pending", "approved", "paid"] } }, attributes: ["commissionIds"] });
		const reserved = new Set(existingPayouts.flatMap(payout => (((payout as any).commissionIds || []) as string[])));
		if (req.body.commissionIds.some((id: string) => reserved.has(id))) return res.status(409).json({ message: "One or more commissions are already included in a payout" });
		const amount = commissions.reduce((total, commission) => total + Number((commission as any).amount), 0);
		const payout = await CrmPayout.create({ ...req.body, amount, currency }); res.status(201).json({ message: "Payout created", data: payout });
	} catch (error) { fail(res, error); }
};

export const updatePayout = async (req: AdminRequest, res: Response) => {
	try {
		const payout = await CrmPayout.findByPk(String(req.params.payoutId)); if (!payout) return res.status(404).json({ message: "Payout not found" }); const status = req.body.status;
		if (!["approved", "paid", "rejected"].includes(status)) return res.status(422).json({ message: "Invalid payout status" });
		await payout.update({ status, reference: req.body.reference || (payout as any).reference, notes: req.body.notes, approvedBy: req.adminId, approvedAt: status === "approved" ? new Date() : (payout as any).approvedAt, paidAt: status === "paid" ? new Date() : null });
		if (status === "paid") await CrmCommission.update({ status: "paid", paidAt: new Date() }, { where: { id: { [Op.in]: ((payout as any).commissionIds || []) }, status: "approved" } });
		res.json({ message: `Payout ${status}`, data: payout });
	} catch (error) { fail(res, error); }
};
