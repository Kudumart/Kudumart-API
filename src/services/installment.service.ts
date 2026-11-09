// services/installment.service.ts
import { Op } from 'sequelize';
import logger from '../middlewares/logger';
import InstallmentConfig, { defaultTenures } from '../models/installmentConfig';
import InstallmentPlan from '../models/installmentPlan';
import InstallmentMilestone from '../models/installmentMilestone';
import Product from '../models/product';
import User from '../models/user';
import Transaction from '../models/transaction';
import Notification from '../models/notification';
import sequelizeService from './sequelize.service';
import { sendMail } from './mail.service';

export class InstallmentService {
  /**
   * Helper to fetch active config
   */
  static async getConfig(): Promise<InstallmentConfig> {
    let config = await InstallmentConfig.findOne();
    if (!config) {
      config = await InstallmentConfig.create({
        system_mode: 'layaway_only',
        fulfillment_trigger: 'on_completion',
        min_order_amount: 25000.0,
        max_order_amount: 2000000.0,
        min_deposit_percentage: 25,
        allowed_tenures: defaultTenures,
        financing_fee_percentage: 0.0,
        grace_period_days: 5,
        cancellation_fee_percentage: 8.0,
        vendor_split_percentage: 50.0,
        refund_to_wallet: true,
        eligible_categories: [],
        vendor_restriction: 'all_vendors',
      });
    }
    return config;
  }

