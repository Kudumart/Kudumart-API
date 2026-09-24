import { Request, Response } from "express";
import { fn, col } from "sequelize";
import CommissionEarning from "../models/commissionearning";
import CommissionPayout from "../models/commissionpayout";
import CrmLead from "../models/crmlead";
import Referral from "../models/referral";
import ReferralCode from "../models/referralcode";
import ReferralProgram from "../models/referralprogram";
import SalesAgent from "../models/salesagent";
import logger from "../middlewares/logger";

export const getReferralAnalytics = async (_req: Request, res: Response): Promise<void> => {
	try {
		const [programmes, agents, activeAgents, codes, referrals, referralStatuses, leadStages, earningTotals, payoutTotals] = await Promise.all([
			ReferralProgram.count(), SalesAgent.count(), SalesAgent.count({ where: { status: "ACTIVE" } }), ReferralCode.count(), Referral.count(),
			Referral.findAll({ attributes: ["status", [fn("COUNT", col("id")), "count"]], group: ["status"], raw: true }),
			CrmLead.findAll({ attributes: ["stage", [fn("COUNT", col("id")), "count"]], group: ["stage"], raw: true }),
			CommissionEarning.findAll({ attributes: ["currency", "status", [fn("SUM", col("amount")), "amount"], [fn("COUNT", col("id")), "count"]], group: ["currency", "status"], raw: true }),
			CommissionPayout.findAll({ attributes: ["currency", "status", [fn("SUM", col("totalAmount")), "amount"], [fn("COUNT", col("id")), "count"]], group: ["currency", "status"], raw: true }),
		]);
		res.status(200).json({ data: { totals: { programmes, agents, activeAgents, codes, referrals }, referralStatuses, leadStages, earningTotals, payoutTotals } });
	} catch (error) {
		logger.error("Error loading referral analytics:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
