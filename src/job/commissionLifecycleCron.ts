import cron from "node-cron";
import logger from "../middlewares/logger";
import { releaseMaturedCommissionEarnings } from "../services/commissionEngine.service";

export const processCommissionHoldingPeriods = async () => {
	try {
		const released = await releaseMaturedCommissionEarnings();
		if (released > 0) logger.info(`Released ${released} commission earnings from holding`);
	} catch (error) {
		logger.error("Error releasing held commission earnings:", error);
	}
};

const runCommissionLifecycleCron = () => {
	cron.schedule("*/15 * * * *", processCommissionHoldingPeriods);
};

export default runCommissionLifecycleCron;
