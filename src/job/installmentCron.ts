// job/installmentCron.ts
import cron from 'node-cron';
import logger from '../middlewares/logger';
import { InstallmentService } from '../services/installment.service';

const runInstallmentCron = () => {
  // Runs daily at 00:30 UTC
  cron.schedule('30 0 * * *', async () => {
    logger.info('[CRON] Running daily installment & layaway monitoring job...');
    try {
      await InstallmentService.processDailyInstallmentChecks();
    } catch (error) {
      logger.error('[CRON] Error in installment monitoring job:', error);
    }
  });

  logger.info('[CRON] Installment monitoring cron job scheduled: Daily at 00:30 UTC');
};

export default runInstallmentCron;
