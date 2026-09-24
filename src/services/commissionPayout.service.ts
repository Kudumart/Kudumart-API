import Decimal from "decimal.js";
import { Op } from "sequelize";
import CommissionEarning from "../models/commissionearning";
import CommissionPayout from "../models/commissionpayout";
import ReferralProgram from "../models/referralprogram";

export class CommissionPayoutError extends Error {}

export const createCommissionPayout = async (
	agentId: string,
	currency: string,
	earningIds?: string[],
) => {
	if (!CommissionPayout.sequelize) throw new Error("Database is not initialized");
	return CommissionPayout.sequelize.transaction(async (transaction) => {
		const where: Record<string, unknown> = {
			agentId,
			currency: currency.toUpperCase(),
			status: "AVAILABLE",
			payoutBatchId: null,
		};
		if (earningIds?.length) where.id = { [Op.in]: earningIds };
		const earnings = await CommissionEarning.findAll({
			where,
			include: [{ model: ReferralProgram, as: "program", attributes: ["minimumPayoutAmount"] }],
			transaction,
			lock: transaction.LOCK.UPDATE,
		});
		if (!earnings.length) throw new CommissionPayoutError("No available earnings match this payout");
		if (earningIds?.length && earnings.length !== new Set(earningIds).size) {
			throw new CommissionPayoutError("Some selected earnings are unavailable or do not belong to this agent and currency");
		}
		const total = earnings.reduce((sum, earning) => sum.plus(earning.amount), new Decimal(0));
		const minimum = earnings.reduce((maximum, earning) => {
			const program = earning.get("program") as ReferralProgram;
			return Decimal.max(maximum, new Decimal(program.minimumPayoutAmount || 0));
		}, new Decimal(0));
		if (total.lt(minimum)) throw new CommissionPayoutError(`Available balance must reach ${currency.toUpperCase()} ${minimum.toFixed(2)} before payout`);

		const payout = await CommissionPayout.create(
			{ agentId, currency: currency.toUpperCase(), totalAmount: total.toFixed(2), earningCount: earnings.length, status: "DRAFT" },
			{ transaction },
		);
		await CommissionEarning.update(
			{ payoutBatchId: payout.id },
			{ where: { id: { [Op.in]: earnings.map((earning) => earning.id) } }, transaction },
		);
		return payout;
	});
};

export const transitionCommissionPayout = async (
	payoutId: string,
	action: "APPROVE" | "MARK_PAID" | "CANCEL",
	options: { adminId?: string; paymentReference?: string } = {},
) => {
	if (!CommissionPayout.sequelize) throw new Error("Database is not initialized");
	return CommissionPayout.sequelize.transaction(async (transaction) => {
		const payout = await CommissionPayout.findByPk(payoutId, { transaction, lock: transaction.LOCK.UPDATE });
		if (!payout) throw new CommissionPayoutError("Commission payout not found");
		if (action === "APPROVE") {
			if (payout.status !== "DRAFT") throw new CommissionPayoutError("Only draft payouts can be approved");
			await payout.update({ status: "APPROVED", approvedBy: options.adminId, approvedAt: new Date() }, { transaction });
		} else if (action === "MARK_PAID") {
			if (payout.status !== "APPROVED" && payout.status !== "PROCESSING") throw new CommissionPayoutError("Only approved or processing payouts can be marked paid");
			if (!options.paymentReference) throw new CommissionPayoutError("Payment reference is required");
			const paidAt = new Date();
			await payout.update({ status: "PAID", paymentReference: options.paymentReference, paidAt }, { transaction });
			await CommissionEarning.update({ status: "PAID", paidAt }, { where: { payoutBatchId: payout.id, status: "AVAILABLE" }, transaction });
		} else {
			if (!["DRAFT", "APPROVED", "FAILED"].includes(payout.status)) throw new CommissionPayoutError("This payout cannot be cancelled");
			await payout.update({ status: "CANCELLED" }, { transaction });
			await CommissionEarning.update({ payoutBatchId: null }, { where: { payoutBatchId: payout.id, status: "AVAILABLE" }, transaction });
		}
		return payout;
	});
};
