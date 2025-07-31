import cron from "node-cron";
import logger from "../middlewares/logger";
import {
	deleteAuctionReminder,
	sendAuctionReminders,
} from "../services/reminder.service";

// send auction reminders every day at 9 AM
export const auctionReminderJob = async () => {
	// Schedule the job to run every day at 9 AM
	cron.schedule("0 9 * * *", async () => {
		logger.info("Running auction status update...");

		try {
			await sendAuctionReminders();

			logger.info("Auction status updated successfully.");
		} catch (error) {
			logger.info("Error updating auction status:", error);
		}
	});
};

// Cleanup auction reminders every day at 10 AM
export const cleanupAuctionReminderJob = async () => {
	// Schedule the job to run every day at 10 AM
	cron.schedule("0 10 * * *", async () => {
		logger.info("Running auction reminder cleanup...");

		try {
			await deleteAuctionReminder();

			logger.info("Auction reminder cleanup completed successfully.");
		} catch (error) {
			logger.error("Error during auction reminder cleanup:", error);
		}
	});
};
