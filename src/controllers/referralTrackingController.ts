import crypto from "crypto";
import { Request, Response } from "express";
import { Op } from "sequelize";
import logger from "../middlewares/logger";
import ReferralCode from "../models/referralcode";
import ReferralProgram from "../models/referralprogram";
import ReferralVisit from "../models/referralvisit";
import SalesAgent from "../models/salesagent";

const hashValue = (value?: string) => {
	if (!value) return null;
	const secret = process.env.REFERRAL_HASH_SECRET || process.env.SERVER_JWT_SECRET;
	if (!secret) throw new Error("REFERRAL_HASH_SECRET must be configured");
	return crypto.createHmac("sha256", secret).update(value).digest("hex");
};

export const recordReferralVisit = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const code = await ReferralCode.findOne({
			where: { code: String(req.body.code).trim().toUpperCase() },
			include: [
				{ model: ReferralProgram, as: "program" },
				{ model: SalesAgent, as: "agent" },
			],
		});
		if (!code) {
			res.status(404).json({ valid: false, message: "Referral code is invalid" });
			return;
		}

		const program = code.get("program") as ReferralProgram;
		const agent = code.get("agent") as SalesAgent;
		const now = new Date();
		const unavailable =
			code.status !== "ACTIVE" ||
			(code.expiresAt != null && code.expiresAt <= now) ||
			(code.maximumUses != null && code.usageCount >= code.maximumUses) ||
			program.status !== "ACTIVE" ||
			(program.startsAt != null && program.startsAt > now) ||
			(program.endsAt != null && program.endsAt <= now) ||
			agent.status !== "ACTIVE";
		if (unavailable) {
			res.status(422).json({ valid: false, message: "Referral code is not currently available" });
			return;
		}

		if (program.attributionModel === "FIRST_TOUCH" && req.body.visitorToken) {
			const existingVisit = await ReferralVisit.findOne({
				where: {
					visitorToken: req.body.visitorToken,
					programId: program.id,
					convertedAt: null,
					expiresAt: { [Op.gt]: now },
				},
			});
			if (existingVisit) {
				res.status(200).json({
					valid: true,
					attributionPreserved: true,
					data: {
						visitorToken: existingVisit.visitorToken,
						expiresAt: existingVisit.expiresAt,
					},
				});
				return;
			}
		}

		const expiresAt = new Date(now);
		expiresAt.setDate(expiresAt.getDate() + program.attributionWindowDays);
		const visit = await ReferralVisit.create({
			referralCodeId: code.id,
			programId: program.id,
			agentId: agent.id,
			visitorToken: crypto.randomBytes(32).toString("hex"),
			ipHash: hashValue(req.ip),
			userAgentHash: hashValue(req.get("user-agent")),
			landingUrl: req.body.landingUrl || null,
			referrerUrl: req.body.referrerUrl || null,
			campaignCode: code.campaignCode || null,
			channel: code.channel || null,
			expiresAt,
		});

		res.status(201).json({
			valid: true,
			data: { visitorToken: visit.visitorToken, expiresAt: visit.expiresAt },
		});
	} catch (error) {
		logger.error("Error recording referral visit:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
