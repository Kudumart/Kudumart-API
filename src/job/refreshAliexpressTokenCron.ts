import cron from "node-cron";
import logger from "../middlewares/logger";
import { refreshDropshippingCredsJob } from "../services/refreshAliexpressAccessToken.service";

let isJobRunning = false;

/**
 * Runs the dropshipping credentials refresh cron job
 * Executes daily at 2: 00 AM to refresh expiring tokens
 */
const runDropshippingCredsRefreshCron = () => {
	// Run daily at 2:00 AM
	cron.schedule("0 2 * * *", async () => {
		// Prevent overlapping executions
		if (isJobRunning) {
			logger.warn(
				"Dropshipping credentials refresh job already running, skipping this execution",
			);
			return;
		}

		isJobRunning = true;

		try {
			const stats = await refreshDropshippingCredsJob();

			logger.info(
				"Dropshipping credentials refresh job completed successfully",
			);

			// Optional: Send alert if there were errors
			if (stats.errorCount > 0) {
				logger.warn(
					`!  ${stats.errorCount} vendor(s) failed to refresh credentials`,
				);
				// You can send email/slack notification here
			}
		} catch (error: any) {
			logger.error("Error in dropshipping credentials refresh job:", error);
		} finally {
			isJobRunning = false;
		}
	});

	logger.info(
		"Dropshipping credentials refresh cron job scheduled:  Daily at 2:00 AM",
	);
};

export default runDropshippingCredsRefreshCron;
