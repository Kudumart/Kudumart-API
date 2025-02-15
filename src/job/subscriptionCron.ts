import cron from "node-cron";
import { Op } from "sequelize";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import JwtService from "../services/jwt.service";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import VendorSubscription from "../models/vendorsubscription";
import SubscriptionPlan from "../models/subscriptionplan";
import Notification from "../models/notification";

const runSubscriptionCron = () => {
    cron.schedule("0 0 * * *", async () => {
        logger.info('Welcome to kudumart cron job');
        try {
            const today = new Date(new Date().toISOString()); // Ensures UTC
            const nextWeek = new Date(new Date().toISOString()); // Ensures UTC
            nextWeek.setDate(today.getDate() + 7);

            // Handle Expired Subscriptions
            const expiredSubscriptions = await VendorSubscription.findAll({
                where: {
                    endDate: { [Op.lte]: today },
                    isActive: true,
                },
            });

            for (const subscription of expiredSubscriptions) {
                const freePlan = await SubscriptionPlan.findOne({ where: { name: "Free Plan" } });

                if (!freePlan) {
                    logger.error("Free plan not found.");
                    continue;
                }

                await subscription.update({ isActive: false });

                await VendorSubscription.create({
                    vendorId: subscription.vendorId,
                    subscriptionPlanId: freePlan.id,
                    startDate: today,
                    endDate: new Date(today.setFullYear(today.getFullYear() + 10)), // Long validity
                    isActive: true,
                });

                await Notification.create({
                    userId: subscription.vendorId,
                    title: "Subscription Expired",
                    message: "Your subscription has expired. You have been moved to the Free Plan.",
                    type: "subscription",
                    isRead: false,
                });

                logger.info(`Vendor ${subscription.vendorId} moved to Free Plan.`);
            }

            // Handle Expiry Reminders
            const subscriptionsExpiringSoon = await VendorSubscription.findAll({
                where: {
                    endDate: { [Op.eq]: nextWeek },
                    isActive: true,
                },
            });

            for (const subscription of subscriptionsExpiringSoon) {
                await Notification.create({
                    userId: subscription.vendorId,
                    title: "Subscription Expiry Reminder",
                    message: "Your subscription will expire in a week. Please renew to avoid interruption.",
                    type: "subscription",
                    isRead: false,
                });

                // await sendMail(
                //     subscription.vendor.email,
                //     "Subscription Expiry Reminder",
                //     "Your subscription will expire in a week. Please renew to continue enjoying our services."
                // );

                logger.info(`Reminder sent to vendor ${subscription.vendorId}.`);
            }

            logger.info("Cron job executed successfully.");
        } catch (error) {
            logger.error("Error in subscription expiry cron job:", error);
        }
    });
};

export default runSubscriptionCron;
