import { Request, Response } from "express";
import CommissionEarning from "../models/commissionearning";
import Referral from "../models/referral";
import ReferralProgram from "../models/referralprogram";
import SalesAgent from "../models/salesagent";
import logger from "../middlewares/logger";
import { reverseCommissionEarning } from "../services/commissionEngine.service";

interface AdminRequest extends Request {
	adminId?: string;
}

export const listCommissionEarnings = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const where: Record<string, unknown> = {};
		if (req.query.status) where.status = req.query.status;
		if (req.query.agentId) where.agentId = req.query.agentId;
		if (req.query.programId) where.programId = req.query.programId;

		const { rows, count } = await CommissionEarning.findAndCountAll({
			where,
			include: [
				{ model: ReferralProgram, as: "program", attributes: ["id", "name", "code"] },
				{ model: SalesAgent, as: "agent", attributes: ["id", "agentCode", "firstName", "lastName", "email"] },
				{ model: Referral, as: "referral", attributes: ["id", "referredUserId", "referredEntityType", "status"] },
			],
			limit,
			offset: (page - 1) * limit,
			order: [["earnedAt", "DESC"]],
		});
		res.status(200).json({
			data: rows,
			pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
		});
	} catch (error) {
		logger.error("Error listing commission earnings:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const reverseEarning = async (req: AdminRequest, res: Response): Promise<void> => {
	try {
		const result = await reverseCommissionEarning(
			req.params.earningId as string,
			req.body.reason,
			req.adminId,
		);
		if (result.outcome === "NOT_FOUND") {
			res.status(404).json({ message: "Commission earning not found" });
			return;
		}
		if (result.outcome === "ALREADY_REVERSED") {
			res.status(409).json({ message: "Commission earning has already been reversed" });
			return;
		}
		res.status(200).json({ message: "Commission earning reversed successfully", data: result.earning });
	} catch (error) {
		logger.error("Error reversing commission earning:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
