import cron from "node-cron";
import { Op } from "sequelize";
import Withdrawal from "../models/withdrawal";
import User from "../models/user";
import Transaction from "../models/transaction";
import Notification from "../models/notification";
import sequelizeService from "../services/sequelize.service";
import logger from "../middlewares/logger";
import Decimal from "decimal.js";

// Run every Sunday at midnight
cron.schedule("0 0 * * 0", async () => {
    logger.info("Running scheduled payout job...");
    await processScheduledPayouts();
});

export const processScheduledPayouts = async () => {
    const transaction = await sequelizeService.connection!.transaction();
    try {
        // Find all pending withdrawals that are marked for automatic processing 
        // Or simply all pending ones if the policy is to pay out weekly.
        const pendingWithdrawals = await Withdrawal.findAll({
            where: { status: "pending" },
            include: [{ model: User, as: "vendor" }],
            transaction
        });

        logger.info(`Found ${pendingWithdrawals.length} pending withdrawals to process.`);

        for (const withdrawal of pendingWithdrawals) {
            // Here you would integrate with Paystack Transfer or Stripe Payouts API
            // For now, we simulate success for demonstration purposes.

            withdrawal.status = "approved";
            withdrawal.note = "Processed via scheduled payout.";
            await withdrawal.save({ transaction });

            // Update Transaction record
            const tx = await Transaction.findOne({
                where: { refId: withdrawal.id, transactionType: "withdrawal" },
                transaction
            });

            if (tx) {
                tx.status = "completed";
                await tx.save({ transaction });
            }

            // Notify Vendor
            await Notification.create({
                userId: withdrawal.vendorId,
                title: "Payout Processed",
                type: "withdrawal_status",
                message: `Your scheduled payout of ${withdrawal.currency} ${withdrawal.amount} has been processed successfully.`
            }, { transaction });
        }

        await transaction.commit();
        logger.info("Scheduled payout job completed successfully.");
    } catch (error) {
        await transaction.rollback();
        logger.error("Error in scheduled payout job:", error);
    }
};