  /**
   * Handles plan default (grace period expired) or voluntary cancellation
   */
  static async handlePlanDefaultOrCancellation(
    planId: string,
    reason: 'grace_period_expired' | 'buyer_cancelled' | 'admin_cancelled',
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const transaction = await sequelizeService.connection!.transaction();
    try {
      const plan = await InstallmentPlan.findByPk(planId, {
        include: [
          { model: Product, as: 'product' },
          { model: User, as: 'buyer' },
          { model: User, as: 'vendor' },
          { model: InstallmentMilestone, as: 'milestones' },
        ],
        transaction,
      });

      if (!plan) {
        await transaction.rollback();
        return { status: false, message: 'Installment plan not found' };
      }

      if (plan.status !== 'active') {
        await transaction.rollback();
        return { status: false, message: `Plan is already ${plan.status}` };
      }

      const config = await this.getConfig();

      // 1. Restock Product (Return reserved item back to active inventory)
      const product = plan.product;
      if (product) {
        await product.update(
          { quantity: (product.quantity || 0) + 1 },
          { transaction },
        );
        logger.info(`[INSTALLMENT] Product "${product.name}" restocked (+1). New qty: ${(product.quantity || 0) + 1}`);
      }

      // 2. Financial Calculations
      const totalPaid = Math.max(0, Number(plan.totalAmount) - Number(plan.remainingBalance));
      const cancellationFeePct = Number(config.cancellation_fee_percentage) || 8.0;
      const vendorSplitPct = Number(config.vendor_split_percentage) || 50.0;

      // Restocking fee calculated against product price
      const restockingFee = Math.round(((Number(plan.productPrice) * cancellationFeePct) / 100) * 100) / 100;
      // Vendor compensation portion
      const vendorCompensation = Math.round(((restockingFee * vendorSplitPct) / 100) * 100) / 100;
      // Actual buyer refund
      const buyerRefund = Math.max(0, Math.round((totalPaid - restockingFee) * 100) / 100);

      // 3. Compensate Vendor for holding inventory
      const vendor = plan.vendor;
      if (vendor && vendorCompensation > 0) {
        vendor.wallet = Math.round((Number(vendor.wallet || 0) + vendorCompensation) * 100) / 100;
        await vendor.save({ transaction });

        await Transaction.create(
          {
            userId: vendor.id,
            amount: vendorCompensation,
            currency: 'NGN',
            transactionType: 'layaway_compensation',
            refId: plan.id,
            status: 'completed',
            metadata: {
              planId: plan.id,
              productName: product?.name,
              reason,
            },
          },
          { transaction },
        );

        await Notification.create(
          {
            userId: vendor.id,
            title: 'Layaway Holding Fee Credited',
            type: 'payout',
            message: `A layaway plan for "${product?.name || 'an item'}" was ${reason === 'grace_period_expired' ? 'defaulted' : 'cancelled'}. Item returned to inventory and ₦${vendorCompensation.toLocaleString()} holding compensation has been credited to your wallet.`,
          },
          { transaction },
        );
      }

      // 4. Refund Buyer
      const buyer = plan.buyer;
      if (buyer && buyerRefund > 0) {
        if (config.refund_to_wallet) {
          buyer.wallet = Math.round((Number(buyer.wallet || 0) + buyerRefund) * 100) / 100;
          await buyer.save({ transaction });

          await Transaction.create(
            {
              userId: buyer.id,
              amount: buyerRefund,
              currency: 'NGN',
              transactionType: 'layaway_refund',
              refId: plan.id,
              status: 'completed',
              metadata: {
                planId: plan.id,
                totalPaid,
                restockingFee,
                reason,
              },
            },
            { transaction },
          );

          await Notification.create(
            {
              userId: buyer.id,
              title: reason === 'grace_period_expired' ? 'Layaway Plan Expired & Refunded' : 'Layaway Cancelled & Refunded',
              type: 'refund',
              message: `Your layaway reservation for "${product?.name || 'your item'}" was closed. A refund of ₦${buyerRefund.toLocaleString()} (after ₦${restockingFee.toLocaleString()} restocking fee) has been credited to your KuduMart Wallet.`,
            },
            { transaction },
          );
        }
      }

      // 5. Update Plan & Milestone Statuses
      const finalStatus = reason === 'grace_period_expired' ? 'defaulted' : 'cancelled';
      await plan.update(
        {
          status: finalStatus,
          defaultedAt: new Date(),
        },
        { transaction },
      );

      // Cancel remaining pending milestones
      await InstallmentMilestone.update(
        { status: 'cancelled' },
        {
          where: {
            planId: plan.id,
            status: { [Op.in]: ['pending', 'overdue'] },
          },
          transaction,
        },
      );

      await transaction.commit();

      // Send Email to Buyer (non-blocking)
      if (buyer?.email) {
        try {
          await sendMail(
            buyer.email,
            `KuduMart: Layaway Plan ${reason === 'grace_period_expired' ? 'Expired' : 'Cancelled'}`,
            `
              <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
                <h2>Layaway Reservation Notice</h2>
                <p>Hello ${buyer.firstName || 'Customer'},</p>
                <p>Your layaway plan for <strong>"${product?.name || 'your item'}"</strong> has been ${reason === 'grace_period_expired' ? 'closed due to the grace period expiring' : 'cancelled'}.</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <p><strong>Total Paid:</strong> ₦${totalPaid.toLocaleString()}</p>
                  <p><strong>Restocking Fee (${cancellationFeePct}%):</strong> ₦${restockingFee.toLocaleString()}</p>
                  <p><strong>Refund Amount:</strong> ₦${buyerRefund.toLocaleString()}</p>
                  <p><strong>Refund Destination:</strong> ${config.refund_to_wallet ? 'Your KuduMart Wallet' : 'Original Payment Method'}</p>
                </div>
                <p>The product has been returned to active inventory. If you have questions, please reach out to our support team.</p>
                <p>Warm regards,<br/>The KuduMart Team</p>
              </div>
            `,
          );
        } catch (mailErr) {
          logger.error('[INSTALLMENT] Error sending cancellation email:', mailErr);
        }
      }

      return {
        status: true,
        message: `Plan marked as ${finalStatus}. Product restocked and refunds processed.`,
        data: {
          planId: plan.id,
          status: finalStatus,
          restockingFee,
          vendorCompensation,
          buyerRefund,
        },
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('[INSTALLMENT] Error handling plan default/cancellation:', error);
      return {
        status: false,
        message: error instanceof Error ? error.message : 'Failed to process plan default',
      };
    }
  }

  /**
   * Daily background job to process overdue plans, expiration, and reminders
   */
  static async processDailyInstallmentChecks(): Promise<void> {
    logger.info('[INSTALLMENT CRON] Starting daily installment inspection...');
    const now = new Date();

    try {
      // 1. Process Expired Plans (where reservedUntil date has passed)
      const expiredPlans = await InstallmentPlan.findAll({
        where: {
          status: 'active',
          reservedUntil: { [Op.lt]: now },
        },
      });

      logger.info(`[INSTALLMENT CRON] Found ${expiredPlans.length} expired plans past grace period.`);
      for (const plan of expiredPlans) {
        await this.handlePlanDefaultOrCancellation(plan.id, 'grace_period_expired');
      }

      // 2. Mark Overdue Milestones & Send Grace Period Warnings
      const overdueMilestones = await InstallmentMilestone.findAll({
        where: {
          status: 'pending',
          dueDate: { [Op.lt]: now },
        },
        include: [
          {
            model: InstallmentPlan,
            as: 'plan',
            where: { status: 'active' },
            include: [
              { model: Product, as: 'product' },
              { model: User, as: 'buyer' },
            ],
          },
        ],
      });

      logger.info(`[INSTALLMENT CRON] Found ${overdueMilestones.length} overdue milestones.`);
      for (const ms of overdueMilestones) {
        await ms.update({ status: 'overdue' });
        const buyer = (ms as any).plan?.buyer;
        const product = (ms as any).plan?.product;
        const reservedUntil = (ms as any).plan?.reservedUntil;

        if (buyer) {
          await Notification.create({
            userId: buyer.id,
            title: 'Urgent: Installment Milestone Overdue',
            type: 'reminder',
            message: `Milestone #${ms.installmentNumber} of ₦${Number(ms.amount).toLocaleString()} for "${product?.name || 'your item'}" is overdue. Please settle payment before ${reservedUntil ? new Date(reservedUntil).toLocaleDateString() : 'grace period ends'} to avoid cancellation and restocking fees.`,
          });
        }
      }

      // 3. Send Upcoming Due Date Reminders (3 days and 1 day out)
      const in3DaysStart = new Date(now.getTime() + 2 * 86400000);
      const in3DaysEnd = new Date(now.getTime() + 4 * 86400000);

      const upcomingMilestones = await InstallmentMilestone.findAll({
        where: {
          status: 'pending',
          dueDate: {
            [Op.between]: [in3DaysStart, in3DaysEnd],
          },
        },
        include: [
          {
            model: InstallmentPlan,
            as: 'plan',
            where: { status: 'active' },
            include: [
              { model: Product, as: 'product' },
              { model: User, as: 'buyer' },
            ],
          },
        ],
      });

      for (const ms of upcomingMilestones) {
        const buyer = (ms as any).plan?.buyer;
        const product = (ms as any).plan?.product;

        if (buyer) {
          await Notification.create({
            userId: buyer.id,
            title: 'Upcoming Installment Payment Reminder',
            type: 'reminder',
            message: `Milestone #${ms.installmentNumber} of ₦${Number(ms.amount).toLocaleString()} for "${product?.name || 'your item'}" is due on ${new Date(ms.dueDate).toLocaleDateString()}. Keep your reservation active by settling on time.`,
          });
        }
      }

      logger.info('[INSTALLMENT CRON] Daily inspection completed successfully.');
    } catch (err) {
      logger.error('[INSTALLMENT CRON] Error executing daily checks:', err);
    }
  }
}

export default InstallmentService;
