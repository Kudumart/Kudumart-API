// services/installmentNotification.service.ts
import logger from '../middlewares/logger';
import User from '../models/user';
import Admin from '../models/admin';
import Product from '../models/product';
import Notification from '../models/notification';
import AdminNotification from '../models/adminnotification';
import InstallmentPlan from '../models/installmentPlan';
import InstallmentMilestone from '../models/installmentMilestone';
import { sendMail } from './mail.service';
import { sendPushNotificationSingle, PushNotificationTypes } from '../firebase/pushNotification';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://kudumart.com').replace(/\/$/, '');
const APP_NAME = process.env.APP_NAME || 'KuduMart';
const LOGO_URL = process.env.LOGO_URL || `${FRONTEND_URL}/kudumart-logo.png`;

/**
 * Format currency amount
 */
const fmt = (amount: number | string | null | undefined): string => {
  const val = Number(amount || 0);
  return `₦${val.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Common responsive HTML email wrapper
 */
const wrapEmail = (title: string, bodyContent: string): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${APP_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; line-height: 1.6; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-info { background: #eff6ff; color: #1d4ed8; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .card-title { font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { color: #64748b; }
    .meta-value { font-weight: 600; color: #0f172a; text-align: right; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #cbd5e1; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 12px 28px; background: #e05326; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0; text-align: center; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">This email was sent by ${APP_NAME} regarding your account activity.</p>
      <p style="margin: 0;">For questions or assistance, contact support at <a href="mailto:support@kudumart.com" style="color: #0284c7;">support@kudumart.com</a></p>
    </div>
  </div>
</body>
</html>`;
};

