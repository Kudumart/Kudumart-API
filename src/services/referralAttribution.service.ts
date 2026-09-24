import { Transaction } from "sequelize";
import CrmActivity from "../models/crmactivity";
import CrmLead from "../models/crmlead";
import Referral from "../models/referral";
import ReferralCode from "../models/referralcode";
import ReferralEvent from "../models/referralevent";
import ReferralProgram from "../models/referralprogram";
import ReferralVisit from "../models/referralvisit";
import SalesAgent from "../models/salesagent";
import User from "../models/user";
import { evaluateReferralQualification } from "./referralQualification.service";

export class ReferralAttributionError extends Error {}

const eligibilityError = (
	code: ReferralCode,
	program: ReferralProgram,
	agent: SalesAgent,
	accountType: "CUSTOMER" | "VENDOR",
) => {
	const now = Date.now();
	if (code.status !== "ACTIVE") return "Referral code is not active";
	if (code.expiresAt && code.expiresAt.getTime() <= now) return "Referral code has expired";
	if (code.maximumUses != null && code.usageCount >= code.maximumUses) {
		return "Referral code usage limit has been reached";
	}
	if (program.status !== "ACTIVE") return "Referral programme is not active";
	if (program.startsAt && program.startsAt.getTime() > now) return "Referral programme has not started";
	if (program.endsAt && program.endsAt.getTime() <= now) return "Referral programme has ended";
	if (agent.status !== "ACTIVE") return "Sales agent is not active";
	if (
		program.referredEntityType !== "BOTH" &&
		program.referredEntityType !== accountType
	) {
		return `Referral code is not valid for ${accountType.toLowerCase()} accounts`;
	}
	return null;
};

const findEligibleCode = async (
	codeValue: string,
	accountType: "CUSTOMER" | "VENDOR",
	transaction: Transaction,
) => {
	const code = await ReferralCode.findOne({
		where: { code: codeValue.trim().toUpperCase() },
		include: [
			{ model: ReferralProgram, as: "program" },
			{ model: SalesAgent, as: "agent" },
		],
		transaction,
		lock: transaction.LOCK.UPDATE,
	});
	if (!code) throw new ReferralAttributionError("Referral code is invalid");

	const program = code.get("program") as ReferralProgram;
	const agent = code.get("agent") as SalesAgent;
	const error = eligibilityError(code, program, agent, accountType);
	if (error) throw new ReferralAttributionError(error);
	return { code, program, agent };
};

export const createUserWithReferralAttribution = async (
	userAttributes: Record<string, unknown>,
	referralCode?: string,
	visitorToken?: string,
) => {
	if (!referralCode) return User.create(userAttributes);
	if (!User.sequelize) throw new Error("Database is not initialized");

	return User.sequelize.transaction(async (transaction) => {
		const accountType = String(userAttributes.accountType).toUpperCase() as
			| "CUSTOMER"
			| "VENDOR";
		let { code, program, agent } = await findEligibleCode(
			referralCode,
			accountType,
			transaction,
		);

		let visit: ReferralVisit | null = null;
		if (visitorToken) {
			visit = await ReferralVisit.findOne({
				where: {
					visitorToken,
					convertedAt: null,
				},
				transaction,
				lock: transaction.LOCK.UPDATE,
			});
			if (visit && visit.expiresAt.getTime() <= Date.now()) visit = null;

			if (visit) {
				const visitProgram = await ReferralProgram.findByPk(visit.programId, {
					transaction,
				});
				if (visitProgram?.attributionModel === "FIRST_TOUCH") {
					const firstTouchCode = await ReferralCode.findByPk(visit.referralCodeId, {
						transaction,
					});
					if (!firstTouchCode) {
						throw new ReferralAttributionError("Original referral code is unavailable");
					}
					({ code, program, agent } = await findEligibleCode(
						firstTouchCode.code,
						accountType,
						transaction,
					));
				}
			}
		}

		if (visit && visit.referralCodeId !== code.id) visit = null;

		const user = await User.create(userAttributes, { transaction });
		if (!program.allowSelfReferral && agent.userId === user.id) {
			throw new ReferralAttributionError("Self-referrals are not allowed");
		}

		const attributedAt = new Date();
		const attributionExpiresAt = visit
			? new Date(visit.expiresAt)
			: new Date(attributedAt);
		if (!visit) {
			attributionExpiresAt.setDate(
				attributionExpiresAt.getDate() + program.attributionWindowDays,
			);
		}
		const method =
			visit && program.attributionModel === "FIRST_TOUCH"
				? "FIRST_TOUCH"
				: visit && program.attributionModel === "LAST_TOUCH"
					? "LAST_TOUCH"
					: "REFERRAL_CODE";

		const referral = await Referral.create(
			{
				programId: program.id,
				agentId: agent.id,
				referralCodeId: code.id,
				referralVisitId: visit?.id || null,
				referredUserId: user.id,
				referredEntityType: accountType,
				attributionMethod: method,
				status: "REGISTERED",
				attributedAt,
				attributionExpiresAt,
			},
			{ transaction },
		);

		await ReferralEvent.create(
			{
				referralId: referral.id,
				eventType: "USER_REGISTERED",
				eventKey: `USER_REGISTERED:${user.id}`,
				occurredAt: attributedAt,
				metadata: { accountType },
			},
			{ transaction },
		);
		const crmLead = await CrmLead.findOne({
			where: {
				referralCodeId: code.id,
				email: String(userAttributes.email || "").toLowerCase(),
			},
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
		if (crmLead) {
			const previousStage = crmLead.stage;
			await crmLead.update(
				{ referredUserId: user.id, stage: "WON", nextFollowUpAt: null },
				{ transaction },
			);
			await CrmActivity.create(
				{
					leadId: crmLead.id,
					type: "STAGE_CHANGE",
					subject: `${previousStage} to WON`,
					details: "Converted automatically through attributed registration",
					completedAt: attributedAt,
				},
				{ transaction },
			);
		}
		await code.increment("usageCount", { by: 1, transaction });
		if (visit) {
			await visit.update(
				{ convertedAt: attributedAt, referredUserId: user.id },
				{ transaction },
			);
		}
		return user;
	});
};

export const recordReferralMilestone = async (
	userId: string,
	eventType: string,
	status?: "VERIFIED" | "QUALIFIED" | "CONVERTED",
) => {
	const referral = await Referral.findOne({ where: { referredUserId: userId } });
	if (!referral) return null;

	await ReferralEvent.findOrCreate({
		where: { eventKey: `${eventType}:${userId}` },
		defaults: {
			referralId: referral.id,
			eventType,
			eventKey: `${eventType}:${userId}`,
			occurredAt: new Date(),
		},
	});
	if (status && referral.status !== "DISQUALIFIED" && referral.status !== "REJECTED") {
		const rank = { REGISTERED: 0, VERIFIED: 1, QUALIFIED: 2, CONVERTED: 3 };
		const currentRank = rank[referral.status as keyof typeof rank] ?? -1;
		if (rank[status] > currentRank) await referral.update({ status });
	}
	if (status === "VERIFIED") await evaluateReferralQualification(referral.id);
	return referral;
};
