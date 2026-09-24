import { Op, Transaction } from "sequelize";
import Referral from "../models/referral";
import ReferralEvent from "../models/referralevent";
import ReferralProgram, {
	QualificationRule,
	QualificationRuleOperator,
} from "../models/referralprogram";
import OrderItem from "../models/orderitem";
import { createOrderCommissionEarnings } from "./commissionEngine.service";
import { notifySalesAgent } from "./salesNotification.service";

type MetricMetadata = {
	metric?: string;
	value?: number;
	sourceKey?: string;
};

export const compareQualificationValue = (
	actual: number,
	operator: QualificationRuleOperator,
	target: number,
) => {
	switch (operator) {
		case "EQUALS":
			return actual === target;
		case "GREATER_THAN_OR_EQUAL":
			return actual >= target;
		case "GREATER_THAN":
			return actual > target;
		case "LESS_THAN_OR_EQUAL":
			return actual <= target;
		case "LESS_THAN":
			return actual < target;
		default:
			return false;
	}
};

const aggregateMetric = (
	metric: string,
	events: ReferralEvent[],
): number => {
	const matchingEvents = events.filter(
		(event) => (event.metadata as MetricMetadata | undefined)?.metric === metric,
	);
	if (metric.endsWith("_ACTIVE_DAYS")) {
		return new Set(
			matchingEvents.map((event) => event.occurredAt.toISOString().slice(0, 10)),
		).size;
	}
	if (metric === "VENDOR_APPROVED") {
		return matchingEvents.reduce(
			(maximum, event) =>
				Math.max(maximum, Number((event.metadata as MetricMetadata)?.value || 0)),
			0,
		);
	}
	return matchingEvents.reduce(
		(total, event) => total + Number((event.metadata as MetricMetadata)?.value || 0),
		0,
	);
};

export const evaluateReferralQualification = async (
	referralId: string,
	transaction?: Transaction,
) => {
	const referral = await Referral.findByPk(referralId, {
		include: [{ model: ReferralProgram, as: "program" }],
		transaction,
		lock: transaction ? transaction.LOCK.UPDATE : undefined,
	});
	if (!referral) return null;
	if (!["VERIFIED", "QUALIFIED"].includes(referral.status)) return referral;

	const program = referral.get("program") as ReferralProgram;
	const rules = (program.qualificationRules || []).filter(
		(rule: QualificationRule) =>
			rule.entityType === "BOTH" ||
			rule.entityType === referral.referredEntityType,
	);
	if (!rules.length) return referral;

	const latestRuleCutoff = rules.reduce((latest, rule) => {
		const cutoff = new Date(referral.attributedAt);
		cutoff.setDate(cutoff.getDate() + (rule.windowDays || program.attributionWindowDays));
		return cutoff > latest ? cutoff : latest;
	}, new Date(referral.attributedAt));
	const metricEvents = await ReferralEvent.findAll({
		where: {
			referralId: referral.id,
			eventType: "METRIC_RECORDED",
			occurredAt: { [Op.between]: [referral.attributedAt, latestRuleCutoff] },
		},
		transaction,
	});

	const passed = rules.every((rule: QualificationRule) => {
		const cutoff = new Date(referral.attributedAt);
		cutoff.setDate(cutoff.getDate() + (rule.windowDays || program.attributionWindowDays));
		const eventsInsideRuleWindow = metricEvents.filter(
			(event) => event.occurredAt <= cutoff,
		);
		return compareQualificationValue(
			aggregateMetric(rule.metric, eventsInsideRuleWindow),
			rule.operator,
			Number(rule.value),
		);
	});

	if (passed && referral.status === "VERIFIED") {
		const qualifiedAt = new Date();
		await referral.update({ status: "QUALIFIED", qualifiedAt }, { transaction });
		await ReferralEvent.findOrCreate({
			where: { eventKey: `REFERRAL_QUALIFIED:${referral.id}` },
			defaults: {
				referralId: referral.id,
				eventType: "REFERRAL_QUALIFIED",
				eventKey: `REFERRAL_QUALIFIED:${referral.id}`,
				occurredAt: qualifiedAt,
				metadata: { ruleIds: rules.map((rule: QualificationRule) => rule.id) },
			},
			transaction,
		});
		await notifySalesAgent(referral.agentId, "Referral qualified", "A referred user has completed the programme qualification requirements.", "referral_qualified", transaction);
	}
	return referral;
};

export const recordReferralMetric = async (
	userId: string,
	metric: string,
	value: number,
	sourceKey: string,
	options: { occurredAt?: Date; transaction?: Transaction } = {},
) => {
	const referral = await Referral.findOne({
		where: { referredUserId: userId },
		transaction: options.transaction,
	});
	if (!referral) return null;

	await ReferralEvent.findOrCreate({
		where: { eventKey: `METRIC:${metric}:${sourceKey}` },
		defaults: {
			referralId: referral.id,
			eventType: "METRIC_RECORDED",
			eventKey: `METRIC:${metric}:${sourceKey}`,
			occurredAt: options.occurredAt || new Date(),
			metadata: { metric, value, sourceKey },
		},
		transaction: options.transaction,
	});
	return evaluateReferralQualification(referral.id, options.transaction);
};

export const recordDeliveredOrderReferralMetrics = async (input: {
	buyerId: string;
	vendorId: string;
	orderId: string;
	orderItemId: string;
	orderTotal: number;
	lineTotal: number;
	currency: string;
	transaction: Transaction;
}) => {
	const occurredAt = new Date();
	await recordReferralMetric(
		input.vendorId,
		"VENDOR_COMPLETED_ORDERS",
		1,
		input.orderItemId,
		{ occurredAt, transaction: input.transaction },
	);
	await recordReferralMetric(
		input.vendorId,
		"VENDOR_GMV",
		input.lineTotal,
		input.orderItemId,
		{ occurredAt, transaction: input.transaction },
	);
	await recordReferralMetric(
		input.vendorId,
		"VENDOR_ACTIVE_DAYS",
		1,
		`${input.vendorId}:${occurredAt.toISOString().slice(0, 10)}`,
		{ occurredAt, transaction: input.transaction },
	);

	const undeliveredItems = await OrderItem.count({
		where: {
			orderId: input.orderId,
			status: { [Op.ne]: "delivered" },
		},
		transaction: input.transaction,
	});
	if (undeliveredItems === 0) {
		await recordReferralMetric(
			input.buyerId,
			"CUSTOMER_COMPLETED_ORDERS",
			1,
			input.orderId,
			{ occurredAt, transaction: input.transaction },
		);
		await recordReferralMetric(
			input.buyerId,
			"CUSTOMER_SPEND",
			input.orderTotal,
			input.orderId,
			{ occurredAt, transaction: input.transaction },
		);
		await recordReferralMetric(
			input.buyerId,
			"CUSTOMER_ACTIVE_DAYS",
			1,
			`${input.buyerId}:${occurredAt.toISOString().slice(0, 10)}`,
			{ occurredAt, transaction: input.transaction },
		);
		await createOrderCommissionEarnings({
			userId: input.buyerId,
			entityType: "CUSTOMER",
			sourceId: input.orderId,
			baseAmount: input.orderTotal,
			currency: input.currency,
			earnedAt: occurredAt,
			transaction: input.transaction,
		});
	}
	await createOrderCommissionEarnings({
		userId: input.vendorId,
		entityType: "VENDOR",
		sourceId: input.orderItemId,
		baseAmount: input.lineTotal,
		currency: input.currency,
		earnedAt: occurredAt,
		transaction: input.transaction,
	});
};
