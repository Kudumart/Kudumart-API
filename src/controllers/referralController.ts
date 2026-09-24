import { Request, Response } from "express";
import { Includeable, Op } from "sequelize";
import logger from "../middlewares/logger";
import Referral from "../models/referral";
import ReferralCode from "../models/referralcode";
import ReferralEvent from "../models/referralevent";
import ReferralProgram from "../models/referralprogram";
import SalesAgent from "../models/salesagent";
import User from "../models/user";

const baseIncludes = (): Includeable[] => [
	{
		model: ReferralProgram,
		as: "program",
		attributes: ["id", "name", "code", "status"],
	},
	{
		model: SalesAgent,
		as: "agent",
		attributes: ["id", "agentCode", "firstName", "lastName", "email", "status"],
	},
	{
		model: ReferralCode,
		as: "referralCode",
		attributes: ["id", "code", "campaignCode", "channel"],
	},
	{
		model: User,
		as: "referredUser",
		attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "accountType", "status", "createdAt"],
	},
];

export const listReferrals = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const { status, programId, agentId, referredEntityType, search } = req.query;
		const where: Record<string, unknown> = {};
		if (status) where.status = status;
		if (programId) where.programId = programId;
		if (agentId) where.agentId = agentId;
		if (referredEntityType) where.referredEntityType = referredEntityType;

		const include = baseIncludes() as any[];
		if (search) {
			const userInclude = include.find((item) => item.as === "referredUser");
			userInclude.where = {
				[Op.or]: [
					{ firstName: { [Op.like]: `%${search}%` } },
					{ lastName: { [Op.like]: `%${search}%` } },
					{ email: { [Op.like]: `%${search}%` } },
					{ phoneNumber: { [Op.like]: `%${search}%` } },
				],
			};
			userInclude.required = true;
		}

		const { rows, count } = await Referral.findAndCountAll({
			where,
			include,
			distinct: true,
			limit,
			offset: (page - 1) * limit,
			order: [["attributedAt", "DESC"]],
		});
		res.status(200).json({
			data: rows,
			pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
		});
	} catch (error) {
		logger.error("Error listing referrals:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getReferral = async (req: Request, res: Response): Promise<void> => {
	try {
		const referral = await Referral.findByPk(req.params.referralId as string, {
			include: [
				...baseIncludes(),
				{
					model: ReferralEvent,
					as: "events",
					separate: true,
					order: [["occurredAt", "ASC"]],
				},
			],
		});
		if (!referral) {
			res.status(404).json({ message: "Referral not found" });
			return;
		}
		res.status(200).json({ data: referral });
	} catch (error) {
		logger.error("Error fetching referral:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