export class InstallmentNotificationService {
  /**
   * Helper to fetch full plan details
   */
  private static async getHydratedPlan(planId: string) {
    return InstallmentPlan.findByPk(planId, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'buyer' },
        { model: User, as: 'vendor' },
        { model: InstallmentMilestone, as: 'milestones' },
      ],
    });
  }

  /**
   * Send notifications when a new plan is created and deposit is confirmed
   */
  public static async notifyPlanCreated(planId: string) {
    try {
      const plan = await this.getHydratedPlan(planId);
      if (!plan) return;

      const buyer = plan.buyer as any;
      const vendor = plan.vendor as any;
      const product = plan.product as any;
      const milestones = ((plan.milestones as any[]) || []).sort(
        (a, b) => a.installmentNumber - b.installmentNumber
      );

      const planRef = plan.id.substring(0, 8).toUpperCase();
      const planUrl = `${FRONTEND_URL}/account/installments`;
      const isBnpl = plan.mode === 'bnpl';
      const modeLabel = isBnpl ? 'Buy Now Pay Later (BNPL)' : 'Layaway Reservation';

      // ----------------------------------------------------
      // 1. Notify BUYER
      // ----------------------------------------------------
      if (buyer?.email) {
        const milestoneRows = milestones
          .map(
            (m) => `<tr>
              <td><strong>#${m.installmentNumber}</strong></td>
              <td>${new Date(m.dueDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              <td>${fmt(m.amount)}</td>
              <td><span class="badge ${m.status === 'paid' ? 'badge-success' : 'badge-info'}">${m.status}</span></td>
            </tr>`
          )
          .join('');

        const buyerHtml = wrapEmail(
          `${modeLabel} Confirmed`,
          `
          <span class="badge badge-success">Payment Received</span>
          <h2 style="margin: 0 0 12px 0; color: #0f172a;">${modeLabel} Confirmed!</h2>
          <p>Hi <strong>${buyer.firstName || 'Shopper'}</strong>,</p>
          <p>Your deposit has been verified and your ${isBnpl ? 'installment purchase' : 'exclusive layaway reservation'} for <strong>"${product?.name || 'Product'}"</strong> is now active!</p>
          
          <div class="card">
            <div class="card-title">Order & Payment Overview</div>
            <div class="meta-row">
              <span class="meta-label">Plan Reference:</span>
              <span class="meta-value">#${planRef}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Product:</span>
              <span class="meta-value">${product?.name || 'Item'}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Total Order Value:</span>
              <span class="meta-value">${fmt(plan.totalAmount)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Deposit Paid Today:</span>
              <span class="meta-value" style="color: #16a34a;">${fmt(plan.depositAmount)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Remaining Balance:</span>
              <span class="meta-value">${fmt(plan.remainingBalance)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Reserved Until:</span>
              <span class="meta-value">${new Date(plan.reservedUntil).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <h3 style="font-size: 15px; margin: 20px 0 8px 0; color: #0f172a;">Payment Schedule</h3>
          <table>
            <thead>
              <tr>
                <th>Payment</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${milestoneRows}
            </tbody>
          </table>

          <p style="font-size: 13px; color: #475569;">
            ${isBnpl
              ? 'Your order is currently being prepared for dispatch.'
              : 'Your item has been taken off public inventory and is held safely for you. You can make milestone payments anytime from your account.'}
          </p>

          <div style="text-align: center;">
            <a href="${planUrl}" class="btn">View & Manage Layaway</a>
          </div>
          `
        );

        sendMail(buyer.email, `[${APP_NAME}] ${modeLabel} Confirmed - Deposit Received (#${planRef})`, buyerHtml).catch((err) =>
          logger.error('Failed to send buyer plan creation email:', err)
        );
      }

      // ----------------------------------------------------
      // 2. Notify VENDOR
      // ----------------------------------------------------
      if (vendor?.email) {
        const vendorHtml = wrapEmail(
          `New ${modeLabel} Order`,
          `
          <span class="badge badge-info">Action Required</span>
          <h2 style="margin: 0 0 12px 0; color: #0f172a;">New ${modeLabel} on Your Product</h2>
          <p>Hi <strong>${vendor.store?.name || vendor.firstName || 'Vendor'}</strong>,</p>
          <p>A customer has placed an installment order for your product <strong>"${product?.name || 'Product'}"</strong>.</p>
          
          <div class="card">
            <div class="card-title">Reservation Details</div>
            <div class="meta-row">
              <span class="meta-label">Plan Reference:</span>
              <span class="meta-value">#${planRef}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Item:</span>
              <span class="meta-value">${product?.name || 'Product'}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Customer Deposit:</span>
              <span class="meta-value">${fmt(plan.depositAmount)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Total Product Price:</span>
              <span class="meta-value">${fmt(plan.productPrice)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Reservation Policy:</span>
              <span class="meta-value">${isBnpl ? 'Dispatch Immediately' : 'Hold Stock Until 100% Paid'}</span>
            </div>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <strong style="color: #92400e; font-size: 13px;">⚠️ Inventory Notice:</strong>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #78350f;">
              ${isBnpl
                ? 'This is a Buy Now Pay Later purchase. Please package and dispatch the order to the buyer.'
                : '1 unit has been automatically deducted from your active stock. Please keep this product safely reserved. Once the buyer completes full payment, you will receive full payout and dispatch confirmation.'}
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/seller/orders" class="btn">View in Seller Workspace</a>
          </div>
          `
        );

        sendMail(vendor.email, `[${APP_NAME}] Product Reserved on ${modeLabel} (#${planRef})`, vendorHtml).catch((err) =>
          logger.error('Failed to send vendor plan creation email:', err)
        );

        // Push notification to vendor if registered
        if (vendor.fcmToken) {
          sendPushNotificationSingle({
            notification: {
              title: `New ${modeLabel}`,
              body: `Product "${product?.name}" reserved. Stock locked.`,
            },
            data: { planId: plan.id, type: PushNotificationTypes.ORDER_CREATED },
            token: vendor.fcmToken,
          }).catch((err) => logger.error('Failed to send vendor push notification:', err));
        }
      }

      // ----------------------------------------------------
      // 3. Notify ADMIN
      // ----------------------------------------------------
      const adminUsers = await Admin.findAll({ limit: 5 });
      const adminEmails = adminUsers.map((a: any) => a.email).filter(Boolean);
      const primaryAdminEmail = adminEmails[0] || process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || 'support@kudumart.com';

      // Create in-app AdminNotification
      await AdminNotification.create({
        type: 'installment_opened',
        message: `New ${modeLabel} plan (#${planRef}) opened for "${product?.name}" by ${buyer?.firstName || 'Buyer'} (${buyer?.email}). Deposit: ${fmt(plan.depositAmount)}.`,
        data: { planId: plan.id, buyerId: buyer?.id, vendorId: vendor?.id },
        read: false,
      }).catch((err) => logger.error('Failed to create AdminNotification:', err));

      const adminHtml = wrapEmail(
        `New Installment Plan Opened`,
        `
        <span class="badge badge-info">Admin Alert</span>
        <h2 style="margin: 0 0 12px 0; color: #0f172a;">New ${modeLabel} (#${planRef})</h2>
        <p>A new customer installment transaction has been initialized and deposit confirmed.</p>

        <div class="card">
          <div class="card-title">Transaction Overview</div>
          <div class="meta-row">
            <span class="meta-label">Plan ID:</span>
            <span class="meta-value">#${planRef}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Buyer:</span>
            <span class="meta-value">${buyer?.firstName || ''} ${buyer?.lastName || ''} (${buyer?.email})</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Vendor:</span>
            <span class="meta-value">${vendor?.store?.name || vendor?.firstName || 'Seller'} (${vendor?.email || 'N/A'})</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Product:</span>
            <span class="meta-value">${product?.name || 'N/A'}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Deposit Collected:</span>
            <span class="meta-value" style="color: #16a34a;">${fmt(plan.depositAmount)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Total Value:</span>
            <span class="meta-value">${fmt(plan.totalAmount)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Tenure Duration:</span>
            <span class="meta-value">${plan.numberOfInstallments} payments over ${plan.tenureDays} days</span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="${FRONTEND_URL}/admin/installments" class="btn">View in Admin Workspace</a>
        </div>
        `
      );

      sendMail(primaryAdminEmail, `[${APP_NAME} Admin] New Installment Plan Opened (#${planRef})`, adminHtml).catch((err) =>
        logger.error('Failed to send admin plan creation email:', err)
      );
    } catch (err) {
      logger.error('Error in notifyPlanCreated:', err);
    }
  }

  /**
   * Send notifications when a subsequent milestone is paid
   */
  public static async notifyMilestonePaid(milestoneId: string) {
    try {
      const milestone = await InstallmentMilestone.findByPk(milestoneId, {
        include: [
          {
            model: InstallmentPlan,
            as: 'plan',
            include: [
              { model: Product, as: 'product' },
              { model: User, as: 'buyer' },
              { model: User, as: 'vendor' },
              { model: InstallmentMilestone, as: 'milestones' },
            ],
          },
        ],
      });

      if (!milestone || !milestone.plan) return;

      const plan = milestone.plan as any;
      const buyer = plan.buyer as any;
      const vendor = plan.vendor as any;
      const product = plan.product as any;
      const planRef = plan.id.substring(0, 8).toUpperCase();

      const isCompleted = plan.status === 'completed';

      // ----------------------------------------------------
      // In-App Notification to Buyer
      // ----------------------------------------------------
      await Notification.create({
        userId: plan.userId,
        title: isCompleted ? '🎉 Layaway 100% Paid Off!' : `Payment Received for Milestone #${milestone.installmentNumber}`,
        type: isCompleted ? 'order_completed' : 'payment_received',
        message: isCompleted
          ? `Congratulations! Your installment plan for "${product?.name}" is fully paid. Your order is now ready for fulfillment.`
          : `Milestone #${milestone.installmentNumber} payment (${fmt(milestone.amount)}) has been confirmed. Remaining balance: ${fmt(plan.remainingBalance)}.`,
      }).catch((err) => logger.error('Failed to create milestone buyer notification:', err));

      // ----------------------------------------------------
      // Email to Buyer
      // ----------------------------------------------------
      if (buyer?.email) {
        const buyerHtml = wrapEmail(
          isCompleted ? 'Layaway 100% Complete!' : `Milestone #${milestone.installmentNumber} Receipt`,
          `
          <span class="badge badge-success">${isCompleted ? 'Fully Settled' : 'Payment Verified'}</span>
          <h2 style="margin: 0 0 12px 0; color: #0f172a;">${isCompleted ? '🎉 Layaway 100% Settled!' : `Payment Receipt — Milestone #${milestone.installmentNumber}`}</h2>
          <p>Hi <strong>${buyer.firstName || 'Shopper'}</strong>,</p>
          <p>${isCompleted
            ? `Congratulations! You have completed all scheduled payments for <strong>"${product?.name}"</strong>. Your order is now being dispatched for delivery!`
            : `We have successfully received and recorded your installment payment for <strong>"${product?.name}"</strong>.`
          }</p>

          <div class="card">
            <div class="card-title">Payment Summary</div>
            <div class="meta-row">
              <span class="meta-label">Plan Reference:</span>
              <span class="meta-value">#${planRef}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Payment Milestone:</span>
              <span class="meta-value">#${milestone.installmentNumber} of ${plan.numberOfInstallments}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Amount Paid:</span>
              <span class="meta-value" style="color: #16a34a;">${fmt(milestone.amount)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Remaining Balance:</span>
              <span class="meta-value">${fmt(plan.remainingBalance)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Plan Status:</span>
              <span class="meta-value" style="text-transform: capitalize;">${plan.status}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/account/installments" class="btn">View My Layaways</a>
          </div>
          `
        );

        sendMail(buyer.email, `[${APP_NAME}] ${isCompleted ? '🎉 Layaway Completed!' : `Milestone #${milestone.installmentNumber} Receipt`} (#${planRef})`, buyerHtml).catch((err) =>
          logger.error('Failed to send milestone email to buyer:', err)
        );
      }

      // ----------------------------------------------------
      // If 100% Completed -> Notify Vendor & Admin to dispatch!
      // ----------------------------------------------------
      if (isCompleted) {
        if (vendor?.email) {
          await Notification.create({
            userId: vendor.id,
            title: 'Layaway Paid in Full — Dispatch Now!',
            type: 'order_completed',
            message: `Layaway plan #${planRef} for "${product?.name}" has reached 100% payment! Please package and dispatch the order to the buyer.`,
          }).catch((err) => logger.error('Failed to create completion notification for vendor:', err));

          const vendorHtml = wrapEmail(
            `Order Ready to Ship`,
            `
            <span class="badge badge-success">Payment Complete</span>
            <h2 style="margin: 0 0 12px 0; color: #0f172a;">Layaway Order Paid in Full!</h2>
            <p>Hi <strong>${vendor.store?.name || vendor.firstName || 'Vendor'}</strong>,</p>
            <p>Great news! The customer has completed 100% of their installment payments for <strong>"${product?.name}"</strong>.</p>
            
            <div class="card">
              <div class="card-title">Fulfillment Instructions</div>
              <div class="meta-row">
                <span class="meta-label">Plan Reference:</span>
                <span class="meta-value">#${planRef}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Item to Ship:</span>
                <span class="meta-value">${product?.name}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Shipping Address:</span>
                <span class="meta-value">${typeof plan.shippingAddress === 'string' ? plan.shippingAddress : JSON.stringify(plan.shippingAddress || 'Customer pickup/address')}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Total Payout:</span>
                <span class="meta-value" style="color: #16a34a;">${fmt(plan.productPrice)}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${FRONTEND_URL}/seller/orders" class="btn">View in Seller Workspace</a>
            </div>
            `
          );

          sendMail(vendor.email, `[${APP_NAME}] 📦 Layaway Paid in Full — Ready to Ship (#${planRef})`, vendorHtml).catch((err) =>
            logger.error('Failed to send vendor completion email:', err)
          );
        }

        // Notify Admin of 100% completion
        await AdminNotification.create({
          type: 'installment_completed',
          message: `Installment plan #${planRef} for "${product?.name}" reached 100% settlement. Order is ready for fulfillment.`,
          data: { planId: plan.id },
          read: false,
        }).catch((err) => logger.error('Failed to create AdminNotification for completion:', err));
      }
    } catch (err) {
      logger.error('Error in notifyMilestonePaid:', err);
    }
  }

  /**
   * Send notifications when a plan is cancelled or defaulted
   */
  public static async notifyPlanCancelled(
    planId: string,
    refundDetails: { depositAmount: number; restockingFee: number; netRefund: number; vendorCompensation: number },
    reason: 'default' | 'buyer_cancelled' | 'admin_cancelled'
  ) {
    try {
      const plan = await this.getHydratedPlan(planId);
      if (!plan) return;

      const buyer = plan.buyer as any;
      const vendor = plan.vendor as any;
      const product = plan.product as any;
      const planRef = plan.id.substring(0, 8).toUpperCase();

      const reasonLabel =
        reason === 'default'
          ? 'Grace period expired after missed milestone'
          : reason === 'buyer_cancelled'
          ? 'Voluntary cancellation by buyer'
          : 'Administrative cancellation';

      // ----------------------------------------------------
      // 1. Notify BUYER
      // ----------------------------------------------------
      await Notification.create({
        userId: plan.userId,
        title: 'Layaway Cancelled — Wallet Refund Issued',
        type: 'refund_processed',
        message: `Your layaway for "${product?.name}" has been cancelled (${reasonLabel}). A refund of ${fmt(refundDetails.netRefund)} (after ${fmt(refundDetails.restockingFee)} restocking fee) was credited to your KuduMart Wallet.`,
      }).catch((err) => logger.error('Failed to create cancellation notification for buyer:', err));

      if (buyer?.email) {
        const buyerHtml = wrapEmail(
          'Layaway Cancellation & Refund',
          `
          <span class="badge badge-warning">Plan Cancelled</span>
          <h2 style="margin: 0 0 12px 0; color: #0f172a;">Layaway Cancelled & Refund Processed</h2>
          <p>Hi <strong>${buyer.firstName || 'Shopper'}</strong>,</p>
          <p>Your layaway plan for <strong>"${product?.name}"</strong> has been closed (${reasonLabel}). The held item has returned to inventory and your refund has been credited directly to your KuduMart Wallet.</p>

          <div class="card">
            <div class="card-title">Refund Breakdown</div>
            <div class="meta-row">
              <span class="meta-label">Plan Reference:</span>
              <span class="meta-value">#${planRef}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Total Deposits Paid:</span>
              <span class="meta-value">${fmt(refundDetails.depositAmount)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Restocking Fee (8%):</span>
              <span class="meta-value" style="color: #dc2626;">-${fmt(refundDetails.restockingFee)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Net Credited to Wallet:</span>
              <span class="meta-value" style="color: #16a34a; font-size: 16px;">${fmt(refundDetails.netRefund)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Refund Destination:</span>
              <span class="meta-value">KuduMart Buyer Wallet (Available Immediately)</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/account" class="btn">View My Wallet</a>
          </div>
          `
        );

        sendMail(buyer.email, `[${APP_NAME}] Layaway Cancelled & Wallet Refund (#${planRef})`, buyerHtml).catch((err) =>
          logger.error('Failed to send buyer cancellation email:', err)
        );
      }

      // ----------------------------------------------------
      // 2. Notify VENDOR
      // ----------------------------------------------------
      if (vendor?.email) {
        await Notification.create({
          userId: vendor.id,
          title: 'Layaway Item Restocked to Inventory',
          type: 'inventory_restocked',
          message: `Layaway plan #${planRef} for "${product?.name}" was cancelled. 1 unit has been restored to your active store inventory and ${fmt(refundDetails.vendorCompensation)} vendor compensation was credited to your wallet.`,
        }).catch((err) => logger.error('Failed to create cancellation notification for vendor:', err));

        const vendorHtml = wrapEmail(
          'Layaway Item Restocked',
          `
          <span class="badge badge-info">Inventory Restored</span>
          <h2 style="margin: 0 0 12px 0; color: #0f172a;">Product Restocked to Your Store</h2>
          <p>Hi <strong>${vendor.store?.name || vendor.firstName || 'Vendor'}</strong>,</p>
          <p>The layaway reservation for <strong>"${product?.name}"</strong> was cancelled (${reasonLabel}).</p>

          <div class="card">
            <div class="card-title">Restock & Compensation Details</div>
            <div class="meta-row">
              <span class="meta-label">Plan Reference:</span>
              <span class="meta-value">#${planRef}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Product Restocked:</span>
              <span class="meta-value">${product?.name} (+1 stock)</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Inventory Status:</span>
              <span class="meta-value" style="color: #16a34a;">Available for Public Sale</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Vendor Compensation Share:</span>
              <span class="meta-value" style="color: #16a34a;">${fmt(refundDetails.vendorCompensation)}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${FRONTEND_URL}/seller/products" class="btn">View Store Inventory</a>
          </div>
          `
        );

        sendMail(vendor.email, `[${APP_NAME}] Layaway Item Restocked (#${planRef})`, vendorHtml).catch((err) =>
          logger.error('Failed to send vendor cancellation email:', err)
        );
      }

      // ----------------------------------------------------
      // 3. Notify ADMIN
      // ----------------------------------------------------
      await AdminNotification.create({
        type: 'installment_cancelled',
        message: `Layaway plan #${planRef} for "${product?.name}" was cancelled (${reasonLabel}). Stock restocked, buyer refunded ${fmt(refundDetails.netRefund)}.`,
        data: { planId: plan.id, reason },
        read: false,
      }).catch((err) => logger.error('Failed to create AdminNotification for cancellation:', err));
    } catch (err) {
      logger.error('Error in notifyPlanCancelled:', err);
    }
  }
}

export default InstallmentNotificationService;
