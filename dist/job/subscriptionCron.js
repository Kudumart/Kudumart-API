"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("../middlewares/logger")); // Adjust the path to your logger.js
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const notification_1 = __importDefault(require("../models/notification"));
const runSubscriptionCron = () => {
    node_cron_1.default.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Welcome to kudumart cron job');
        try {
            const today = new Date(new Date().toISOString()); // Ensures UTC
            const nextWeek = new Date(new Date().toISOString()); // Ensures UTC
            nextWeek.setDate(today.getDate() + 7);
            // Handle Expired Subscriptions
            const expiredSubscriptions = yield vendorsubscription_1.default.findAll({
                where: {
                    endDate: { [sequelize_1.Op.lte]: today },
                    isActive: true,
                },
            });
            for (const subscription of expiredSubscriptions) {
                const freePlan = yield subscriptionplan_1.default.findOne({ where: { name: "Free Plan" } });
                if (!freePlan) {
                    logger_1.default.error("Free plan not found.");
                    continue;
                }
                yield subscription.update({ isActive: false });
                yield vendorsubscription_1.default.create({
                    vendorId: subscription.vendorId,
                    subscriptionPlanId: freePlan.id,
                    startDate: today,
                    endDate: new Date(today.setFullYear(today.getFullYear() + 10)),
                    isActive: true,
                });
                yield notification_1.default.create({
                    userId: subscription.vendorId,
                    title: "Subscription Expired",
                    message: "Your subscription has expired. You have been moved to the Free Plan.",
                    type: "subscription",
                    isRead: false,
                });
                logger_1.default.info(`Vendor ${subscription.vendorId} moved to Free Plan.`);
            }
            // Handle Expiry Reminders
            const subscriptionsExpiringSoon = yield vendorsubscription_1.default.findAll({
                where: {
                    endDate: { [sequelize_1.Op.eq]: nextWeek },
                    isActive: true,
                },
            });
            for (const subscription of subscriptionsExpiringSoon) {
                yield notification_1.default.create({
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
                logger_1.default.info(`Reminder sent to vendor ${subscription.vendorId}.`);
            }
            logger_1.default.info("Cron job executed successfully.");
        }
        catch (error) {
            logger_1.default.error("Error in subscription expiry cron job:", error);
        }
    }));
};
exports.default = runSubscriptionCron;
//# sourceMappingURL=subscriptionCron.js.map