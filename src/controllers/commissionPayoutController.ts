import { Request, Response } from "express";
import CommissionEarning from "../models/commissionearning";
import CommissionPayout from "../models/commissionpayout";
import SalesAgent from "../models/salesagent";
import logger from "../middlewares/logger";
import { CommissionPayoutError, createCommissionPayout, transitionCommissionPayout } from "../services/commissionPayout.service";
import { notifySalesAgent } from "../services/salesNotification.service";

interface AdminRequest extends Request { adminId?: string }

const fail = (error: unknown, res: Response) => {
	if (error instanceof CommissionPayoutError) { res.status(409).json({ message: error.message }); return; }
	logger.error("Commission payout operation failed:", error);
	res.status(500).json({ message: "Internal server error" });
};

export const listPayouts = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const where: Record<string, unknown> = {};
		if (req.query.status) where.status = req.query.status;
		if (req.query.agentId) where.agentId = req.query.agentId;
		const { rows, count } = await CommissionPayout.findAndCountAll({
			where,
			include: [
				{ model: SalesAgent, as: "agent", attributes: ["id", "agentCode", "firstName", "lastName", "email"] },
				{ model: CommissionEarning, as: "earnings", attributes: ["id", "amount", "status", "sourceType", "sourceId"] },
			],
			distinct: true,
			limit,
			offset: (page - 1) * limit,
			order: [["createdAt", "DESC"]],
		});
		res.status(200).json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
	} catch (error) { fail(error, res); }
};

export const createPayout = async (req: Request, res: Response): Promise<void> => {
	try {
		const payout = await createCommissionPayout(req.body.agentId, req.body.currency, req.body.earningIds);
		res.status(201).json({ message: "Commission payout draft created", data: payout });
	} catch (error) { fail(error, res); }
};

export const approvePayout = async (req: AdminRequest, res: Response): Promise<void> => {
	try {
		const payout = await transitionCommissionPayout(req.params.payoutId as string, "APPROVE", { adminId: req.adminId });
		await notifySalesAgent(payout.agentId, "Payout approved", `${payout.currency} ${payout.totalAmount} has been approved for payment.`, "commission_payout_approved");
		res.status(200).json({ message: "Commission payout approved", data: payout });
	} catch (error) { fail(error, res); }
};

export const markPayoutPaid = async (req: Request, res: Response): Promise<void> => {
	try {
		const payout = await transitionCommissionPayout(req.params.payoutId as string, "MARK_PAID", { paymentReference: req.body.paymentReference });
		await notifySalesAgent(payout.agentId, "Payout completed", `${payout.currency} ${payout.totalAmount} has been marked as paid. Reference: ${payout.paymentReference}.`, "commission_payout_paid");
		res.status(200).json({ message: "Commission payout marked as paid", data: payout });
	} catch (error) { fail(error, res); }
};

export const cancelPayout = async (req: Request, res: Response): Promise<void> => {
	try {
		const payout = await transitionCommissionPayout(req.params.payoutId as string, "CANCEL");
		res.status(200).json({ message: "Commission payout cancelled and earnings released", data: payout });
	} catch (error) { fail(error, res); }
};
