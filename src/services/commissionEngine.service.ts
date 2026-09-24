import Decimal from "decimal.js";
import { Op, Transaction } from "sequelize";
import CommissionEarning from "../models/commissionearning";
import Referral from "../models/referral";
import ReferralEvent from "../models/referralevent";
import ReferralProgram, { CommissionRule } from "../models/referralprogram";
import { notifySalesAgent } from "./salesNotification.service";

export const calculateCommissionAmount = (
	baseAmount: number,
	rule: Pick<CommissionRule, "calculationType" | "rate" | "maximumCommissionAmount">,
) => {
	let amount = rule.calculationType === "PERCENTAGE"
		? new Decimal(baseAmount).mul(rule.rate).div(100)
		: new Decimal(rule.rate);
	if (rule.maximumCommissionAmount != null) {
		amount = Decimal.min(amount, new Decimal(rule.maximumCommissionAmount));
	}
	return amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
};

export const createOrderCommissionEarnings = async (input: {
	userId: string;
	entityType: "CUSTOMER" | "VENDOR";
	sourceId: string;
	baseAmount: number;
	currency: string;
	earnedAt?: Date;
	transaction: Transaction;
}) => {
	const referral = await Referral.findOne({
		where: { referredUserId: input.userId },
		include: [{ model: ReferralProgram, as: "program" }],
		transaction: input.transaction,
		lock: input.transaction.LOCK.UPDATE,
	});
	if (!referral || !["QUALIFIED", "CONVERTED"].includes(referral.status)) return [];

	const program = referral.get("program") as ReferralProgram;
	const earnedAt = input.earnedAt || new Date();
	if (program.commissionDurationDays) {
		const earningEndsAt = new Date(referral.attributedAt);
		earningEndsAt.setDate(earningEndsAt.getDate() + program.commissionDurationDays);
		if (earnedAt > earningEndsAt) return [];
	}

	const trigger = input.entityType === "CUSTOMER"
		? "CUSTOMER_COMPLETED_ORDER"
		: "VENDOR_COMPLETED_ORDER";
	const rules = (program.commissionRules || []).filter(
		(rule: CommissionRule) =>
			rule.trigger === trigger &&
			(rule.entityType === "BOTH" || rule.entityType === input.entityType) &&
			(rule.minimumSourceAmount == null || input.baseAmount >= Number(rule.minimumSourceAmount)),
	);
	const createdEarnings: CommissionEarning[] = [];
	for (const rule of rules) {
		const amount = calculateCommissionAmount(input.baseAmount, rule);
		if (amount.lte(0)) continue;

		const heldUntil = new Date(earnedAt);
		heldUntil.setDate(heldUntil.getDate() + program.holdingPeriodDays);
		const immediatelyAvailable = program.holdingPeriodDays === 0;
		const sourceType = input.entityType === "CUSTOMER" ? "ORDER" : "ORDER_ITEM";
		const [earning, created] = await CommissionEarning.findOrCreate({
			where: {
				referralId: referral.id,
				ruleId: rule.id,
				sourceType,
				sourceId: input.sourceId,
			},
			defaults: {
				programId: program.id,
				agentId: referral.agentId,
				baseAmount: new Decimal(input.baseAmount).toDecimalPlaces(2).toFixed(2),
				amount: amount.toFixed(2),
				currency: (rule.calculationType === "FIXED" && rule.currency
					? rule.currency
					: input.currency).toUpperCase(),
				status: immediatelyAvailable ? "AVAILABLE" : "PENDING",
				earnedAt,
				heldUntil,
				availableAt: immediatelyAvailable ? earnedAt : null,
				calculationSnapshot: {
					rule: { ...rule },
					programmeCode: program.code,
					entityType: input.entityType,
					sourceCurrency: input.currency.toUpperCase(),
				},
			},
			transaction: input.transaction,
		});
		if (created) {
			createdEarnings.push(earning);
			await ReferralEvent.create(
				{
					referralId: referral.id,
					eventType: "COMMISSION_CREATED",
					eventKey: `COMMISSION_CREATED:${earning.id}`,
					occurredAt: earnedAt,
					metadata: { earningId: earning.id, amount: earning.amount, currency: earning.currency, ruleId: rule.id },
				},
				{ transaction: input.transaction },
			);
			await notifySalesAgent(referral.agentId, "Commission earned", `${earning.currency} ${earning.amount} has been added to your commission ledger.`, "commission_earned", input.transaction);
		}
	}
	return createdEarnings;
};

export const releaseMaturedCommissionEarnings = async (
	now = new Date(),
) => {
	if (!CommissionEarning.sequelize) throw new Error("Database is not initialized");
	return CommissionEarning.sequelize.transaction(async (transaction) => {
		const earnings = await CommissionEarning.findAll({
			where: { status: "PENDING", heldUntil: { [Op.lte]: now } },
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
		for (const earning of earnings) {
			await earning.update(
				{ status: "AVAILABLE", availableAt: now },
				{ transaction },
			);
			await ReferralEvent.findOrCreate({
				where: { eventKey: `COMMISSION_AVAILABLE:${earning.id}` },
				defaults: {
					referralId: earning.referralId,
					eventType: "COMMISSION_AVAILABLE",
					eventKey: `COMMISSION_AVAILABLE:${earning.id}`,
					occurredAt: now,
					metadata: { earningId: earning.id },
				},
				transaction,
			});
			await notifySalesAgent(earning.agentId, "Commission available", `${earning.currency} ${earning.amount} is now available for payout.`, "commission_available", transaction);
		}
		return earnings.length;
	});
};

export const reverseCommissionEarning = async (
	earningId: string,
	reason: string,
	actorId?: string,
) => {
	if (!CommissionEarning.sequelize) throw new Error("Database is not initialized");
	return CommissionEarning.sequelize.transaction(async (transaction) => {
		const earning = await CommissionEarning.findByPk(earningId, {
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
		if (!earning) return { outcome: "NOT_FOUND" as const };
		if (["REVERSED", "CANCELLED"].includes(earning.status)) {
			return { outcome: "ALREADY_REVERSED" as const, earning };
		}
		const previousStatus = earning.status;
		const reversedAt = new Date();
		await earning.update({ status: "REVERSED", reversedAt }, { transaction });
		await ReferralEvent.findOrCreate({
			where: { eventKey: `COMMISSION_REVERSED:${earning.id}` },
			defaults: {
				referralId: earning.referralId,
				eventType: "COMMISSION_REVERSED",
				eventKey: `COMMISSION_REVERSED:${earning.id}`,
				occurredAt: reversedAt,
				metadata: { earningId: earning.id, previousStatus, reason, actorId },
			},
			transaction,
		});
		return { outcome: "REVERSED" as const, earning, previousStatus };
	});
};

export const reverseCommissionEarningsForSource = async (
	sourceType: "ORDER" | "ORDER_ITEM",
	sourceId: string,
	reason: string,
) => {
	const earnings = await CommissionEarning.findAll({
		where: { sourceType, sourceId, status: { [Op.in]: ["PENDING", "AVAILABLE", "PAID"] } },
	});
	for (const earning of earnings) {
		await reverseCommissionEarning(earning.id, reason);
	}
	return earnings.length;
};
