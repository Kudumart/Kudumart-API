import cron from "node-cron";
import logger from "../middlewares/logger";
import { updateDropshipProductsJob } from "../services/dropshipProductUpdate.service";

let isJobRunning = false;

/**
 * Runs the dropship product update cron job
 * Schedules the job to run every 2 hours
 */
const runDropshipCron = () => {
	// Run every 2 hours
	cron.schedule("0 */2 * * *", async () => {
		// Prevent overlapping executions
		if (isJobRunning) {
			logger.warn("Dropship sync job already running, skipping this execution");
			return;
		}

		isJobRunning = true;
		logger.info("Starting dropship products sync job");

		try {
			const stats = await updateDropshipProductsJob();

			logger.info("Dropship sync job completed successfully", {
				totalProcessed: stats.totalProcessed,
				successCount: stats.successCount,
				errorCount: stats.errorCount,
				deletedCount: stats.deletedCount,
				duration: `${((Date.now() - stats.startTime.getTime()) / 1000).toFixed(2)}s`,
			});
		} catch (error) {
			logger.error("Error in dropship sync job:", error);
		} finally {
			isJobRunning = false;
		}
	});

	logger.info("Dropship cron job scheduled:  Runs every 2 hours");
};

export default runDropshipCron;
