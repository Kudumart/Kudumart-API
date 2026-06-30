"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.reportProduct = exports.deleteAccount = exports.getSingleReview = exports.getProductReviews = exports.updateReview = exports.addReview = exports.getSavedProducts = exports.toggleSaveProduct = exports.getPaymentDetails = exports.updateOrderStatus = exports.viewOrderItem = exports.getAllOrderItems = exports.getAllOrders = exports.userMarkNotificationAsRead = exports.getUserNotifications = exports.becomeVendor = exports.actionProductBidders = exports.placeBid = exports.getAllAuctionProductsInterest = exports.showInterest = exports.checkoutDollar = exports.checkout = exports.prepareCheckoutDollar = exports.prepareCheckoutNaira = exports.calculateAliexpressDeliveryFee = exports.getAliexpressAddressOptions = exports.getActivePaymentGateways = exports.getCartCharges = exports.clearCart = exports.getCartContents = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.markAsReadHandler = exports.deleteMessageHandler = exports.saveMessage = exports.sendMessageHandler = exports.getAllConversationMessages = exports.getConversations = exports.updateUserNotificationSettings = exports.getUserNotificationSettings = exports.confirmPhoneNumberUpdate = exports.updateProfilePhoneNumber = exports.confirmEmailUpdate = exports.updateProfileEmail = exports.updatePassword = exports.updateProfilePhoto = exports.updateProfile = exports.profile = exports.logout = void 0;
exports.checkoutOffer = exports.initiateOfferPayment = exports.respondToCounterOffer = exports.getMyOffers = exports.submitOffer = exports.cancelServiceBooking = exports.markServiceBookingComplete = exports.addServiceReview = exports.getUserServiceBookings = exports.bookService = exports.blockProduct = exports.getBlockedVendors = exports.unblockVendor = exports.blockVendor = void 0;
const user_1 = __importDefault(require("../models/user"));
const sequelize_1 = require("sequelize");
const helpers_1 = require("../utils/helpers");
const mail_service_1 = require("../services/mail.service");
const messages_1 = require("../utils/messages");
const jwt_service_1 = __importDefault(require("../services/jwt.service"));
const logger_1 = __importDefault(require("../middlewares/logger")); // Adjust the path to your logger.js
const helpers_2 = require("../utils/helpers");
const otp_1 = __importDefault(require("../models/otp"));
const usernotificationsetting_1 = __importDefault(require("../models/usernotificationsetting"));
const message_1 = __importDefault(require("../models/message"));
const product_1 = __importDefault(require("../models/product"));
const conversation_1 = __importDefault(require("../models/conversation"));
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const bid_1 = __importDefault(require("../models/bid"));
const index_1 = require("../index");
const cart_1 = __importDefault(require("../models/cart"));
const showinterest_1 = __importDefault(require("../models/showinterest"));
const paymentgateway_1 = __importDefault(require("../models/paymentgateway"));
const sequelize_service_1 = __importDefault(require("../services/sequelize.service"));
const order_1 = __importDefault(require("../models/order"));
const orderitem_1 = __importDefault(require("../models/orderitem"));
const payment_1 = __importDefault(require("../models/payment"));
const store_1 = __importDefault(require("../models/store"));
const currency_1 = __importDefault(require("../models/currency"));
const notification_1 = __importDefault(require("../models/notification"));
const transaction_1 = __importDefault(require("../models/transaction"));
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const subcategory_1 = __importDefault(require("../models/subcategory"));
const admin_1 = __importDefault(require("../models/admin"));
const category_1 = __importDefault(require("../models/category"));
const saveproduct_1 = __importDefault(require("../models/saveproduct"));
const reviewproduct_1 = __importDefault(require("../models/reviewproduct"));
const crypto_1 = __importDefault(require("crypto"));
const productreport_1 = __importDefault(require("../models/productreport"));
const blockedvendor_1 = __importDefault(require("../models/blockedvendor"));
const kyc_1 = __importDefault(require("../models/kyc"));
const blockedproduct_1 = __importDefault(require("../models/blockedproduct"));
const pushNotification_1 = require("../firebase/pushNotification");
const index_2 = require("../types/index");
const reminder_service_1 = require("../services/reminder.service");
const productcharge_1 = __importDefault(require("../models/productcharge"));
const services_1 = __importDefault(require("../models/services"));
const servicebookings_1 = __importDefault(require("../models/servicebookings"));
const servicereview_1 = __importDefault(require("../models/servicereview"));
const productoffer_1 = __importDefault(require("../models/productoffer"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const dropShipping_service_1 = require("../services/dropShipping.service");
const dropshipProducts_1 = __importDefault(require("../models/dropshipProducts"));
const uuid = __importStar(require("uuid"));
const ApiError_1 = require("../utils/ApiError");
const dropshippngCreds_1 = __importDefault(require("../models/dropshippngCreds"));
const dropShippingService = new dropShipping_service_1.DropShippingService();
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the token from the request
        const token = jwt_service_1.default.jwtGetToken(req);
        if (!token) {
            res.status(400).json({
                message: "Token not provided",
            });
            return;
        }
        // Blacklist the token to prevent further usage
        yield jwt_service_1.default.jwtBlacklistToken(token);
        res.status(200).json({
            message: "Logged out successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "Server error during logout.",
        });
    }
});
exports.logout = logout;
const profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming the user ID is passed in the URL params
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.status(200).json({
            message: "Profile retrieved successfully.",
            data: user,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving user profile:", error);
        res.status(500).json({
            message: "Server error during retrieving profile.",
        });
    }
});
exports.profile = profile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { firstName, lastName, dateOfBirth, gender, location } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming the user ID is passed in the URL params
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Update user profile information
        user.firstName = firstName
            ? (0, helpers_2.capitalizeFirstLetter)(firstName)
            : user.firstName;
        user.lastName = lastName ? (0, helpers_2.capitalizeFirstLetter)(lastName) : user.lastName;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        user.gender = gender || user.gender;
        user.location = location || user.location;
        yield user.save();
        res.status(200).json({
            message: "Profile updated successfully.",
            data: user,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating user profile:", error);
        res.status(500).json({
            message: "Server error during profile update.",
        });
    }
});
exports.updateProfile = updateProfile;
const updateProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { photo } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming the user ID is passed in the URL params
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Update user profile photo
        user.photo = photo || user.photo;
        yield user.save();
        res.status(200).json({
            message: "Profile photo updated successfully.",
            data: user,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating user profile photo:", error);
        res.status(500).json({
            message: "Server error during profile photo update.",
        });
    }
});
exports.updateProfilePhoto = updateProfilePhoto;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Using optional chaining to access userId
    try {
        // Find the user
        const user = yield user_1.default.scope("auth").findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Check if the old password is correct
        const isMatch = yield user.checkPassword(oldPassword);
        if (!isMatch) {
            res.status(400).json({ message: "Old password is incorrect." });
            return;
        }
        // Update the password
        user.password = newPassword; // Hash the new password before saving
        yield user.save();
        // Send password reset notification email
        const message = messages_1.emailTemplates.passwordResetNotification(user);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Password Reset Notification`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Send reset password notification
        const title = "Password Reset Request";
        const messageContent = "A password reset request was initiated for your account. If this wasn't you, please contact support.";
        const type = "reset_password";
        // Create the notification in the database
        const notification = yield notification_1.default.create({
            userId: user.id,
            title,
            message: messageContent,
            type,
        });
        res.status(200).json({
            message: "Password updated successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "Server error during password update.",
        });
    }
});
exports.updatePassword = updatePassword;
const updateProfileEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { newEmail } = req.body;
    try {
        // Check if the current email matches the authenticated user's email
        const user = yield user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the new email already exists for another user
        const existingUser = yield user_1.default.findOne({ where: { email: newEmail } });
        if (existingUser) {
            res
                .status(400)
                .json({ message: "Email is already in use by another account" });
            return;
        }
        // Generate OTP for verification
        const otpCode = (0, helpers_1.generateOTP)();
        const otp = yield otp_1.default.upsert({
            userId: userId,
            otpCode: otpCode,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
        });
        // Send mail
        let message = messages_1.emailTemplates.resendCode(user, otpCode, newEmail);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Verify Your New Email Address`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Send response
        res.status(200).json({
            message: "New email verification code sent successfully",
            data: newEmail,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating profile email:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the email" });
    }
});
exports.updateProfileEmail = updateProfileEmail;
const confirmEmailUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { newEmail, otpCode } = req.body;
    try {
        // Check if the current email matches the authenticated user's email
        const user = yield user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the new email already exists for another user
        const existingUser = yield user_1.default.findOne({ where: { email: newEmail } });
        if (existingUser) {
            res
                .status(400)
                .json({ message: "Email is already in use by another account" });
            return;
        }
        // Check for the OTP
        const otpRecord = yield otp_1.default.findOne({
            where: { userId: user.id, otpCode },
        });
        if (!otpRecord) {
            res.status(400).json({ message: "Invalid OTP code." });
            return;
        }
        // Check if the OTP has expired
        if (!otpRecord.expiresAt || new Date() > otpRecord.expiresAt) {
            res.status(400).json({ message: "OTP has expired." });
            return;
        }
        // Update the user's email
        user.email = newEmail;
        yield user.save();
        // Optionally delete the OTP record after successful verification
        yield otp_1.default.destroy({ where: { userId: user.id } });
        // Send mail
        let message = messages_1.emailTemplates.emailAddressChanged(user);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Email Address Changed`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Send a notification for becoming a vendor
        const title = "Email Address Updated";
        const messageContent = `Your email address has been successfully updated to ${newEmail}.`;
        const type = "update_email";
        // Create the notification in the database
        const notification = yield notification_1.default.create({
            userId: user.id,
            title,
            message: messageContent,
            type,
        });
        // Send response
        res.status(200).json({ message: "Email updated successfully" });
    }
    catch (error) {
        logger_1.default.error("Error updating profile email:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the email" });
    }
});
exports.confirmEmailUpdate = confirmEmailUpdate;
const updateProfilePhoneNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { newPhoneNumber } = req.body;
    try {
        // Check if the current user exists
        const user = yield user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the new phone number already exists for another user
        const existingUser = yield user_1.default.findOne({
            where: { phoneNumber: newPhoneNumber },
        });
        if (existingUser) {
            res
                .status(400)
                .json({ message: "Phone number is already in use by another account" });
            return;
        }
        // Update the user's phone number
        user.phoneNumber = newPhoneNumber;
        yield user.save();
        // Send mail
        let message = messages_1.emailTemplates.phoneNumberUpdated(user);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Phone Number Updated`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Send a notification for becoming a vendor
        const title = "Phone Number Updated";
        const messageContent = `Your phone number has been successfully updated to ${newPhoneNumber}.`;
        const type = "update_phone";
        // Create the notification in the database
        const notification = yield notification_1.default.create({
            userId: user.id,
            title,
            message: messageContent,
            type,
        });
        // Send response
        res.status(200).json({ message: "Phone number updated successfully" });
    }
    catch (error) {
        logger_1.default.error("Error updating phone number:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the phone number" });
    }
});
exports.updateProfilePhoneNumber = updateProfilePhoneNumber;
const confirmPhoneNumberUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { newPhoneNumber, otpCode } = req.body;
    try {
        // Check if the current user exists
        const user = yield user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the new phone number already exists for another user
        const existingUser = yield user_1.default.findOne({
            where: { phoneNumber: newPhoneNumber },
        });
        if (existingUser) {
            res
                .status(400)
                .json({ message: "Phone number is already in use by another account" });
            return;
        }
        // Check for the OTP
        const otpRecord = yield otp_1.default.findOne({
            where: { userId: user.id, otpCode },
        });
        if (!otpRecord) {
            res.status(400).json({ message: "Invalid OTP code." });
            return;
        }
        // Check if the OTP has expired
        if (!otpRecord.expiresAt || new Date() > otpRecord.expiresAt) {
            res.status(400).json({ message: "OTP has expired." });
            return;
        }
        // Update the user's phone number
        user.phoneNumber = newPhoneNumber;
        yield user.save();
        // Optionally delete the OTP record after successful verification
        yield otp_1.default.destroy({ where: { userId: user.id } });
        // Send mail
        let message = messages_1.emailTemplates.phoneNumberUpdated(user);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Phone Number Updated`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Send a notification for becoming a vendor
        const title = "Phone Number Updated";
        const messageContent = `Your phone number has been successfully updated to ${newPhoneNumber}.`;
        const type = "update_phone";
        // Create the notification in the database
        const notification = yield notification_1.default.create({
            userId: user.id,
            title,
            message: messageContent,
            type,
        });
        // Send response
        res.status(200).json({ message: "Phone number updated successfully" });
    }
    catch (error) {
        logger_1.default.error("Error updating profile email:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the email" });
    }
});
exports.confirmPhoneNumberUpdate = confirmPhoneNumberUpdate;
const getUserNotificationSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    try {
        // Step 1: Retrieve the user's notification settings
        const userSettings = yield usernotificationsetting_1.default.findOne({
            where: { userId },
            attributes: ["hotDeals", "auctionProducts", "subscription"], // Include only relevant fields
        });
        // Step 2: Check if settings exist
        if (!userSettings) {
            res.status(404).json({
                message: "Notification settings not found for the user.",
            });
            return;
        }
        // Step 3: Send the settings as a response
        res.status(200).json({
            message: "Notification settings retrieved successfully.",
            settings: userSettings,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error retrieving notification settings.",
        });
    }
});
exports.getUserNotificationSettings = getUserNotificationSettings;
const updateUserNotificationSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    const { hotDeals, auctionProducts, subscription } = req.body; // These values will be passed from the frontend
    // Step 1: Validate the notification settings
    if (typeof hotDeals !== "boolean" ||
        typeof auctionProducts !== "boolean" ||
        typeof subscription !== "boolean") {
        res.status(400).json({
            message: "All notification settings (hotDeals, auctionProducts, subscription) must be boolean values.",
        });
        return;
    }
    try {
        // Step 2: Check if the user already has notification settings
        const userSettings = yield usernotificationsetting_1.default.findOne({
            where: { userId },
        });
        if (userSettings) {
            // Step 3: Update notification settings
            yield userSettings.update({
                hotDeals,
                auctionProducts,
                subscription,
            });
            res
                .status(200)
                .json({ message: "Notification settings updated successfully." });
        }
        else {
            // Step 4: If the settings don't exist (this shouldn't happen since they are created on signup), create them
            yield usernotificationsetting_1.default.create({
                userId,
                hotDeals,
                auctionProducts,
                subscription,
            });
            res
                .status(200)
                .json({ message: "Notification settings created successfully." });
        }
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: error.message || "Error updating notification settings.",
        });
    }
});
exports.updateUserNotificationSettings = updateUserNotificationSettings;
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    if (!userId) {
        res
            .status(400)
            .json({ message: "User ID is required and user must be authenticated" });
        return;
    }
    try {
        // Fetch all conversations where the user is either the sender or the receiver
        const conversations = yield conversation_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [{ senderId: userId }, { receiverId: userId }],
            },
            include: [
                {
                    model: user_1.default,
                    as: "senderUser", // Assuming senderId references the User model
                    attributes: [
                        "id",
                        "firstName",
                        "lastName",
                        "email",
                        "phoneNumber",
                        "photo",
                    ], // Modify attributes as needed
                },
                {
                    model: user_1.default,
                    as: "receiverUser", // Assuming receiverId references the User model
                    attributes: [
                        "id",
                        "firstName",
                        "lastName",
                        "email",
                        "phoneNumber",
                        "photo",
                    ], // Modify attributes as needed
                },
                {
                    model: product_1.default,
                    as: "product",
                    attributes: ["id", "name"], // Modify attributes as needed
                },
                {
                    model: message_1.default,
                    as: "message",
                    limit: 1, // Limit to 1 message to get the last one
                    order: [["createdAt", "DESC"]], // Order by createdAt in descending order to get the latest message
                    attributes: ["id", "content", "fileUrl", "createdAt", "isRead"], // Modify attributes as needed
                },
            ],
            attributes: {
                include: [
                    [
                        sequelize_1.Sequelize.literal(`
              (SELECT COUNT(*) 
               FROM messages 
               WHERE messages.conversationId = Conversation.id 
                 AND messages.userId != '${userId}' 
                 AND messages.isRead = 0
              )
            `),
                        "unreadMessagesCount",
                    ],
                ],
            },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            message: "Conversations fetched successfully",
            data: conversations,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching conversations:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});
exports.getConversations = getConversations;
const getAllConversationMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    try {
        const { conversationId } = req.query;
        // Validate that conversationId is provided
        if (!conversationId) {
            res.status(400).json({ message: "Conversation ID is required." });
            return;
        }
        // Fetch the conversation with related messages, users, and product
        const conversation = yield conversation_1.default.findOne({
            where: { id: conversationId },
            include: [
                {
                    model: message_1.default,
                    as: "message", // Ensure this matches your Sequelize model alias
                    include: [
                        {
                            model: user_1.default,
                            as: "user", // Alias for sender relationship
                            attributes: ["id", "firstName", "lastName", "email"],
                        },
                    ],
                },
                {
                    model: product_1.default,
                    as: "product",
                    attributes: ["id", "name", "price"],
                },
            ],
            order: [[{ model: message_1.default, as: "message" }, "createdAt", "ASC"]], // Order messages by creation date
        });
        if (!conversation) {
            res
                .status(404)
                .json({ message: "No conversation found with the given ID." });
            return;
        }
        // Mark messages not sent by the user as read
        yield message_1.default.update({ isRead: true }, {
            where: {
                conversationId,
                userId: { [sequelize_1.Op.ne]: userId }, // Not equal to userId
                isRead: false, // Only update unread messages
            },
        });
        res.status(200).json({ data: conversation });
    }
    catch (error) {
        logger_1.default.error("Error fetching conversation messages:", error);
        res.status(500).json({
            message: "An error occurred while retrieving conversation messages.",
            error: error.message,
        });
    }
});
exports.getAllConversationMessages = getAllConversationMessages;
const sendMessageHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    // Ensure userId is defined
    if (!userId) {
        res.status(400).json({
            message: "Sender ID is required and user must be authenticated",
        });
        return;
    }
    const { productId, receiverId, content, fileUrl } = req.body;
    // Prevent user from sending a message to themselves
    if (userId === receiverId) {
        res.status(400).json({ message: "You cannot send a message to yourself" });
        return;
    }
    // Block check: if receiver is a vendor and sender has blocked them
    const receiver = yield user_1.default.findByPk(receiverId);
    if (receiver && receiver.accountType === "Vendor") {
        const blocked = yield blockedvendor_1.default.findOne({
            where: { userId, vendorId: receiverId },
        });
        if (blocked) {
            res.status(403).json({ message: "You have blocked this vendor." });
            return;
        }
    }
    try {
        // Find the product by its ID
        const product = yield product_1.default.findByPk(productId);
        // Check if the product exists
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        const user = yield user_1.default.findByPk(receiverId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Find an existing conversation between sender and receiver or create a new one
        let conversation = yield conversation_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { senderId: userId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: userId },
                ],
                productId,
            },
        });
        // If no conversation exists, create a new one
        if (!conversation) {
            conversation = yield conversation_1.default.create({
                senderId: userId,
                receiverId,
                productId,
            });
        }
        // Call the sendMessage function to save the message
        const message = yield (0, exports.saveMessage)(conversation.id, userId, content, fileUrl);
        if (!message) {
            res.status(500).json({ message: "Failed to send message" });
            return;
        }
        if (receiver === null || receiver === void 0 ? void 0 : receiver.fcmToken) {
            // Send push notification to the receiver
            const notificationMessage = {
                notification: {
                    title: "New Message",
                    body: `You have a new message from ${user.firstName} ${user.lastName} for product ${product.name}`,
                },
                data: {
                    conversationId: conversation.id,
                    messageId: message.id,
                    type: index_2.PushNotificationTypes.NEW_MESSAGE,
                },
                token: receiver.fcmToken, // FCM token of the receiver
            };
            try {
                yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
            }
            catch (error) {
                logger_1.default.error("Error sending push notification:", error);
            }
        }
        res
            .status(200)
            .json({ message: "Message sent successfully", data: message });
    }
    catch (error) {
        logger_1.default.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendMessageHandler = sendMessageHandler;
const saveMessage = (conversationId, userId, content, fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Save message to the database
        const message = yield message_1.default.create({
            conversationId,
            userId,
            content,
            fileUrl,
        });
        // Return the created message
        return message;
    }
    catch (error) {
        logger_1.default.error("Error creating message:", error);
        return null; // Return null or throw a custom error based on your needs
    }
});
exports.saveMessage = saveMessage;
const deleteMessageHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    // Ensure userId is defined
    if (!userId) {
        res.status(400).json({
            message: "Sender ID is required and user must be authenticated",
        });
        return;
    }
    const messageId = req.query.messageId; // Get the message ID from the URL
    try {
        // Find the message by its ID
        const message = yield message_1.default.findByPk(messageId);
        // Check if the message exists
        if (!message) {
            res.status(404).json({ message: "Message not found" });
            return;
        }
        // Ensure the message was sent by the authenticated user
        if (message.userId !== userId) {
            res
                .status(403)
                .json({ message: "You can only delete your own messages" });
            return;
        }
        // Delete the message
        yield message.destroy();
        res.status(200).json({ message: "Message deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteMessageHandler = deleteMessageHandler;
const markAsReadHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    // Ensure userId is defined
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const messageId = req.query.messageId; // Get the message ID from the URL
    try {
        // Find the message by its ID
        const message = yield message_1.default.findByPk(messageId);
        // Check if the message exists
        if (!message) {
            res.status(404).json({ message: "Message not found" });
            return;
        }
        // Ensure the message is for the authenticated user (i.e., the receiver)
        if (message.userId === userId) {
            res
                .status(403)
                .json({ message: "You can only mark your received messages as read" });
            return;
        }
        // Mark the message as read
        message.isRead = true;
        yield message.save();
        res.status(200).json({ message: "Message marked as read", data: message });
    }
    catch (error) {
        logger_1.default.error("Error marking message as read:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.markAsReadHandler = markAsReadHandler;
// Cart
const addItemToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const { productId, quantity, dropshipProductSkuId, dropshipProductSkuAttr } = req.body;
    try {
        // Find the product by productId and include vendor, currency, sub_category and category details
        const product = yield product_1.default.findByPk(productId, {
            attributes: ["vendorId", "name", "quantity", "type", "categoryId"], // Include quantity and categoryId in the attributes
            include: [
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["name", "symbol"],
                        },
                    ],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    include: [
                        {
                            model: category_1.default,
                            as: "category",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
        });
        if ((product === null || product === void 0 ? void 0 : product.type) === "dropship" &&
            (!dropshipProductSkuId || !dropshipProductSkuAttr)) {
            res.status(400).json({
                message: "Dropship product SKU ID and attribute are required for dropship products.",
            });
            return;
        }
        if (!product || !product.store || !product.store.currency) {
            res
                .status(404)
                .json({ message: "Product not found or invalid currency data" });
            return;
        }
        const subCat = product === null || product === void 0 ? void 0 : product.sub_category;
        const category = subCat === null || subCat === void 0 ? void 0 : subCat.category;
        const categoryId = (category === null || category === void 0 ? void 0 : category.id) || (subCat === null || subCat === void 0 ? void 0 : subCat.categoryId) || (product === null || product === void 0 ? void 0 : product.categoryId) || "";
        const categoryName = ((_b = category === null || category === void 0 ? void 0 : category.name) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "";
        const productName = ((_c = product === null || product === void 0 ? void 0 : product.name) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "";
        const targetIds = [
            "de7035db-6833-4a11-a7d9-7fd5ae8c4370", // Real Estate
            "cee73eb0-5a9f-4a34-8225-794cbfbf959f", // Vehicles
            "3b77c173-30c8-4e2b-b78d-10713ba52b6f", // Automotives and Tools
        ];
        console.log("=== Debug Backend Cart Logic ===");
        console.log("Product Name:", productName);
        console.log("Category ID:", categoryId);
        console.log("Category Name:", categoryName);
        if (targetIds.includes(categoryId) ||
            categoryName.includes("real estate") ||
            categoryName.includes("vehicle") ||
            categoryName.includes("automotive") ||
            categoryName.includes("car") ||
            productName.includes("car") ||
            productName.includes("vehicle") ||
            productName.includes("real estate") ||
            productName.includes("automotive")) {
            console.log("Blocked: Match found for restricted category.");
            res.status(400).json({
                message: "This category does not support adding to cart. Please make an offer instead.",
            });
            return;
        }
        const { vendorId, name, quantity: availableQuantity = 0 } = product; // Get available quantity
        const productCurrency = product.store.currency;
        // Ensure product currency is either $, #, or ₦
        const allowedCurrencies = ["$", "#", "₦"];
        if (!allowedCurrencies.includes(productCurrency.symbol)) {
            res.status(400).json({
                message: `Only products with currencies ${allowedCurrencies.join(", ")} are allowed.`,
            });
            return;
        }
        // Check if vendorId exists in the User table (Vendor)
        const vendor = yield user_1.default.findByPk(vendorId);
        // Check if vendorId exists in the Admin table
        const admin = yield admin_1.default.findByPk(vendorId);
        if (!vendor && !admin) {
            res.status(404).json({ message: "Owner not found" });
            return;
        }
        // If it's a vendor, ensure they are verified
        if (vendor && !vendor.isVerified) {
            res.status(400).json({
                message: "Cannot add item to cart. Vendor is not verified.",
            });
            return;
        }
        // Ensure the requested quantity doesn't exceed available quantity
        if (quantity > availableQuantity) {
            res.status(400).json({
                message: `Sorry, only ${availableQuantity} of this product is available. Please reduce the quantity.`,
            });
            return;
        }
        // Check if the user has an existing cart
        const existingCartItems = yield cart_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    include: [
                        {
                            model: store_1.default,
                            as: "store",
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ["name", "symbol"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (existingCartItems.length > 0) {
            // Extract the currency of the first item in the cart
            const existingCartItem = existingCartItems[0];
            const existingProduct = existingCartItem.product;
            if (!existingProduct ||
                !existingProduct.store ||
                !existingProduct.store.currency) {
                throw new Error("Cart contains invalid product or currency information.");
            }
            const existingCurrency = existingProduct.store.currency;
            // Check if the currency matches
            if (existingCurrency.name !== productCurrency.name ||
                existingCurrency.symbol !== productCurrency.symbol) {
                res.status(400).json({
                    message: `Your cart contains products in ${existingCurrency.name}. Please clear your cart before adding items in ${productCurrency.name}.`,
                });
                return;
            }
        }
        // Check if the product is already in the user's cart
        const existingCartItem = yield cart_1.default.findOne({
            where: { userId, productId },
        });
        if (existingCartItem) {
            // If the item is already in the cart, check if the new quantity exceeds the available quantity
            const totalQuantity = existingCartItem.quantity + quantity;
            if (totalQuantity > availableQuantity) {
                res.status(400).json({
                    message: `Sorry, you can't add more than ${availableQuantity} of this product to your cart. Please reduce the quantity.`,
                });
                return;
            }
            // If the quantity is valid, update the cart with the new quantity
            existingCartItem.quantity = totalQuantity;
            yield existingCartItem.save();
        }
        else {
            const title = "Product Added to Cart";
            const message = `You have successfully added "${product.name}" to your cart.`;
            const type = "add_to_cart";
            // Create the notification in the database
            const notification = yield notification_1.default.create({
                userId,
                title,
                message,
                type,
            });
            // Add a new item to the cart
            yield cart_1.default.create(Object.assign(Object.assign({ userId,
                productId,
                quantity, productType: product.type }, (dropshipProductSkuAttr && { dropshipProductSkuAttr })), (dropshipProductSkuId && {
                dropshipProductSkuId: String(dropshipProductSkuId),
            })));
        }
        res.status(200).json({ message: "Item added to cart successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: error.message || "Error adding item to cart." });
    }
});
exports.addItemToCart = addItemToCart;
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { cartId, quantity } = req.body;
    try {
        // Find the cart item by cartId
        const cartItem = yield cart_1.default.findByPk(cartId, {
            include: [
                {
                    model: product_1.default, // Assuming you have a 'Product' model associated with 'Cart'
                    as: "product", // Alias used in the association
                    include: [
                        {
                            model: store_1.default,
                            as: "store", // Store model that has the 'currency'
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency", // Currency associated with the store
                                    attributes: ["name", "symbol"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!cartItem || !cartItem.product || !cartItem.product.quantity) {
            res.status(404).json({ message: "Cart item or product not found." });
            return;
        }
        const { productId, product } = cartItem;
        const availableQuantity = (_a = product.quantity) !== null && _a !== void 0 ? _a : 0; // Use 0 if quantity is undefined
        // Ensure the requested quantity doesn't exceed available quantity
        if (quantity > availableQuantity) {
            res.status(400).json({
                message: `Sorry, only ${availableQuantity} of this product is available. Please reduce the quantity.`,
            });
            return;
        }
        // Update the cart item quantity if stock is sufficient
        cartItem.quantity = quantity;
        yield cartItem.save();
        res.status(200).json({ message: "Cart item updated successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: error.message || "Error updating cart item." });
    }
});
exports.updateCartItem = updateCartItem;
const removeCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    // Ensure userId is defined
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const { cartId } = req.query;
    try {
        const cartItem = yield cart_1.default.findOne({
            where: { userId, id: cartId },
        });
        if (!cartItem) {
            res.status(404).json({ message: "Cart item not found." });
            return;
        }
        yield cartItem.destroy();
        res.status(200).json({ message: "Cart item removed successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: error.message || "Error removing cart item." });
    }
});
exports.removeCartItem = removeCartItem;
const getCartContents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    try {
        const cartItems = yield cart_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                },
                {
                    model: product_1.default,
                    as: "product",
                    include: [
                        {
                            model: store_1.default,
                            as: "store",
                            attributes: ["name"],
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ["name", "symbol"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        res.status(200).json({ data: cartItems });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: error.message || "Error fetching cart contents." });
    }
});
exports.getCartContents = getCartContents;
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    try {
        yield cart_1.default.destroy({ where: { userId } });
        res.status(200).json({ message: "Cart cleared successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: error.message || "Error clearing cart." });
    }
});
exports.clearCart = clearCart;
const getCartCharges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const charges = yield productcharge_1.default.findAll({
            where: { is_active: true },
            attributes: [
                "id",
                "name",
                "description",
                "calculation_type",
                "charge_currency",
                "charge_amount",
                "charge_percentage",
                "minimum_product_amount",
                "maximum_product_amount",
            ],
        });
        res.status(200).json({
            message: "Product charges fetched successfully",
            data: charges,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching product charges:", error);
        res.status(500).json({
            message: "An error occurred while fetching product charges",
        });
    }
});
exports.getCartCharges = getCartCharges;
const getActivePaymentGateways = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query for active payment gateways (only Paystack and Stripe)
        const paymentGateways = yield paymentgateway_1.default.findAll({
            where: {
                isActive: true,
                name: ["paystack", "stripe"], // Assuming 'name' is the field for gateway names
            },
        });
        // reorder to have Paystack first, then Stripe second
        paymentGateways.sort((a, b) => {
            if (a.name.toLowerCase() === "paystack")
                return -1;
            if (b.name.toLowerCase() === "paystack")
                return 1;
            return 0;
        });
        if (!paymentGateways.length) {
            res.status(404).json({ message: "No active payment gateways found" });
            return;
        }
        res.status(200).json({
            message: "Active payment gateways fetched successfully",
            data: paymentGateways,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching active payment gateways:", error);
        res.status(500).json({
            message: "An error occurred while fetching the active payment gateways",
        });
    }
});
exports.getActivePaymentGateways = getActivePaymentGateways;
function getTotalAliexpressDeliveryFee(dropShippedProducts, shipToCountryCode, user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let totalDeliveryFee = [];
            if (dropShippedProducts.length > 0) {
                totalDeliveryFee = yield Promise.all(dropShippedProducts.map((cartItem) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d;
                    const product = cartItem.product;
                    if (!product) {
                        throw new Error(`Product with ID ${cartItem.productId} not found`);
                    }
                    const deliveryFee = yield dropShippingService.calculateDeliveryFee(product.vendorId, {
                        sku_id: String(cartItem.dropshipProductSkuId),
                        ship_to_country_code: shipToCountryCode,
                        ship_to_city_code: `${(_a = user.location) === null || _a === void 0 ? void 0 : _a.city} ${(_b = user.location) === null || _b === void 0 ? void 0 : _b.state}`,
                        ship_to_province_code: (_c = user.location) === null || _c === void 0 ? void 0 : _c.state,
                        //@ts-ignore
                        product_id: (_d = product.dropshipDetails) === null || _d === void 0 ? void 0 : _d.dropshipProductId,
                        product_num: cartItem.quantity,
                        //@ts-ignore
                        price_currency: shipToCountryCode === "NG" ? "NGN" : "USD",
                    });
                    const response = deliveryFee.aliexpress_ds_freight_query_response;
                    if (!response) {
                        return {
                            deliveryFee: 0,
                        };
                    }
                    const result = response.result.delivery_options;
                    if (!result.delivery_option_d_t_o ||
                        !result.delivery_option_d_t_o[0].shipping_fee_cent ||
                        result.delivery_option_d_t_o.length === 0) {
                        return {
                            deliveryFee: 0,
                        };
                    }
                    return {
                        //@ts-ignore
                        deliveryFee: 
                        //@ts-ignore
                        result.delivery_option_d_t_o[0].shipping_fee_cent || 0,
                    };
                })));
            }
            else {
                totalDeliveryFee = [{ deliveryFee: 0 }];
            }
            const summedDeliveryFee = totalDeliveryFee.reduce((accumulator, current) => new decimal_js_1.default(accumulator).plus(new decimal_js_1.default(current.deliveryFee)), new decimal_js_1.default(0));
            return summedDeliveryFee.div(100).toNearest(0.01).toNumber();
        }
        catch (error) {
            logger_1.default.error("Error calculating total Aliexpress delivery fee:", error);
            throw error;
        }
    });
}
const getAliexpressAddressOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID
    const shipToCountryCode = req.query.shipToCountryCode;
    if (!shipToCountryCode) {
        res.status(400).json({ message: "Ship to country code is required" });
        return;
    }
    if (shipToCountryCode !== "NG" &&
        shipToCountryCode !== "US" &&
        shipToCountryCode !== "UK") {
        res
            .status(400)
            .json({ message: "Ship to country code must be either NG, US, or UK" });
        return;
    }
    try {
        // const userCart = await Cart.findAll({
        // 	where: { userId },
        // 	include: [
        // 		{
        // 			model: Product,
        // 			as: "product",
        // 			attributes: ["id", "vendorId", "name", "price"],
        // 			include: [
        // 				{
        // 					model: DropshipProducts,
        // 					as: "dropshipDetails",
        // 				},
        // 			],
        // 		},
        // 	],
        // });
        //
        // const vendorIds = Array.from(
        // 	new Set(
        // 		userCart
        // 			.filter((item) => item.productType === "dropship")
        // 			.map((item) => item.product?.vendorId),
        // 	),
        // );
        //
        // if (vendorIds.length === 0) {
        // 	res.status(400).json({ message: "No dropshipped products in cart" });
        // 	return;
        // }
        const vendorCred = yield dropshippngCreds_1.default.findOne({
            where: { expireTime: { [sequelize_1.Op.gt]: new Date() } },
        });
        if (!vendorCred) {
            res
                .status(400)
                .json({ message: "No valid dropshipping credentials found" });
            return;
        }
        if (!vendorCred.vendorId) {
            res.status(400).json({
                message: "No valid vendor ID found in dropshipping credentials",
            });
            return;
        }
        const addressOptions = yield dropShippingService.getAddressSuggestions(vendorCred.vendorId, {
            countryCode: shipToCountryCode,
            language: "en",
            isMultiLanguage: true,
        });
        res.status(200).json({
            message: "Aliexpress address options fetched successfully",
            data: Object.assign(Object.assign({}, addressOptions), { children: JSON.parse(
                //@ts-ignore
                addressOptions.children) }),
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching Aliexpress address options:", error);
        res.status(500).json({
            message: "An error occurred while fetching Aliexpress address options",
        });
    }
});
exports.getAliexpressAddressOptions = getAliexpressAddressOptions;
const calculateAliexpressDeliveryFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    // const curreny = req.query.currency as string;
    const shipToCountryCode = req.query.shipToCountryCode;
    try {
        if (!shipToCountryCode) {
            res.status(400).json({ message: "Ship to country code is required" });
            return;
        }
        if (shipToCountryCode !== "NG" &&
            shipToCountryCode !== "US" &&
            shipToCountryCode !== "UK") {
            res
                .status(400)
                .json({ message: "Ship to country code must be either NG, US, or UK" });
            return;
        }
        const cartItems = yield cart_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    attributes: ["id", "vendorId", "name", "price"],
                    include: [
                        {
                            model: dropshipProducts_1.default,
                            as: "dropshipDetails",
                        },
                    ],
                },
            ],
        });
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (!user.location) {
            res.status(400).json({
                message: "User location is required to calculate delivery fee",
            });
            return;
        }
        if (!user.location.city) {
            res.status(400).json({
                message: "User city is required to calculate delivery fee",
            });
            return;
        }
        if (!user.location.state) {
            res.status(400).json({
                message: "User state is required to calculate delivery fee",
            });
            return;
        }
        if (!user.location.country) {
            res.status(400).json({
                message: "User country is required to calculate delivery fee",
            });
            return;
        }
        const dropShippedProducts = cartItems.filter((item) => item.productType === "dropship");
        const deliveryFee = yield getTotalAliexpressDeliveryFee(dropShippedProducts, shipToCountryCode, user);
        res.status(200).json({
            message: "Aliexpress delivery fee calculated successfully",
            data: {
                totalDeliveryFee: deliveryFee,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error calculating Aliexpress delivery fee:", error);
        res.status(500).json({
            message: "An error occurred while calculating Aliexpress delivery fee",
        });
    }
});
exports.calculateAliexpressDeliveryFee = calculateAliexpressDeliveryFee;
const prepareCheckoutNaira = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get authenticated user ID
        const userCart = yield cart_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    include: [
                        {
                            model: store_1.default,
                            as: "store",
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ["name", "symbol"],
                                },
                            ],
                        },
                        {
                            model: dropshipProducts_1.default,
                            as: "dropshipDetails",
                        },
                    ],
                },
            ],
        });
        if (!userCart || userCart.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        userCart.forEach((cartItem) => {
            const product = cartItem.product;
            if (!product || !product.store || !product.store.currency) {
                throw new Error(`Product with ID ${cartItem.productId} not found or invalid currency data`);
            }
            if (!userCart.every((item) => item.product &&
                item.product.store &&
                item.product.store.currency &&
                item.product.store.currency.name.toLowerCase() === "naira")) {
                res.status(400).json({
                    message: "All products in the cart must be priced in NGN for this checkout.",
                });
                return;
            }
        });
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const dropshipItems = userCart.filter((item) => item.productType === "dropship");
        let deliveryFee = 0;
        if (dropshipItems.length > 0) {
            deliveryFee = yield getTotalAliexpressDeliveryFee(dropshipItems, "NG", user);
        }
        // Get Admin's product charges
        const productCharges = yield productcharge_1.default.findAll({
            where: { is_active: true },
        });
        // Calculate total price and validate inventory
        let totalAmount = new decimal_js_1.default(0);
        let totalChargeAmount = new decimal_js_1.default(0);
        for (const cartItem of userCart) {
            const product = cartItem.product;
            if (!product) {
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
            let productPrice;
            if (product.type === "in_stock") {
                // Check if product.quantity is defined and if there's enough stock before proceeding
                const availableQuantity = (_b = product.quantity) !== null && _b !== void 0 ? _b : 0; // If quantity is undefined, fallback to 0
                if (availableQuantity < cartItem.quantity) {
                    throw new ApiError_1.BadRequestError(`Insufficient stock for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(((_c = product.discount_price) !== null && _c !== void 0 ? _c : 0) > 0
                    ? (_d = product.discount_price) !== null && _d !== void 0 ? _d : 0
                    : (_e = product.price) !== null && _e !== void 0 ? _e : 0);
            }
            else if (product.type === "dropship") {
                const dropshipProductVariant = (_f = product.variants) === null || _f === void 0 ? void 0 : _f.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (!dropshipProductVariant) {
                    throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                const availableQuantity = (_g = dropshipProductVariant.sku_available_stock) !== null && _g !== void 0 ? _g : 0;
                if (availableQuantity < cartItem.quantity) {
                    throw new ApiError_1.BadRequestError(`Insufficient stock for dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(
                //@ts-ignore
                ((_h = dropshipProductVariant.offer_sale_price) !== null && _h !== void 0 ? _h : 0) > 0
                    ? (_j = dropshipProductVariant.offer_sale_price) !== null && _j !== void 0 ? _j : 0
                    : (_k = dropshipProductVariant.sku_price) !== null && _k !== void 0 ? _k : 0);
            }
            else {
                throw new Error(`Unknown product type for product: ${product.name}`);
            }
            // Check for product charge percentage
            const productChargePercentage = productCharges.find((charge) => charge.charge_currency === "NGN" &&
                charge.calculation_type === "percentage" &&
                new decimal_js_1.default(productPrice).greaterThanOrEqualTo(charge.minimum_product_amount) &&
                new decimal_js_1.default(productPrice).lessThanOrEqualTo(charge.maximum_product_amount));
            // Check for product charge amount
            const productChargeAmount = productCharges.find((charge) => charge.charge_currency === "NGN" &&
                charge.calculation_type === "fixed" &&
                new decimal_js_1.default(productPrice).greaterThanOrEqualTo(charge.minimum_product_amount) &&
                new decimal_js_1.default(productPrice).lessThanOrEqualTo(charge.maximum_product_amount));
            let chargeAmount = new decimal_js_1.default(0);
            if (productChargePercentage) {
                // Calculate percentage charge
                chargeAmount = chargeAmount
                    .plus(new decimal_js_1.default(productPrice !== null && productPrice !== void 0 ? productPrice : 0))
                    .mul(new decimal_js_1.default(productChargePercentage.charge_percentage).div(100))
                    .toNearest(0.01);
            }
            else if (productChargeAmount) {
                // Use fixed amount charge
                chargeAmount = chargeAmount
                    .plus((_l = productChargeAmount.charge_amount) !== null && _l !== void 0 ? _l : 0)
                    .toNearest(0.01);
            }
            // Calculate total amount for this cart item
            totalAmount = totalAmount
                .plus(productPrice.plus(chargeAmount).mul(cartItem.quantity))
                .toNearest(0.01);
            // totalAmount += product.price * cartItem.quantity;
        }
        totalAmount = totalAmount.plus(new decimal_js_1.default(deliveryFee)).toNearest(0.01);
        const paymentGateway = yield paymentgateway_1.default.findOne({
            where: {
                name: "Paystack",
                isActive: true,
            },
        });
        if (!paymentGateway || !paymentGateway.publicKey) {
            throw new Error("Active Paystack gateway not configured");
        }
        const secretKey = paymentGateway.secretKey;
        const uuidv4 = uuid.v4;
        const refId = `psk_${uuidv4()}_${Date.now()}`;
        const paystack = yield (0, helpers_1.initializePaystackPayment)(refId, totalAmount.toNumber(), user.email, secretKey);
        res.status(200).json({
            message: "Cart validated for Naira checkout",
            data: {
                refId,
                totalAmount: totalAmount.toNumber(),
                subTotalAmount: {
                    amount: totalAmount
                        .minus(new decimal_js_1.default(deliveryFee))
                        .minus(totalChargeAmount)
                        .toNumber(),
                    totalChargeAmount: totalChargeAmount.toNumber(),
                    totalDeliveryFee: deliveryFee,
                },
                paystackDetails: paystack,
            },
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: error.message || "Error preparing checkout." });
    }
});
exports.prepareCheckoutNaira = prepareCheckoutNaira;
const prepareCheckoutDollar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get authenticated user ID
    const userCart = yield cart_1.default.findAll({
        where: { userId },
        include: [
            {
                model: product_1.default,
                as: "product",
                include: [
                    {
                        model: store_1.default,
                        as: "store",
                        include: [
                            {
                                model: currency_1.default,
                                as: "currency",
                                attributes: ["name", "symbol"],
                            },
                        ],
                    },
                    {
                        model: dropshipProducts_1.default,
                        as: "dropshipDetails",
                    },
                ],
            },
        ],
    });
    try {
        if (!userCart || userCart.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        userCart.forEach((cartItem) => {
            const product = cartItem.product;
            if (!product || !product.store || !product.store.currency) {
                throw new Error(`Product with ID ${cartItem.productId} not found or invalid currency data`);
            }
            const productCurrency = product.store.currency;
            // Ensure product currency is either $, #, or ₦
            const allowedCurrencies = ["$", "#", "₦"];
            if (!allowedCurrencies.includes(productCurrency.symbol)) {
                res.status(400).json({
                    message: `Only products with currencies ${allowedCurrencies.join(", ")} are allowed.`,
                });
                return;
            }
            if (!userCart.every((item) => item.product &&
                item.product.store &&
                item.product.store.currency &&
                item.product.store.currency.name.toLowerCase() === "dollar")) {
                res.status(400).json({
                    message: "All products in the cart must be priced in USD for this checkout.",
                });
                return;
            }
        });
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const dropshipItems = userCart.filter((item) => item.productType === "dropship");
        let deliveryFee = 0;
        if (dropshipItems.length > 0) {
            deliveryFee = yield getTotalAliexpressDeliveryFee(dropshipItems, ((_b = user.location) === null || _b === void 0 ? void 0 : _b.country) === "united states" ||
                ((_c = user.location) === null || _c === void 0 ? void 0 : _c.country) === "usa" ||
                ((_d = user.location) === null || _d === void 0 ? void 0 : _d.country) === "united states of america"
                ? "US"
                : "UK", user);
        }
        // Get Admin's product charges
        const productCharges = yield productcharge_1.default.findAll({
            where: { is_active: true },
        });
        // Calculate total price and validate inventory
        let totalAmount = new decimal_js_1.default(0);
        let totalChargeAmount = new decimal_js_1.default(0);
        for (const cartItem of userCart) {
            const product = cartItem.product;
            if (!product) {
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
            let productPrice = new decimal_js_1.default(0);
            if (product.type === "in_stock") {
                // Check if product.quantity is defined and if there's enough stock before proceeding
                const availableQuantity = (_e = product.quantity) !== null && _e !== void 0 ? _e : 0; // If quantity is undefined, fallback to 0
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(((_f = product.discount_price) !== null && _f !== void 0 ? _f : 0) > 0
                    ? (_g = product.discount_price) !== null && _g !== void 0 ? _g : 0
                    : (_h = product.price) !== null && _h !== void 0 ? _h : 0);
            }
            else if (product.type === "dropship") {
                const dropshipProductVariant = (_j = product.variants) === null || _j === void 0 ? void 0 : _j.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (!dropshipProductVariant) {
                    throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                const availableQuantity = (_k = dropshipProductVariant.sku_available_stock) !== null && _k !== void 0 ? _k : 0;
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(
                //@ts-ignore
                ((_l = dropshipProductVariant.offer_sale_price) !== null && _l !== void 0 ? _l : 0) > 0
                    ? (_m = dropshipProductVariant.offer_sale_price) !== null && _m !== void 0 ? _m : 0
                    : (_o = dropshipProductVariant.sku_price) !== null && _o !== void 0 ? _o : 0);
            }
            else {
                throw new Error(`Unknown product type for product: ${product.name}`);
            }
            // Check for product charge percentage
            const productChargePercentage = productCharges.find((charge) => charge.charge_currency === "USD" &&
                charge.calculation_type === "percentage" &&
                new decimal_js_1.default(productPrice).greaterThanOrEqualTo(charge.minimum_product_amount) &&
                new decimal_js_1.default(productPrice).lessThanOrEqualTo(charge.maximum_product_amount));
            // Check for product charge amount
            const productChargeAmount = productCharges.find((charge) => charge.charge_currency === "USD" &&
                charge.calculation_type === "fixed" &&
                new decimal_js_1.default(productPrice).greaterThanOrEqualTo(charge.minimum_product_amount) &&
                new decimal_js_1.default(productPrice).lessThanOrEqualTo(charge.maximum_product_amount));
            let chargeAmount = new decimal_js_1.default(0);
            if (productChargePercentage) {
                // Calculate percentage charge
                chargeAmount = chargeAmount
                    .plus(new decimal_js_1.default(productPrice))
                    .mul(new decimal_js_1.default(productChargePercentage.charge_percentage).div(100))
                    .toNearest(0.01);
            }
            else if (productChargeAmount) {
                // Use fixed amount charge
                chargeAmount = chargeAmount
                    .plus((_p = productChargeAmount.charge_amount) !== null && _p !== void 0 ? _p : 0)
                    .toNearest(0.01);
            }
            // Calculate total amount for this cart item
            totalAmount = totalAmount
                .plus(productPrice.plus(chargeAmount).mul(cartItem.quantity))
                .toNearest(0.01);
            totalChargeAmount = totalChargeAmount.plus(chargeAmount).toNearest(0.01);
            // totalAmount += product.price * cartItem.quantity;
        }
        totalAmount = totalAmount.plus(new decimal_js_1.default(deliveryFee)).toNearest(0.01);
        const stripe = yield (0, helpers_1.initStripe)();
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: totalAmount.mul(100).toNumber(), // amount in cents
            currency: "usd",
            metadata: { userId: userId.toString() },
        });
        res.status(200).json({
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            totalAmount: totalAmount.toNumber(),
            paymentBreakdown: {
                currency: "USD",
                chargeAmount: totalChargeAmount.toNearest(0.01).toNumber(),
                subtotal: totalAmount
                    .minus(totalChargeAmount)
                    .toNearest(0.01)
                    .toNumber(),
                deliveryFee: deliveryFee,
            },
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: error.message || "Error during checkout." });
        return;
    }
});
exports.prepareCheckoutDollar = prepareCheckoutDollar;
const checkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get authenticated user ID
    const { refId, shippingAddress, shippingAddressZipCode } = req.body;
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    if (!refId) {
        res.status(400).json({ message: "Payment reference ID is required" });
        return;
    }
    if (!shippingAddress) {
        res.status(400).json({ message: "Shipping address is required" });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    let transactionCommitted = false;
    // Fetch user before the for loop so it's available
    const user = yield user_1.default.findByPk(userId, { transaction });
    if (!user) {
        throw new Error(`User not found.`);
    }
    try {
        // Fetch active Paystack secret key from PaymentGateway model
        const paymentGateway = yield paymentgateway_1.default.findOne({
            where: {
                name: "Paystack",
                isActive: true,
            },
        });
        if (!paymentGateway || !paymentGateway.secretKey) {
            throw new Error("Active Paystack gateway not configured");
        }
        const PAYSTACK_SECRET_KEY = paymentGateway.secretKey;
        // Verify payment reference with Paystack
        const verificationResponse = yield (0, helpers_1.verifyPayment)(refId, PAYSTACK_SECRET_KEY);
        if (verificationResponse.status !== "success") {
            res.status(400).json({ message: "Payment verification failed." });
            return;
        }
        const paymentData = verificationResponse;
        // Fetch cart items
        const cartItems = yield cart_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    attributes: [
                        "id",
                        "name",
                        "type",
                        "price",
                        "discount_price",
                        "vendorId",
                        "quantity",
                        "sku",
                        "variants",
                    ],
                    include: [
                        {
                            model: dropshipProducts_1.default,
                            as: "dropshipDetails",
                        },
                    ],
                },
            ],
        });
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        // Get Admin's product charges
        const productCharges = yield productcharge_1.default.findAll({
            where: { is_active: true },
        });
        // Filter out dropshipped products from cart items
        const dropShippedProducts = cartItems.filter((item) => item.productType === "dropship");
        let vendorsDropshipOrders = null;
        // Place dropship orders with dropshipping service
        if (dropShippedProducts.length > 0) {
            const dropShippedVendorProducts = new Map();
            // Group cart items by vendorId
            dropShippedProducts.forEach((cartItem) => {
                const product = cartItem.product;
                if (product) {
                    const vendorId = product.vendorId;
                    if (!dropShippedVendorProducts.has(vendorId)) {
                        dropShippedVendorProducts.set(vendorId, []);
                    }
                    dropShippedVendorProducts.get(vendorId).push(cartItem);
                }
            });
            const placeDropshipOrders = yield Promise.all(Array.from(dropShippedVendorProducts.entries()).map(
            // Place dropship order for each vendor
            (_a) => __awaiter(void 0, [_a], void 0, function* ([vendorId, cartItems]) {
                var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                // Call the dropshipping service to place orders for these cart items
                const productOrders = cartItems.map((cartItem) => {
                    var _a;
                    return ({
                        product_id: (_a = cartItem.product) === null || _a === void 0 ? void 0 : _a.dropshipDetails.dropshipProductId,
                        product_count: cartItem.quantity,
                        sku_attr: cartItem.dropshipProductSkuAttr,
                    });
                });
                // Determine user country code
                const userCountry = ((_c = (_b = user === null || user === void 0 ? void 0 : user.location) === null || _b === void 0 ? void 0 : _b.country) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "nigeria"
                    ? "NG"
                    : ((_e = (_d = user === null || user === void 0 ? void 0 : user.location) === null || _d === void 0 ? void 0 : _d.country) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === "united states" ||
                        ((_g = (_f = user === null || user === void 0 ? void 0 : user.location) === null || _f === void 0 ? void 0 : _f.country) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === "usa" ||
                        ((_j = (_h = user === null || user === void 0 ? void 0 : user.location) === null || _h === void 0 ? void 0 : _h.country) === null || _j === void 0 ? void 0 : _j.toLowerCase()) ===
                            "united states of america"
                        ? "US"
                        : "UK";
                const userCity = (_k = user === null || user === void 0 ? void 0 : user.location) === null || _k === void 0 ? void 0 : _k.city;
                if (!shippingAddressZipCode) {
                    res
                        .status(400)
                        .json({ message: "Shipping address zip code is required" });
                    return;
                }
                const phoneNumberSplit = (0, helpers_1.splitPhoneNumber)(user === null || user === void 0 ? void 0 : user.phoneNumber);
                const dropshipOrderResponse = yield dropShippingService.createOrder(vendorId, {
                    // @ts-ignore
                    products: productOrders,
                    shippingAddress: {
                        contact_person: `${user.firstName} ${user.lastName}`,
                        full_name: `${user.firstName} ${user.lastName}`,
                        country: userCountry,
                        province: (_l = user.location) === null || _l === void 0 ? void 0 : _l.state,
                        city: userCity,
                        address: shippingAddress,
                        zip: shippingAddressZipCode,
                        mobile_no: phoneNumberSplit.phone_number,
                        phone_country: phoneNumberSplit.phone_country,
                        locale: "en_US",
                    },
                });
                return { vendorId, dropshipOrderResponse };
            })));
            if (placeDropshipOrders.length === 0) {
                throw new Error("Failed to place dropship orders.");
            }
            vendorsDropshipOrders = placeDropshipOrders;
        }
        // Calculate total Aliexpress delivery fee for dropshipped products
        let totalAliexpressDeliveryFee = 0;
        if (dropShippedProducts.length > 0) {
            totalAliexpressDeliveryFee = yield getTotalAliexpressDeliveryFee(dropShippedProducts, ((_c = (_b = user.location) === null || _b === void 0 ? void 0 : _b.country) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "nigeria"
                ? "NG"
                : ((_e = (_d = user.location) === null || _d === void 0 ? void 0 : _d.country) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === "united states" ||
                    ((_g = (_f = user.location) === null || _f === void 0 ? void 0 : _f.country) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === "usa" ||
                    ((_j = (_h = user.location) === null || _h === void 0 ? void 0 : _h.country) === null || _j === void 0 ? void 0 : _j.toLowerCase()) ===
                        "united states of america"
                    ? "US"
                    : "UK", user);
        }
        // Calculate total price and validate inventory
        let totalAmount = 0;
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            if (!product) {
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
            let productPrice = new decimal_js_1.default(0);
            if (product.type === "in_stock") {
                // Check if product.quantity is defined and if there's enough stock before proceeding
                const availableQuantity = (_k = product.quantity) !== null && _k !== void 0 ? _k : 0; // If quantity is undefined, fallback to 0
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(((_l = product.discount_price) !== null && _l !== void 0 ? _l : 0) > 0
                    ? (_m = product.discount_price) !== null && _m !== void 0 ? _m : 0
                    : (_o = product.price) !== null && _o !== void 0 ? _o : 0);
            }
            else if (product.type === "dropship") {
                const dropshipProductVariant = (_p = product.variants) === null || _p === void 0 ? void 0 : _p.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (!dropshipProductVariant) {
                    throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                const availableQuantity = (_q = dropshipProductVariant.sku_available_stock) !== null && _q !== void 0 ? _q : 0;
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(
                //@ts-ignore
                ((_r = dropshipProductVariant.offer_sale_price) !== null && _r !== void 0 ? _r : 0) > 0
                    ? (_s = dropshipProductVariant.offer_sale_price) !== null && _s !== void 0 ? _s : 0
                    : (_t = dropshipProductVariant.sku_price) !== null && _t !== void 0 ? _t : 0);
            }
            else {
                throw new Error(`Unknown product type for product: ${product.name}, type: ${product.type}`);
            }
            // Check for product charge percentage
            const productChargePercentage = productCharges.find((charge) => charge.charge_currency === "NGN" &&
                charge.calculation_type === "percentage" &&
                productPrice.gte(charge.minimum_product_amount) &&
                productPrice.lte(charge.maximum_product_amount));
            // Check for product charge amount
            const productChargeAmount = productCharges.find((charge) => charge.charge_currency === "NGN" &&
                charge.calculation_type === "fixed" &&
                productPrice.gte(charge.minimum_product_amount) &&
                productPrice.lte(charge.maximum_product_amount));
            let chargeAmount = 0;
            if (productChargePercentage) {
                // Calculate percentage charge
                chargeAmount += productPrice
                    .mul(Number(productChargePercentage.charge_percentage) / 100)
                    .toNearest(0.01)
                    .toNumber();
            }
            else if (productChargeAmount) {
                // Use fixed amount charge
                chargeAmount += Number((_u = productChargeAmount.charge_amount) !== null && _u !== void 0 ? _u : 0);
            }
            // Calculate total amount for this cart item
            totalAmount += productPrice
                .plus(chargeAmount)
                .mul(cartItem.quantity)
                .toNearest(0.01)
                .toNumber();
            // totalAmount += product.price * cartItem.quantity;
        }
        // Add total Aliexpress delivery fee to total amount
        totalAmount = new decimal_js_1.default(totalAmount)
            .plus(new decimal_js_1.default(totalAliexpressDeliveryFee))
            .toNearest(0.01)
            .toNumber();
        // Validate that the total amount matches the Paystack transaction amount
        if (paymentData.amount / 100 !== totalAmount) {
            console.log("Payment amount does not match cart total");
            console.log(`Payment amount From Paystack: ${paymentData.amount}`);
            console.log(`Payment amount: ${paymentData.amount / 100}, Cart total: ${totalAmount}`);
            throw new Error("Payment amount does not match cart total");
        }
        // Create order
        const order = yield order_1.default.create({
            userId,
            totalAmount,
            refId,
            shippingAddress: `${shippingAddress}, ${(_v = user.location) === null || _v === void 0 ? void 0 : _v.city}, ${(_w = user.location) === null || _w === void 0 ? void 0 : _w.state}, ${(_x = user.location) === null || _x === void 0 ? void 0 : _x.country}`,
            status: "pending",
        }, { transaction });
        // Create order items and update product inventory
        for (const cartItem of cartItems) {
            // Ensure cartItem.product is defined
            if (!cartItem.product) {
                throw new Error(`Product information is missing for cart item with ID ${cartItem.id}`);
            }
            const product = yield product_1.default.findByPk(cartItem.product.id, {
                include: [
                    {
                        model: store_1.default,
                        as: "store",
                        attributes: ["name"],
                        include: [
                            {
                                model: currency_1.default,
                                as: "currency",
                                attributes: ["name", "symbol"],
                            },
                        ],
                    },
                    {
                        model: subcategory_1.default,
                        as: "sub_category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: dropshipProducts_1.default,
                        as: "dropshipDetails",
                    },
                ],
            });
            if (!product) {
                throw new Error(`Product with ID ${cartItem.product.id} not found.`);
            }
            if (product.type === "in_stock") {
                // Reduce product quantity in inventory
                const availableQuantity = (_y = product.quantity) !== null && _y !== void 0 ? _y : 0; // Fallback to 0 if quantity is undefined
                if (availableQuantity >= cartItem.quantity) {
                    // Update the product quantity in inventory
                    yield product.update({ quantity: availableQuantity - cartItem.quantity }, { transaction });
                }
                else {
                    throw new Error(`Not enough stock for product: ${product.name}`);
                }
            }
            else if (product.type === "dropship") {
                const dropshipProductVariant = (_z = product.variants) === null || _z === void 0 ? void 0 : _z.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                const dropshipProductVariantIndex = (_0 = product.variants) === null || _0 === void 0 ? void 0 : _0.findIndex((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (!dropshipProductVariant) {
                    throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                const availableQuantity = (_1 = dropshipProductVariant.sku_available_stock) !== null && _1 !== void 0 ? _1 : 0;
                if (availableQuantity >= cartItem.quantity) {
                    // Update the dropship product variant stock in inventory
                    yield product.update({
                        variants: [
                            ...product.variants.slice(0, dropshipProductVariantIndex),
                            Object.assign(Object.assign({}, dropshipProductVariant), { sku_available_stock: availableQuantity - cartItem.quantity }),
                            ...product.variants.slice(dropshipProductVariantIndex + 1),
                        ],
                    }, {
                        where: { id: dropshipProductVariant.id },
                        transaction,
                    });
                }
                else {
                    throw new Error(`Not enough stock for dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} for product: ${product.name}`);
                }
            }
            // Check if vendorId exists in the User table (Vendor)
            const vendor = yield user_1.default.findByPk(product.vendorId);
            // Check if vendorId exists in the Admin table
            const admin = yield admin_1.default.findByPk(product.vendorId);
            if (!vendor && !admin) {
                res.status(404).json({ message: "Owner not found" });
                return;
            }
            let dropshipOrderIds = null;
            if (cartItem.productType === "dropship") {
                const vendorDropshipOrderIds = vendorsDropshipOrders === null || vendorsDropshipOrders === void 0 ? void 0 : vendorsDropshipOrders.find((order) => (order === null || order === void 0 ? void 0 : order.vendorId) === product.vendorId);
                dropshipOrderIds = vendorDropshipOrderIds === null || vendorDropshipOrderIds === void 0 ? void 0 : vendorDropshipOrderIds.dropshipOrderResponse;
                if (!dropshipOrderIds || dropshipOrderIds.length === 0) {
                    throw new Error(`Failed to retrieve dropship order IDs for vendor ID: ${product.vendorId}`);
                }
            }
            const productPrice = product.type === "in_stock"
                ? product.discount_price && product.discount_price > 0
                    ? product.discount_price
                    : product.price
                : (() => {
                    var _a;
                    const dropshipProductVariant = (_a = product.variants) === null || _a === void 0 ? void 0 : _a.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                    if (!dropshipProductVariant) {
                        throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                    }
                    return dropshipProductVariant.offer_sale_price &&
                        new decimal_js_1.default(dropshipProductVariant.offer_sale_price).gt(0)
                        ? dropshipProductVariant.offer_sale_price
                        : dropshipProductVariant.sku_price;
                })();
            // Create the order item
            yield orderitem_1.default.create({
                vendorId: product.vendorId,
                orderId: order.id,
                product: product,
                quantity: cartItem.quantity,
                dropshipProductId: cartItem.dropshipProductSkuId,
                dropshipOrderItemIds: dropshipOrderIds,
                price: productPrice,
            }, { transaction });
            // Fetch user before the for loop so it's available
            const user = yield user_1.default.findByPk(userId, { transaction });
            if (!user) {
                throw new Error(`User not found.`);
            }
            if (vendor) {
                yield notification_1.default.create({
                    userId: vendor.id,
                    title: "New Order Received",
                    type: "new_order",
                    message: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
                }, { transaction });
                // Update vendor's pending wallet
                yield vendor.update({
                    pendingWallet: new decimal_js_1.default(vendor.pendingWallet || 0).plus(productPrice),
                }, { transaction, where: { id: vendor.id } });
                const message = messages_1.emailTemplates.newOrderNotification(vendor, order, user, cartItem.product, cartItem.quantity);
                try {
                    yield (0, mail_service_1.sendMail)(vendor.email, `${process.env.APP_NAME} - New Order Received`, message);
                }
                catch (emailError) {
                    logger_1.default.error("Error sending email:", emailError);
                }
                if (vendor.fcmToken) {
                    try {
                        // Send push notification to the vendor
                        const notificationMessage = {
                            notification: {
                                title: "New Order Received",
                                body: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
                            },
                            data: {
                                orderId: order.id,
                                type: index_2.PushNotificationTypes.ORDER_CREATED,
                            },
                            token: vendor.fcmToken, // FCM token of the vendor
                        };
                        yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                    }
                    catch (pushError) {
                        logger_1.default.error("Error sending push notification:", pushError);
                    }
                }
            }
            else if (admin) {
                yield notification_1.default.create({
                    userId: admin.id,
                    title: "New Order Received",
                    type: "new_order",
                    message: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed.`,
                }, { transaction });
                const message = messages_1.emailTemplates.newOrderAdminNotification(admin, order, user, cartItem.product);
                try {
                    yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - New Order Received`, message);
                }
                catch (emailError) {
                    logger_1.default.error("Error sending email:", emailError);
                }
                if (admin.fcmToken) {
                    try {
                        // Send push notification to the admin
                        const notificationMessage = {
                            notification: {
                                title: "New Order Received",
                                body: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed.`,
                            },
                            data: {
                                orderId: order.id,
                                type: index_2.PushNotificationTypes.ORDER_CREATED,
                            },
                            token: admin.fcmToken, // FCM token of the admin
                        };
                        yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                    }
                    catch (pushError) {
                        logger_1.default.error("Error sending push notification:", pushError);
                    }
                }
            }
        }
        // Create payment record
        const payment = yield payment_1.default.create({
            orderId: order.id,
            refId,
            amount: paymentData.amount / 100,
            currency: paymentData.currency,
            status: paymentData.status,
            channel: paymentData.channel,
            paymentDate: paymentData.transaction_date,
        }, { transaction });
        const groupedVendorOrders = {};
        cartItems.forEach((cartItem) => {
            if (!cartItem.product) {
                logger_1.default.error(`❌ Product not found for cart item with ID ${cartItem.id}`);
                throw new Error(`Product not found for cart item with ID ${cartItem.id}`);
            }
            const vendorId = cartItem.product.vendorId;
            if (!groupedVendorOrders[vendorId]) {
                groupedVendorOrders[vendorId] = [];
            }
            groupedVendorOrders[vendorId].push({
                vendorId: vendorId,
                orderId: order.id, // Ensure orderId is included
                product: {
                    id: cartItem.product.id,
                    sku: cartItem.product.sku,
                    name: cartItem.product.name,
                    price: cartItem.product.discount_price &&
                        cartItem.product.discount_price > 0
                        ? cartItem.product.discount_price
                        : cartItem.product.price,
                }, // Ensure product is an object
                quantity: cartItem.quantity,
                price: cartItem.product.discount_price && cartItem.product.discount_price > 0
                    ? cartItem.product.discount_price
                    : cartItem.product.price,
                status: "pending", // Default status (if required)
                createdAt: new Date(), // Ensure timestamps if needed
            });
        });
        // Clear user's cart
        yield cart_1.default.destroy({ where: { userId }, transaction });
        // Notify the Buyer
        yield notification_1.default.create({
            userId,
            title: "Order Confirmation",
            type: "order_confirmation",
            message: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
        }, { transaction });
        // Commit the transaction
        yield transaction.commit();
        transactionCommitted = true; // Mark as committed
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderConfirmationNotification(user, order, groupedVendorOrders, "₦");
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Order Confirmation`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError);
        }
        if (user.fcmToken) {
            try {
                // Send push notification to the user
                const notificationMessage = {
                    notification: {
                        title: "Order Confirmation",
                        body: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
                    },
                    data: {
                        orderId: order.id,
                        type: index_2.PushNotificationTypes.ORDER_CONFIRMATION,
                    },
                    token: user.fcmToken, // FCM token of the user
                };
                yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
            }
            catch (pushError) {
                logger_1.default.error("Error sending push notification:", pushError);
            }
        }
        res.status(200).json({
            message: "Checkout successful",
        });
    }
    catch (error) {
        if (!transactionCommitted) {
            yield transaction.rollback();
        }
        logger_1.default.error("Error during checkout:", error);
        res.status(500).json({ message: error.message || "Checkout failed" });
    }
});
exports.checkout = checkout;
const checkoutDollar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { refId, shippingAddress, shippingAddressZipCode } = req.body;
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    if (!refId) {
        res.status(400).json({ message: "Payment reference ID is required" });
        return;
    }
    if (!shippingAddress) {
        res.status(400).json({ message: "Shipping address is required" });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    let transactionCommitted = false;
    try {
        const stripe = yield (0, helpers_1.initStripe)();
        const paymentIntent = yield stripe.paymentIntents.retrieve(refId);
        if (paymentIntent.status !== "succeeded") {
            res.status(400).json({ message: "Payment verification failed." });
            return;
        }
        // Fetch cart items
        const cartItems = yield cart_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    attributes: [
                        "id",
                        "name",
                        "price",
                        "discount_price",
                        "vendorId",
                        "quantity",
                        "type",
                        "variants",
                    ],
                    include: [
                        {
                            model: dropshipProducts_1.default,
                            as: "dropshipDetails",
                        },
                    ],
                },
            ],
        });
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        // Filter out dropshipped products from cart items
        const dropShippedProducts = cartItems.filter((item) => item.productType === "dropship");
        const user = yield user_1.default.findByPk(userId, { transaction });
        if (!user) {
            throw new Error("User not found.");
        }
        let vendorsDropshipOrders = null;
        // Place dropship orders with dropshipping service
        if (dropShippedProducts.length > 0) {
            const dropShippedVendorProducts = new Map();
            // Group cart items by vendorId
            dropShippedProducts.forEach((cartItem) => {
                const product = cartItem.product;
                if (product) {
                    const vendorId = product.vendorId;
                    if (!dropShippedVendorProducts.has(vendorId)) {
                        dropShippedVendorProducts.set(vendorId, []);
                    }
                    dropShippedVendorProducts.get(vendorId).push(cartItem);
                }
            });
            const placeDropshipOrders = yield Promise.all(Array.from(dropShippedVendorProducts.entries()).map(
            // Place dropship order for each vendor
            (_a) => __awaiter(void 0, [_a], void 0, function* ([vendorId, cartItems]) {
                var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                // Call the dropshipping service to place orders for these cart items
                const productOrders = cartItems.map((cartItem) => {
                    var _a;
                    return ({
                        product_id: (_a = cartItem.product) === null || _a === void 0 ? void 0 : _a.dropshipDetails.dropshipProductId,
                        product_count: cartItem.quantity,
                        sku_attr: cartItem.dropshipProductSkuAttr,
                    });
                });
                // Determine user country code
                const userCountry = ((_c = (_b = user === null || user === void 0 ? void 0 : user.location) === null || _b === void 0 ? void 0 : _b.country) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "nigeria"
                    ? "NG"
                    : ((_e = (_d = user === null || user === void 0 ? void 0 : user.location) === null || _d === void 0 ? void 0 : _d.country) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === "united states" ||
                        ((_g = (_f = user === null || user === void 0 ? void 0 : user.location) === null || _f === void 0 ? void 0 : _f.country) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === "usa" ||
                        ((_j = (_h = user === null || user === void 0 ? void 0 : user.location) === null || _h === void 0 ? void 0 : _h.country) === null || _j === void 0 ? void 0 : _j.toLowerCase()) ===
                            "united states of america"
                        ? "US"
                        : "UK";
                const userCity = (_k = user === null || user === void 0 ? void 0 : user.location) === null || _k === void 0 ? void 0 : _k.city;
                if (!shippingAddressZipCode) {
                    res
                        .status(400)
                        .json({ message: "Shipping address zip code is required" });
                    return;
                }
                const phoneNumberSplit = (0, helpers_1.splitPhoneNumber)(user === null || user === void 0 ? void 0 : user.phoneNumber);
                const dropshipOrderResponse = yield dropShippingService.createOrder(vendorId, {
                    // @ts-ignore
                    products: productOrders,
                    shippingAddress: {
                        contact_person: `${user.firstName} ${user.lastName}`,
                        full_name: `${user.firstName} ${user.lastName}`,
                        country: userCountry,
                        province: (_l = user.location) === null || _l === void 0 ? void 0 : _l.state,
                        city: userCity,
                        address: shippingAddress,
                        zip: shippingAddressZipCode,
                        mobile_no: phoneNumberSplit.phone_number,
                        phone_country: phoneNumberSplit.phone_country,
                        locale: "en_US",
                    },
                });
                return { vendorId, dropshipOrderResponse };
            })));
            if (placeDropshipOrders.length === 0) {
                throw new Error("Failed to place dropship orders.");
            }
            vendorsDropshipOrders = placeDropshipOrders;
        }
        // Calculate total Aliexpress delivery fee for dropshipped products
        let totalAliexpressDeliveryFee = 0;
        if (dropShippedProducts.length > 0) {
            totalAliexpressDeliveryFee = yield getTotalAliexpressDeliveryFee(dropShippedProducts, ((_c = (_b = user.location) === null || _b === void 0 ? void 0 : _b.country) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "nigeria"
                ? "NG"
                : ((_e = (_d = user.location) === null || _d === void 0 ? void 0 : _d.country) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === "united states" ||
                    ((_g = (_f = user.location) === null || _f === void 0 ? void 0 : _f.country) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === "usa" ||
                    ((_j = (_h = user.location) === null || _h === void 0 ? void 0 : _h.country) === null || _j === void 0 ? void 0 : _j.toLowerCase()) ===
                        "united states of america"
                    ? "US"
                    : "UK", user);
        }
        // Get Admin's product charges
        const productCharges = yield productcharge_1.default.findAll({
            where: { is_active: true },
        });
        // Calculate total price and validate inventory
        let totalAmount = new decimal_js_1.default(0);
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            if (!product) {
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
            let productPrice;
            if (product.type === "in_stock") {
                // Check if product.quantity is defined and if there's enough stock before proceeding
                const availableQuantity = (_k = product.quantity) !== null && _k !== void 0 ? _k : 0; // If quantity is undefined, fallback to 0
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(((_l = product.discount_price) !== null && _l !== void 0 ? _l : 0) > 0
                    ? (_m = product.discount_price) !== null && _m !== void 0 ? _m : 0
                    : (_o = product.price) !== null && _o !== void 0 ? _o : 0);
            }
            else if (product.type === "dropship") {
                const dropshipProductVariant = (_p = product.variants) === null || _p === void 0 ? void 0 : _p.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (!dropshipProductVariant) {
                    throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                const availableQuantity = (_q = dropshipProductVariant.sku_available_stock) !== null && _q !== void 0 ? _q : 0;
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(
                //@ts-ignore
                ((_r = dropshipProductVariant.offer_sale_price) !== null && _r !== void 0 ? _r : 0) > 0
                    ? (_s = dropshipProductVariant.offer_sale_price) !== null && _s !== void 0 ? _s : 0
                    : (_t = dropshipProductVariant.sku_price) !== null && _t !== void 0 ? _t : 0);
            }
            else {
                throw new Error(`Unknown product type for product: ${product.name}, type: ${product.type}`);
            }
            // Check for product charge percentage
            const productChargePercentage = productCharges.find((charge) => charge.charge_currency === "USD" &&
                charge.calculation_type === "percentage" &&
                new decimal_js_1.default(productPrice).greaterThanOrEqualTo(charge.minimum_product_amount) &&
                new decimal_js_1.default(productPrice).lessThanOrEqualTo(charge.maximum_product_amount));
            // Check for product charge amount
            const productChargeAmount = productCharges.find((charge) => charge.charge_currency === "USD" &&
                charge.calculation_type === "fixed" &&
                new decimal_js_1.default(productPrice).greaterThanOrEqualTo(charge.minimum_product_amount) &&
                new decimal_js_1.default(productPrice).lessThanOrEqualTo(charge.maximum_product_amount));
            let chargeAmount = new decimal_js_1.default(0);
            if (productChargePercentage) {
                // Calculate percentage charge
                chargeAmount = chargeAmount
                    .plus(new decimal_js_1.default(productPrice !== null && productPrice !== void 0 ? productPrice : 0))
                    .mul(new decimal_js_1.default(productChargePercentage.charge_percentage).div(100))
                    .toNearest(0.01);
            }
            else if (productChargeAmount) {
                // Use fixed amount charge
                chargeAmount = chargeAmount
                    .plus((_u = productChargeAmount.charge_amount) !== null && _u !== void 0 ? _u : 0)
                    .toNearest(0.01);
            }
            // Calculate total amount for this cart item
            totalAmount = totalAmount
                .plus(productPrice.plus(chargeAmount).mul(cartItem.quantity))
                .toNearest(0.01);
            // totalAmount += product.price * cartItem.quantity;
        }
        // Add total Aliexpress delivery fee to total amount
        // Add total Aliexpress delivery fee to total amount
        totalAmount = totalAmount.plus(new decimal_js_1.default(totalAliexpressDeliveryFee)).toNearest(0.01);
        const receivedAmount = new decimal_js_1.default(paymentIntent.amount_received).div(100);
        if (!receivedAmount.eq(totalAmount)) {
            logger_1.default.error(`Payment mismatch: Expected ${totalAmount.toNumber()}, Received ${receivedAmount.toNumber()}`);
            res.status(400).json({
                message: `Payment amount does not match cart total. Expected: $${totalAmount.toNumber()}, Received: $${receivedAmount.toNumber()}`,
            });
            return;
        }
        const vendorOrders = {}; // Stores vendor-specific order items
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            if (!product)
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            //
            let availableQuantity = 0;
            let productPrice = new decimal_js_1.default(0);
            if (product.type === "in_stock") {
                // Check if product has enough stock
                const availableQuantity = (_v = product.quantity) !== null && _v !== void 0 ? _v : 0; // Fallback to 0 if undefined
                if (availableQuantity < cartItem.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(((_w = product.discount_price) !== null && _w !== void 0 ? _w : 0) > 0
                    ? (_x = product.discount_price) !== null && _x !== void 0 ? _x : 0
                    : (_y = product.price) !== null && _y !== void 0 ? _y : 0);
            }
            else if (product.type === "dropship") {
                const dropshipProductVariant = (_z = product.variants) === null || _z === void 0 ? void 0 : _z.find((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (!dropshipProductVariant) {
                    throw new ApiError_1.BadRequestError(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                availableQuantity = (_0 = dropshipProductVariant.sku_available_stock) !== null && _0 !== void 0 ? _0 : 0;
                if (availableQuantity < cartItem.quantity) {
                    throw new ApiError_1.BadRequestError(`Insufficient stock for dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} for product: ${product.name}`);
                }
                productPrice = new decimal_js_1.default(
                //@ts-ignore
                ((_1 = dropshipProductVariant.offer_sale_price) !== null && _1 !== void 0 ? _1 : 0) > 0
                    ? (_2 = dropshipProductVariant.offer_sale_price) !== null && _2 !== void 0 ? _2 : 0
                    : (_3 = dropshipProductVariant.sku_price) !== null && _3 !== void 0 ? _3 : 0);
            }
            const productInfo = yield product_1.default.findByPk(cartItem.productId, {
                include: [
                    {
                        model: store_1.default,
                        as: "store",
                        attributes: ["name"],
                        include: [
                            {
                                model: currency_1.default,
                                as: "currency",
                                attributes: ["name", "symbol"],
                            },
                        ],
                    },
                    {
                        model: subcategory_1.default,
                        as: "sub_category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: dropshipProducts_1.default,
                        as: "dropshipDetails",
                    },
                ],
            });
            if (!productInfo) {
                throw new Error(`Product with ID ${cartItem.productId} not found.`);
            }
            if (product.type === "in_stock") {
                // Reduce stock quantity
                const newQuantity = availableQuantity - cartItem.quantity;
                yield product.update({ quantity: newQuantity }, { transaction });
            }
            else if (product.type === "dropship") {
                const dropshipProductVariantIndex = (_4 = product.variants) === null || _4 === void 0 ? void 0 : _4.findIndex((variant) => variant.sku_id === cartItem.dropshipProductSkuId);
                if (dropshipProductVariantIndex === undefined ||
                    dropshipProductVariantIndex < 0) {
                    throw new Error(`Dropship product variant with SKU ID ${cartItem.dropshipProductSkuId} not found for product: ${product.name}`);
                }
                // Reduce dropship variant stock quantity
                const newVariantQuantity = availableQuantity - cartItem.quantity;
                const updatedVariants = [...product.variants];
                updatedVariants[dropshipProductVariantIndex] = Object.assign(Object.assign({}, updatedVariants[dropshipProductVariantIndex]), { sku_available_stock: newVariantQuantity });
                yield product.update({ variants: updatedVariants }, { transaction });
            }
            //totalAmount += product.price * cartItem.quantity;
            // Organize order items by vendor
            if (!vendorOrders[product.vendorId]) {
                vendorOrders[product.vendorId] = [];
            }
            vendorOrders[product.vendorId].push({
                vendorId: product.vendorId,
                product: productInfo,
                quantity: cartItem.quantity,
                price: productPrice.toNumber(),
            });
        }
        // Create a single order for the buyer
        const order = yield order_1.default.create({
            userId,
            totalAmount,
            refId,
            shippingAddress: `${shippingAddress}, ${(_5 = user.location) === null || _5 === void 0 ? void 0 : _5.city}, ${(_6 = user.location) === null || _6 === void 0 ? void 0 : _6.state}, ${(_7 = user.location) === null || _7 === void 0 ? void 0 : _7.country}`,
            status: "pending",
        }, { transaction });
        // Process order items per vendor
        // Fetch user before the vendorOrders loop so it's available and not null
        for (const vendorId in vendorOrders) {
            const vendorOrderItems = vendorOrders[vendorId];
            // Loop through each order item for the current vendor
            for (const item of vendorOrderItems) {
                let dropshipOrderIds = null;
                let dropshipProductId = null;
                //@ts-ignore
                if (item.product.type === "dropship") {
                    dropshipOrderIds = (_8 = vendorsDropshipOrders === null || vendorsDropshipOrders === void 0 ? void 0 : vendorsDropshipOrders.find((order) => (order === null || order === void 0 ? void 0 : order.vendorId) === item.vendorId)) === null || _8 === void 0 ? void 0 : _8.dropshipOrderResponse;
                    dropshipProductId =
                        //@ts-ignore
                        item.product.dropshipDetails.dropshipProductId;
                }
                // Create the order item in the database
                yield orderitem_1.default.create({
                    vendorId: vendorId,
                    orderId: order.id,
                    product: item.product,
                    quantity: item.quantity,
                    price: item.price,
                    dropshipProductId,
                    dropshipOrderItemIds: dropshipOrderIds,
                }, { transaction });
                // Fetch vendor object
                const vendor = yield user_1.default.findByPk(vendorId, { transaction });
                const admin = yield admin_1.default.findByPk(vendorId, { transaction });
                if (!vendor && !admin) {
                    throw new Error(`Owner not found`);
                }
                // Fetch user (customer) object
                const user = yield user_1.default.findByPk(order.userId, { transaction });
                if (!user) {
                    throw new Error(`User not found.`);
                }
                if (vendor) {
                    try {
                        // Create the email message for the current order item
                        const message = messages_1.emailTemplates.newOrderNotification(vendor, order, user, item.product, item.quantity);
                        // Send the email to the vendor
                        yield (0, mail_service_1.sendMail)(vendor.email, `${process.env.APP_NAME} - New Order Received`, message);
                        if (vendor.fcmToken) {
                            try {
                                // Send push notification to the vendor
                                const notificationMessage = {
                                    notification: {
                                        title: "New Order Received",
                                        body: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
                                    },
                                    data: {
                                        orderId: order.id,
                                        type: index_2.PushNotificationTypes.ORDER_CREATED,
                                    },
                                    token: vendor.fcmToken, // FCM token of the vendor
                                };
                                yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                            }
                            catch (pushError) {
                                logger_1.default.error("Error sending push notification:", pushError);
                            }
                        }
                    }
                    catch (emailError) {
                        logger_1.default.error("Error sending email:", emailError);
                    }
                }
                else if (admin) {
                    // Create the email message for the current order item
                    const message = messages_1.emailTemplates.newOrderAdminNotification(admin, order, user, item.product);
                    try {
                        // Send the email to the admin
                        yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - New Order Received`, message);
                        if (admin.fcmToken) {
                            try {
                                // Send push notification to the admin
                                const notificationMessage = {
                                    notification: {
                                        title: "New Order Received",
                                        body: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed.`,
                                    },
                                    data: {
                                        orderId: order.id,
                                        type: index_2.PushNotificationTypes.ORDER_CREATED,
                                    },
                                    token: admin.fcmToken, // FCM token of the admin
                                };
                                yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                            }
                            catch (pushError) {
                                logger_1.default.error("Error sending push notification:", pushError);
                            }
                        }
                    }
                    catch (emailError) {
                        logger_1.default.error("Error sending email:", emailError);
                    }
                }
            }
        }
        // Save payment details
        yield payment_1.default.create({
            orderId: order.id,
            refId,
            amount: totalAmount,
            currency: "USD",
            status: "success",
            channel: "Stripe",
            paymentDate: new Date(),
        }, { transaction });
        // Clear cart
        yield cart_1.default.destroy({ where: { userId }, transaction });
        // **Send Notifications**
        // Notify the Buyer
        yield notification_1.default.create({
            userId,
            title: "Order Confirmation",
            type: "order_confirmation",
            message: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
        }, { transaction });
        // Notify Each Vendor/Admin
        for (const vendorId in vendorOrders) {
            const vendorOrderItems = vendorOrders[vendorId]; // Get all order items for this vendor
            for (const item of vendorOrderItems) {
                // Loop through each order item for the current vendor
                console.log("Vendor ID: ", vendorId);
                const vendor = yield user_1.default.findByPk(vendorId);
                const admin = yield admin_1.default.findByPk(vendorId);
                if (!vendor && !admin) {
                    res.status(404).json({ message: "Owner not found" });
                    return;
                }
                if (vendor) {
                    yield notification_1.default.create({
                        userId: vendor.id,
                        title: "New Order Received",
                        type: "new_order",
                        message: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
                    }, { transaction });
                    // Update vendor's pending wallet
                    yield vendor.update({
                        pendingDollarWallet: new decimal_js_1.default(vendor.pendingDollarWallet || 0)
                            .plus(item.price)
                            .toNumber(),
                    }, { transaction, where: { id: vendor.id } });
                    const message = messages_1.emailTemplates.newOrderNotification(vendor, order, user, item.product, item.quantity);
                    try {
                        yield (0, mail_service_1.sendMail)(vendor.email, `${process.env.APP_NAME} - New Order Received`, message);
                    }
                    catch (emailError) {
                        logger_1.default.error("Error sending email:", emailError);
                    }
                }
                else if (admin) {
                    yield notification_1.default.create({
                        userId: admin.id,
                        title: "New Order Received",
                        type: "new_order",
                        message: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed for your product.`,
                    }, { transaction });
                    // Commit transaction before sending notifications
                    yield transaction.commit();
                    transactionCommitted = true; // Mark as committed
                    const message = messages_1.emailTemplates.newOrderAdminNotification(admin, order, user, item.product);
                    try {
                        yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - New Order Received`, message);
                        if (admin.fcmToken) {
                            try {
                                // Send push notification to the admin
                                const notificationMessage = {
                                    notification: {
                                        title: "New Order Received",
                                        body: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed.`,
                                    },
                                    data: {
                                        orderId: order.id,
                                        type: index_2.PushNotificationTypes.ORDER_CREATED,
                                    },
                                    token: admin.fcmToken, // FCM token of the admin
                                };
                                yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                            }
                            catch (pushError) {
                                logger_1.default.error("Error sending push notification:", pushError);
                            }
                        }
                    }
                    catch (emailError) {
                        logger_1.default.error("Error sending email:", emailError);
                    }
                }
            }
        }
        transactionCommitted = true; // Mark as committed
        transaction.commit();
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderConfirmationNotification(user, order, vendorOrders, "$");
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Order Confirmation`, message);
            if (user.fcmToken) {
                try {
                    // Send push notification to the user
                    const notificationMessage = {
                        notification: {
                            title: "Order Confirmation",
                            body: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
                        },
                        data: {
                            orderId: order.id,
                            type: index_2.PushNotificationTypes.ORDER_CONFIRMATION,
                        },
                        token: user.fcmToken, // FCM token of the user
                    };
                    yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                }
                catch (pushError) {
                    logger_1.default.error("Error sending push notification:", pushError);
                }
            }
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError);
        }
        res.status(200).json({
            message: "Checkout successful",
        });
    }
    catch (error) {
        if (!transactionCommitted) {
            yield transaction.rollback();
        }
        logger_1.default.error("Error during checkout:", error);
        res.status(500).json({ message: "Checkout failed: " + error.message });
    }
});
exports.checkoutDollar = checkoutDollar;
// Bid
const showInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { auctionProductId, amountPaid } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
        // Fetch the auction product
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                id: auctionProductId,
                auctionStatus: "upcoming", // Ensure auction status is "upcoming"
            },
        });
        if (!auctionProduct) {
            res
                .status(404)
                .json({ message: "Auction product not found or is not upcoming." });
            return;
        }
        // Validate auction date is not the start date
        if (auctionProduct.startDate &&
            new Date(auctionProduct.startDate).toDateString() ===
                new Date().toDateString()) {
            res.status(400).json({
                message: "You cannot show interest on the day the auction starts.",
            });
            return;
        }
        // Check if user has already shown interest
        const existingInterest = yield showinterest_1.default.findOne({
            where: { userId, auctionProductId },
        });
        if (existingInterest) {
            res
                .status(400)
                .json({ message: "You have already shown interest in this auction." });
            return;
        }
        // Create a new interest record
        const newInterest = yield showinterest_1.default.create({
            userId,
            auctionProductId,
            amountPaid,
            status: "confirmed",
        });
        // Fetch the user based on userId
        const user = yield user_1.default.findOne({ where: { id: userId } });
        if (!user) {
            logger_1.default.warn(`User with ID ${userId} not found. Email notification skipped.`);
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Notify user via email
        if (user.email) {
            const message = messages_1.emailTemplates.interestNotification(user, amountPaid, auctionProduct);
            try {
                yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Interest Confirmation`, message);
            }
            catch (emailError) {
                logger_1.default.error("Error sending email notification:", emailError);
            }
        }
        else {
            logger_1.default.warn(`User with ID ${userId} has no email. Notification skipped.`);
        }
        try {
            // create auction reminder
            yield (0, reminder_service_1.createAuctionReminder)(user.id, auctionProductId, auctionProduct.startDate);
        }
        catch (reminderError) {
            logger_1.default.error("Error creating auction reminder:", reminderError);
        }
        res.status(200).json({
            message: "Interest recorded successfully. Please wait for confirmation.",
            data: newInterest,
        });
    }
    catch (error) {
        logger_1.default.error("Error showing interest:", error);
        res.status(500).json({
            message: error.message || "An error occurred while recording your interest.",
        });
    }
});
exports.showInterest = showInterest;
const getAllAuctionProductsInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get authenticated user ID
        if (!userId) {
            res
                .status(401)
                .json({ message: "Unauthorized: User not authenticated." });
            return;
        }
        // Fetch all interests for the authenticated user
        const userAuctionProductInterests = yield showinterest_1.default.findAll({
            where: { userId }, // Filter by authenticated user ID
            include: [
                {
                    model: auctionproduct_1.default,
                    as: "auctionProduct",
                    include: [
                        {
                            model: user_1.default,
                            as: "vendor",
                        },
                        {
                            model: admin_1.default,
                            as: "admin",
                            attributes: ["id", "name", "email"],
                        },
                        {
                            model: store_1.default,
                            as: "store",
                            attributes: ["name"],
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ["symbol"],
                                },
                            ],
                        },
                        {
                            model: subcategory_1.default,
                            as: "sub_category",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
        });
        res.status(200).json({
            message: "User auction product interests retrieved successfully.",
            data: userAuctionProductInterests,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving user auction product interests:", error);
        res.status(500).json({
            message: error.message || "An error occurred while retrieving interests.",
        });
    }
});
exports.getAllAuctionProductsInterest = getAllAuctionProductsInterest;
const placeBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { auctionProductId, bidAmount } = req.body;
        const bidderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
        // Check if the user has an interest in the auction product
        const existingInterest = yield showinterest_1.default.findOne({
            where: {
                userId: bidderId,
                auctionProductId,
                status: "confirmed",
            },
        });
        if (!existingInterest) {
            res.status(403).json({
                message: "You must show interest in this auction before placing a bid.",
            });
            return;
        }
        // Fetch the auction product
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                id: auctionProductId,
                auctionStatus: "ongoing",
                startDate: { [sequelize_1.Op.lte]: new Date() },
                endDate: { [sequelize_1.Op.gte]: new Date() },
            },
            include: [
                {
                    model: bid_1.default,
                    as: "bids",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                        },
                    ],
                },
            ],
            order: [[{ model: bid_1.default, as: "bids" }, "bidAmount", "DESC"]], // Ordering the bids by amount descending
        });
        if (!auctionProduct) {
            res.status(404).json({
                message: "Auction product not found or auction is not ongoing.",
            });
            return;
        }
        // Get the current highest bid
        const highestBid = (_b = auctionProduct === null || auctionProduct === void 0 ? void 0 : auctionProduct.bids) === null || _b === void 0 ? void 0 : _b[0];
        // Determine minimum acceptable bid
        const highestBidAmount = highestBid ? Number(highestBid.bidAmount) : 0;
        const bidIncrement = auctionProduct.bidIncrement
            ? Number(auctionProduct.bidIncrement)
            : 0;
        const startingPrice = auctionProduct.price
            ? Number(auctionProduct.price)
            : 0;
        // Determine minimum acceptable bid
        const minAcceptableBid = highestBid
            ? highestBidAmount + bidIncrement
            : startingPrice;
        if (isNaN(minAcceptableBid)) {
            logger_1.default.error("Invalid minimum acceptable bid calculation.");
            res
                .status(500)
                .json({ message: "Invalid minimum acceptable bid calculation." });
            return;
        }
        if (bidAmount < minAcceptableBid) {
            res.status(400).json({
                message: `Bid amount must be at least ${minAcceptableBid.toFixed(2)}.`,
            });
            return;
        }
        // Notify all previous bidders (except the current highest bidder)
        if (auctionProduct.bids && auctionProduct.bids.length > 0) {
            const previousBidders = auctionProduct.bids.filter((bid) => bid.bidderId !== bidderId && bid.user);
            for (const previousBid of previousBidders) {
                if (previousBid.user) {
                    // Ensure user is not undefined
                    try {
                        // Generate outbid notification message
                        const message = messages_1.emailTemplates.outBidNotification(previousBid, auctionProduct);
                        // Send notification email
                        yield (0, mail_service_1.sendMail)(previousBid.user.email, `${process.env.APP_NAME} - Outbid Notification`, message);
                    }
                    catch (emailError) {
                        logger_1.default.error(`Error sending email to ${previousBid.user.email}:`, emailError);
                    }
                }
            }
        }
        // Find an existing bid by the current bidder
        const existingBid = yield bid_1.default.findOne({
            where: { auctionProductId, bidderId },
        });
        if (existingBid) {
            // Update the existing bid amount and increment bidCount
            existingBid.bidAmount = bidAmount;
            existingBid.isWinningBid = true;
            existingBid.bidCount = Number(existingBid.bidCount || 0) + 1; // Increment bid count
            yield existingBid.save();
            // Update previous highest bid status
            if (highestBid && highestBid.bidderId !== bidderId) {
                highestBid.isWinningBid = false;
                yield highestBid.save();
            }
            // Real-time bid update via WebSocket
            index_1.io.to(auctionProductId).emit("newBid", {
                auctionProductId,
                bidAmount: existingBid.bidAmount,
                bidderId: existingBid.bidderId,
            });
            res.status(200).json({
                message: "Bid updated successfully.",
                data: existingBid,
            });
            return;
        }
        // Create the new bid
        const newBid = yield bid_1.default.create({
            auctionProductId,
            bidderId,
            bidAmount,
            bidCount: 1, // Initialize bid count for new bids
        });
        // Update previous highest bid status
        if (highestBid) {
            highestBid.isWinningBid = false;
            yield highestBid.save();
        }
        // Mark new bid as the winning bid
        newBid.isWinningBid = true;
        yield newBid.save();
        // Real-time bid update via WebSocket
        index_1.io.to(auctionProductId).emit("newBid", {
            auctionProductId,
            bidAmount: newBid.bidAmount,
            bidderId: newBid.bidderId,
        });
        res.status(200).json({
            message: "Bid placed successfully.",
            data: newBid,
        });
    }
    catch (error) {
        logger_1.default.error("Error placing bid:", error);
        res.status(500).json({
            message: "An error occurred while placing your bid.",
        });
    }
});
exports.placeBid = placeBid;
const actionProductBidders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionproductId } = req.query; // Ensure userId is passed in the request
    try {
        // Fetch the main product by ID or SKU
        const product = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { id: auctionproductId },
                    { SKU: auctionproductId }, // Replace 'SKU' with the actual SKU column name if different
                ],
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    attributes: ["id", "name"],
                },
                {
                    model: bid_1.default,
                    as: "bids",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                        },
                    ],
                },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json({ data: product });
    }
    catch (error) {
        logger_1.default.error("Error fetching product:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching the product.",
        });
    }
});
exports.actionProductBidders = actionProductBidders;
const becomeVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        // Fetch the user
        const user = yield user_1.default.findByPk(userId, { transaction });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            yield transaction.rollback();
            return;
        }
        // Check if the user is already a vendor
        if (user.accountType === "Vendor") {
            res.status(400).json({ message: "User is already a vendor" });
            yield transaction.rollback();
            return;
        }
        // Check if the user is eligible to become a vendor
        if (user.accountType !== "Customer") {
            res
                .status(400)
                .json({ message: "Account type cannot be changed to vendor" });
            yield transaction.rollback();
            return;
        }
        // Update the accountType to vendor
        user.accountType = "Vendor";
        yield user.save({ transaction });
        // Find the free subscription plan
        const freePlan = yield subscriptionplan_1.default.findOne({
            where: { name: "Free Plan" },
            transaction,
        });
        if (!freePlan) {
            res
                .status(400)
                .json({ message: "Free plan not found. Please contact support." });
            yield transaction.rollback();
            return;
        }
        // Assign the free plan to the new user
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + freePlan.duration);
        yield vendorsubscription_1.default.create({
            vendorId: user.id,
            subscriptionPlanId: freePlan.id,
            startDate,
            endDate,
            isActive: true,
        }, { transaction });
        // Send a notification for becoming a vendor
        yield notification_1.default.create({
            userId: user.id,
            title: "Welcome, Vendor!",
            message: "Congratulations! You are now a vendor. Start setting up your store and manage your products.",
            type: "vendor",
        }, { transaction });
        yield transaction.commit(); // Commit transaction
        res
            .status(200)
            .json({ message: "Account successfully upgraded to vendor" });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback transaction on error
        logger_1.default.error("Error upgrading account to vendor:", error);
        res.status(500).json({ message: "Failed to update account type" });
    }
});
exports.becomeVendor = becomeVendor;
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const { isRead, limit = 10, page = 1 } = req.query; // Query params
    try {
        // Build the query conditions
        const where = { userId };
        if (isRead !== undefined) {
            where.isRead = isRead === "true";
        }
        // Calculate offset for pagination
        const paginationLimit = parseInt(limit, 10);
        const paginationPage = parseInt(page, 10);
        const offset = (paginationPage - 1) * paginationLimit;
        // Fetch notifications with filters, pagination, and sorting
        const { rows: notifications, count: total } = yield notification_1.default.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: paginationLimit,
            offset,
        });
        res.status(200).json({
            data: notifications,
            meta: {
                total,
                page: paginationPage,
                limit: paginationLimit,
                totalPages: Math.ceil(total / paginationLimit),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications", error });
    }
});
exports.getUserNotifications = getUserNotifications;
const userMarkNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const notificationId = req.query.notificationId; // Notification ID passed in the request body
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    if (!notificationId) {
        res.status(400).json({ message: "Notification ID is required" });
        return;
    }
    try {
        // Fetch the notification to ensure it belongs to the user
        const notification = yield notification_1.default.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            res.status(404).json({
                message: "Notification not found or does not belong to the user",
            });
            return;
        }
        // Update the `readAt` field to mark it as read
        notification.isRead = true;
        yield notification.save();
        res.status(200).json({ message: "Notification marked as read" });
    }
    catch (error) {
        logger_1.default.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
});
exports.userMarkNotificationAsRead = userMarkNotificationAsRead;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const { trackingNumber } = req.query; // Only track by tracking number, no pagination
    try {
        // Fetch orders with the count of order items, and apply search by tracking number
        const orders = yield order_1.default.findAll({
            where: Object.assign({ userId }, (trackingNumber && {
                trackingNumber: { [sequelize_1.Op.like]: `%${trackingNumber}%` }, // Search by tracking number
            })),
            attributes: {
                include: [
                    [
                        sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("orderItems.id")),
                        "orderItemsCount", // Alias for the count of order items
                    ],
                ],
            },
            include: [
                {
                    model: orderitem_1.default,
                    as: "orderItems",
                    attributes: [], // Do not include actual order items
                },
            ],
            group: ["Order.id"], // Group by order to ensure correct counting
            order: [["createdAt", "DESC"]], // Order by createdAt
        });
        if (!orders || orders.length === 0) {
            res.status(404).json({ message: "No orders found for this user" });
            return;
        }
        // Return the response with orders data
        res.status(200).json({
            message: "Orders retrieved successfully",
            data: orders,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllOrders = getAllOrders;
const getAllOrderItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, vendorId, page = 1, limit = 10 } = req.query;
    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Ensure `orderId` is provided
        if (!orderId) {
            res.status(400).json({ message: "Order ID is required" });
            return;
        }
        // Query for order items with pagination and required associations
        const { rows: orderItems, count } = yield orderitem_1.default.findAndCountAll({
            where: Object.assign({ orderId }, (vendorId != null && { vendorId })),
            limit: limitNumber,
            offset,
            order: [["createdAt", "DESC"]],
        });
        if (!orderItems || orderItems.length === 0) {
            res.status(404).json({ message: "No items found for this order" });
            return;
        }
        // Prepare metadata for pagination
        const totalPages = Math.ceil(count / limitNumber);
        res.status(200).json({
            message: "Order items retrieved successfully",
            data: orderItems,
            meta: {
                total: count, // Total number of order items
                page: pageNumber,
                limit: limitNumber,
                totalPages,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching order items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllOrderItems = getAllOrderItems;
const viewOrderItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderItemId } = req.query;
    try {
        // Query for a single order item and required associations
        const orderItem = yield orderitem_1.default.findOne({
            where: { id: orderItemId },
            include: [
                {
                    model: order_1.default,
                    as: "order",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "email",
                                "phoneNumber",
                            ], // Include user details
                        },
                    ],
                },
            ],
        });
        // If order item is not found
        if (!orderItem) {
            res.status(404).json({ message: "Order item not found" });
            return;
        }
        // Convert Sequelize model to plain object and add computed field
        const formattedOrderItem = Object.assign(Object.assign({}, orderItem.get()), { totalPrice: orderItem.quantity * orderItem.price });
        res.status(200).json({
            message: "Order item retrieved successfully",
            data: formattedOrderItem,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching order item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.viewOrderItem = viewOrderItem;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { status, orderItemId, deliveryCode } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    // Define allowed statuses
    const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid order status provided." });
        return;
    }
    // Start transaction
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        let newDeliveryCode = null;
        // Find the order item
        const order = yield orderitem_1.default.findOne({
            where: { id: orderItemId },
            transaction,
        });
        if (!order) {
            yield transaction.rollback();
            res.status(404).json({ message: "Order item not found." });
            return;
        }
        const mainOrder = yield order_1.default.findOne({ where: { id: order.orderId } });
        if (!mainOrder) {
            yield transaction.rollback();
            res.status(404).json({ message: "Buyer information not found." });
            return;
        }
        const buyer = yield user_1.default.findByPk(mainOrder.userId, { transaction });
        if (!buyer) {
            yield transaction.rollback();
            res.status(404).json({ message: "Buyer not found." });
            return;
        }
        // If the order is already delivered or cancelled, stop further processing
        if (order.status === "delivered" || order.status === "cancelled") {
            yield transaction.rollback();
            res.status(400).json({
                message: `Order is already ${order.status}. No further updates are allowed.`,
            });
            return;
        }
        let productData = order.product;
        // If product data is stored as a string, parse it
        if (typeof order.product === "string") {
            productData = JSON.parse(order.product);
        }
        // Extract vendorId safely
        const vendorId = (_b = productData === null || productData === void 0 ? void 0 : productData.vendorId) !== null && _b !== void 0 ? _b : null;
        const currencySymbol = (_e = (_d = (_c = productData === null || productData === void 0 ? void 0 : productData.store) === null || _c === void 0 ? void 0 : _c.currency) === null || _d === void 0 ? void 0 : _d.symbol) !== null && _e !== void 0 ? _e : null;
        if (!vendorId) {
            yield transaction.rollback();
            res.status(400).json({ message: "Vendor ID not found in product data." });
            return;
        }
        if (!currencySymbol) {
            yield transaction.rollback();
            res.status(400).json({ message: "Currency not found in product data." });
            return;
        }
        // If the order is delivered, verify the delivery code
        if (status === "delivered") {
            if (!deliveryCode) {
                yield transaction.rollback();
                res
                    .status(400)
                    .json({ message: "Delivery code is required to mark as delivered." });
                return;
            }
            if (!mainOrder.deliveryCode || deliveryCode !== mainOrder.deliveryCode) {
                yield transaction.rollback();
                res.status(400).json({ message: "Invalid delivery code." });
                return;
            }
        }
        // Update the order status
        order.status = status;
        // If status is shipped, generate delivery code and email customer
        if (status === "shipped") {
            const deliveryCode = crypto_1.default.randomBytes(6).toString("hex").toUpperCase();
            newDeliveryCode = deliveryCode; // Store the new delivery code
            const mainOrder = yield order_1.default.findOne({
                where: { id: order.orderId },
                transaction,
            });
            if (mainOrder) {
                mainOrder.deliveryCode = deliveryCode;
                yield mainOrder.save({ transaction });
                // Send email to customer
                const customer = yield user_1.default.findByPk(mainOrder.userId, { transaction });
                if (customer) {
                    const html = `
            <h3>Hi ${customer.firstName},</h3>
            <p>Your order <strong>#${mainOrder.id}</strong> has been shipped.</p>
            <p>Please be available to collect it. Use the code below to confirm delivery:</p>
            <h2 style="color: blue;">${deliveryCode}</h2>
            <p>Thanks for shopping with us!</p>
          `;
                    try {
                        yield (0, mail_service_1.sendMail)(customer.email, "Your order has been shipped!", html);
                    }
                    catch (emailError) {
                        logger_1.default.error("Error sending shipping email:", emailError);
                    }
                    // Notify the customer about the shipping with push notification
                    if (customer.fcmToken) {
                        const notificationMessage = {
                            notification: {
                                title: "Order Shipped",
                                body: `Your order #${mainOrder.id} has been shipped. Use code ${deliveryCode} to confirm delivery.`,
                            },
                            data: {
                                orderId: mainOrder.id.toString(),
                                deliveryCode: deliveryCode,
                                type: index_2.PushNotificationTypes.ORDER_SHIPPED,
                            },
                            token: customer.fcmToken,
                        };
                        try {
                            yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                        }
                        catch (pushError) {
                            logger_1.default.error("Error sending push notification:", pushError);
                        }
                    }
                }
            }
        }
        yield order.save({ transaction });
        // Check if vendorId exists in the User or Admin table
        const vendor = yield user_1.default.findByPk(vendorId, { transaction });
        const admin = yield admin_1.default.findByPk(vendorId, { transaction });
        if (!vendor && !admin) {
            yield transaction.rollback();
            res.status(404).json({ message: "Product owner not found." });
            return;
        }
        // If the order is delivered, add funds to the vendor's wallet
        if ((status === "delivered" && currencySymbol === "#" && vendor) ||
            (status === "delivered" && currencySymbol === "₦" && vendor)) {
            const price = Number(order.price);
            vendor.wallet = Number(vendor.wallet) + price;
            vendor.pendingWallet = new decimal_js_1.default(Number(vendor.pendingWallet))
                .minus(price)
                .toNumber();
            yield vendor.save({ transaction });
            // Mark Transaction as completed
            const existingTransaction = yield transaction_1.default.findOne({
                where: { refId: order.id, transactionType: "sale" },
                transaction,
            });
            if (existingTransaction) {
                existingTransaction.status = "completed";
                yield existingTransaction.save({ transaction });
            }
        }
        // If the order is delivered and the currency is USD, add funds to the vendor's wallet
        if (status === "delivered" && currencySymbol === "$" && vendor) {
            const price = Number(order.price);
            vendor.dollarWallet = Number(vendor.dollarWallet) + price;
            vendor.pendingDollarWallet = new decimal_js_1.default(Number(vendor.pendingDollarWallet))
                .minus(price)
                .toNumber();
            yield vendor.save({ transaction });
            // Mark Transaction as completed
            const existingTransaction = yield transaction_1.default.findOne({
                where: { refId: order.id, transactionType: "sale" },
                transaction,
            });
            if (existingTransaction) {
                existingTransaction.status = "completed";
                yield existingTransaction.save({ transaction });
            }
        }
        // Send a notification to the Buyer
        yield notification_1.default.create({
            userId: mainOrder.userId,
            title: "Order Status Updated",
            message: `Your product has been marked as '${status}'.`,
            type: "order_status_update",
        }, { transaction });
        // Send a notification to the vendor/admin (who owns the product)
        yield notification_1.default.create({
            userId: vendorId,
            title: "Order Status Updated",
            message: `The status of the product '${productData === null || productData === void 0 ? void 0 : productData.name}' purchased from you has been updated to '${status}'.`,
            type: "order_status_update",
        }, { transaction });
        if (buyer.fcmToken) {
            // Send push notification to the buyer
            const notificationMessage = {
                notification: {
                    title: "Order Status Update",
                    body: `Your order status has been updated to '${status}'.`,
                },
                data: {
                    orderId: mainOrder.id.toString(),
                    type: index_2.PushNotificationTypes.ORDER_STATUS_UPDATE,
                },
                token: buyer.fcmToken,
            };
            try {
                yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
            }
            catch (pushError) {
                logger_1.default.error("Error sending push notification to buyer:", pushError);
            }
        }
        if (vendor && vendor.fcmToken) {
            // Send push notification to the vendor
            const vendorNotificationMessage = {
                notification: {
                    title: "Order Status Update",
                    body: `The status of your product '${productData === null || productData === void 0 ? void 0 : productData.name}' has been updated to '${status}'.`,
                },
                data: {
                    orderId: mainOrder.id.toString(),
                    type: index_2.PushNotificationTypes.ORDER_STATUS_UPDATE,
                },
                token: vendor.fcmToken,
            };
            try {
                yield (0, pushNotification_1.sendPushNotificationSingle)(vendorNotificationMessage);
            }
            catch (pushError) {
                logger_1.default.error("Error sending push notification to vendor:", pushError);
            }
        }
        // Commit transaction
        yield transaction.commit();
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderStatusUpdateNotification(buyer, status, productData === null || productData === void 0 ? void 0 : productData.name, deliveryCode || newDeliveryCode);
        try {
            yield (0, mail_service_1.sendMail)(buyer.email, `${process.env.APP_NAME} - Order Status Update`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError);
        }
        res.status(200).json({
            message: `Order status updated to '${status}' successfully.`,
            data: order,
        });
    }
    catch (error) {
        yield transaction.rollback();
        logger_1.default.error("Error updating order status:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the order status." });
    }
});
exports.updateOrderStatus = updateOrderStatus;
const getPaymentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, page = 1, limit = 10 } = req.query;
    // Convert `page` and `limit` to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    // Calculate the offset for pagination
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Fetch payments for the given orderId with pagination
        const { count, rows: payments } = yield payment_1.default.findAndCountAll({
            where: { orderId },
            limit: limitNumber,
            offset: offset,
            order: [["createdAt", "DESC"]], // Order by latest payments
        });
        if (!payments || payments.length === 0) {
            res.status(404).json({ message: "No payments found for this order" });
            return;
        }
        res.status(200).json({
            message: "Payments retrieved successfully",
            data: payments,
            meta: {
                total: count, // Total number of payments for the order
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(count / limitNumber), // Calculate total pages
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching payment details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPaymentDetails = getPaymentDetails;
const toggleSaveProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Check if the product exists
        const product = yield product_1.default.findOne({
            where: { id: productId, status: "active" },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if the product is already saved (wishlist)
        const existingSavedProduct = yield saveproduct_1.default.findOne({
            where: { userId, productId },
        });
        if (existingSavedProduct) {
            // If exists, remove it (toggle)
            yield existingSavedProduct.destroy();
            res.status(200).json({ message: "Product removed from your saved list" });
        }
        else {
            // Otherwise, add the product to the saved list
            yield saveproduct_1.default.create({ userId, productId });
            res.status(200).json({ message: "Product added to your saved list" });
        }
    }
    catch (error) {
        logger_1.default.error("Error toggling save product:", error);
        res
            .status(500)
            .json({ message: "An error occurred while processing the request." });
    }
});
exports.toggleSaveProduct = toggleSaveProduct;
const getSavedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Fetch all saved products for the authenticated user
        const savedProducts = yield saveproduct_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: product_1.default,
                    as: "product", // Adjust the alias if necessary
                    where: { status: "active" }, // Only include active products
                    include: [
                        {
                            model: user_1.default,
                            as: "vendor",
                        },
                        {
                            model: admin_1.default,
                            as: "admin",
                            attributes: ["id", "name", "email"],
                        },
                        {
                            model: subcategory_1.default,
                            as: "sub_category",
                            attributes: ["id", "name", "categoryId"],
                        },
                        {
                            model: store_1.default,
                            as: "store",
                            attributes: ["id", "name"],
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ["symbol"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        // If no saved products are found
        if (savedProducts.length === 0) {
            res.status(404).json({ message: "No saved products found" });
            return;
        }
        // Send the saved products in the response
        res.status(200).json({ data: savedProducts });
    }
    catch (error) {
        logger_1.default.error("Error fetching saved products:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching saved products." });
    }
});
exports.getSavedProducts = getSavedProducts;
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { orderId, productId, rating, comment } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID
    if (!userId) {
        res.status(401).json({ message: "Unauthorized: User ID is missing." });
        return;
    }
    // Ensure rating is a valid number between 1 and 5
    if (typeof rating !== "number" || isNaN(rating) || rating < 1 || rating > 5) {
        res
            .status(400)
            .json({ message: "Rating must be a numeric value between 1 and 5." });
        return;
    }
    try {
        // Check if user has purchased the product
        const purchased = yield (0, helpers_2.hasPurchasedProduct)(orderId, productId);
        if (!purchased) {
            res.status(403).json({
                message: "You can only review products that has been delivered.",
            });
            return;
        }
        // Check if the user already reviewed the product
        const existingReview = yield reviewproduct_1.default.findOne({
            where: { userId, productId },
        });
        if (existingReview) {
            res
                .status(400)
                .json({ message: "You have already reviewed this product." });
            return;
        }
        // Create the review
        yield reviewproduct_1.default.create({ userId, productId, rating, comment });
        res.status(200).json({ message: "Review submitted successfully." });
    }
    catch (error) {
        logger_1.default.error("Error adding review:", error);
        res
            .status(500)
            .json({ message: "An error occurred while submitting the review." });
    }
});
exports.addReview = addReview;
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { reviewId, rating, comment } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID
    // Ensure rating is a valid number between 1 and 5
    if (typeof rating !== "number" || isNaN(rating) || rating < 1 || rating > 5) {
        res
            .status(400)
            .json({ message: "Rating must be a numeric value between 1 and 5." });
        return;
    }
    try {
        // Find existing review
        const review = yield reviewproduct_1.default.findOne({
            where: { userId, id: reviewId },
        });
        if (!review) {
            res.status(404).json({ message: "Review not found." });
            return;
        }
        // Update the review
        yield review.update({ rating, comment });
        res.status(200).json({ message: "Review updated successfully." });
    }
    catch (error) {
        logger_1.default.error("Error updating review:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the review." });
    }
});
exports.updateReview = updateReview;
const getProductReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.query; // Query parameter for productId
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID
    try {
        const whereClause = { userId }; // Default filter by user ID
        if (productId) {
            whereClause.productId = productId; // Add product filter if provided
        }
        const reviews = yield reviewproduct_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
        });
        res.status(200).json({ data: reviews });
    }
    catch (error) {
        logger_1.default.error("Error fetching reviews:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching reviews." });
    }
});
exports.getProductReviews = getProductReviews;
const getSingleReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewId = req.query.reviewId;
    try {
        const review = yield reviewproduct_1.default.findOne({
            where: { id: reviewId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: product_1.default,
                    as: "product",
                    include: [
                        {
                            model: user_1.default,
                            as: "vendor",
                        },
                        {
                            model: admin_1.default,
                            as: "admin",
                            attributes: ["id", "name", "email"],
                        },
                        {
                            model: subcategory_1.default,
                            as: "sub_category",
                            attributes: ["id", "name", "categoryId"],
                        },
                        {
                            model: store_1.default,
                            as: "store",
                            attributes: ["id", "name"],
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ["symbol"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        if (!review) {
            res.status(404).json({ message: "Review not found." });
            return;
        }
        res.status(200).json({ data: review });
    }
    catch (error) {
        logger_1.default.error("Error fetching review:", error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching the review." });
    }
});
exports.getSingleReview = getSingleReview;
// Delete user account
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    try {
        console.log("[DELETE] Starting account deletion for user:", userId);
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        console.log("[DELETE] User found, starting to delete related records...");
        // Delete related records first to handle RESTRICT constraints
        try {
            yield otp_1.default.destroy({ where: { userId } });
            console.log("[DELETE] OTP records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting OTP:", error.message);
        }
        try {
            yield vendorsubscription_1.default.destroy({ where: { vendorId: userId } });
            console.log("[DELETE] VendorSubscription records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting VendorSubscription:", error.message);
        }
        try {
            yield store_1.default.destroy({ where: { vendorId: userId } });
            console.log("[DELETE] Store records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting Store:", error.message);
        }
        try {
            yield kyc_1.default.destroy({ where: { vendorId: userId } });
            console.log("[DELETE] KYC records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting KYC:", error.message);
        }
        try {
            yield bid_1.default.destroy({ where: { bidderId: userId } });
            console.log("[DELETE] Bid records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting Bid:", error.message);
        }
        try {
            yield cart_1.default.destroy({ where: { userId } });
            console.log("[DELETE] Cart records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting Cart:", error.message);
        }
        try {
            yield showinterest_1.default.destroy({ where: { userId } });
            console.log("[DELETE] ShowInterest records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting ShowInterest:", error.message);
        }
        try {
            yield saveproduct_1.default.destroy({ where: { userId } });
            console.log("[DELETE] SaveProduct records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting SaveProduct:", error.message);
        }
        try {
            yield reviewproduct_1.default.destroy({ where: { userId } });
            console.log("[DELETE] ReviewProduct records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting ReviewProduct:", error.message);
        }
        try {
            yield notification_1.default.destroy({ where: { userId } });
            console.log("[DELETE] Notification records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting Notification:", error.message);
        }
        try {
            yield usernotificationsetting_1.default.destroy({ where: { userId } });
            console.log("[DELETE] UserNotificationSetting records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting UserNotificationSetting:", error.message);
        }
        try {
            yield productreport_1.default.destroy({ where: { userId } });
            console.log("[DELETE] ProductReport records deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting ProductReport:", error.message);
        }
        try {
            yield blockedvendor_1.default.destroy({ where: { userId } });
            console.log("[DELETE] BlockedVendor records deleted (userId)");
        }
        catch (error) {
            console.log("[DELETE] Error deleting BlockedVendor (userId):", error.message);
        }
        try {
            yield blockedvendor_1.default.destroy({ where: { vendorId: userId } });
            console.log("[DELETE] BlockedVendor records deleted (vendorId)");
        }
        catch (error) {
            console.log("[DELETE] Error deleting BlockedVendor (vendorId):", error.message);
        }
        // Delete messages and conversations
        try {
            const conversations = yield conversation_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [{ userId1: userId }, { userId2: userId }],
                },
            });
            for (const conversation of conversations) {
                yield message_1.default.destroy({ where: { conversationId: conversation.id } });
            }
            yield conversation_1.default.destroy({
                where: {
                    [sequelize_1.Op.or]: [{ userId1: userId }, { userId2: userId }],
                },
            });
            console.log("[DELETE] Messages and conversations deleted");
        }
        catch (error) {
            console.log("[DELETE] Error deleting messages/conversations:", error.message);
        }
        console.log("[DELETE] All related records deleted, now deleting user...");
        // Now delete the user
        yield user.destroy();
        console.log("[DELETE] User deleted successfully");
        // Admin notification removed to prevent backend crashes
        // The model isn't properly set up in local database
        res.status(200).json({ message: "Account deleted successfully." });
    }
    catch (error) {
        console.error("[DELETE] Error deleting user account:", error);
        res
            .status(500)
            .json({ message: "An error occurred while deleting the account." });
    }
});
exports.deleteAccount = deleteAccount;
// Report a product with a reason
const reportProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
        const { productId } = req.params;
        const { reason } = req.body;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!productId || !reason) {
            res.status(400).json({ message: "Product ID and reason are required." });
            return;
        }
        yield productreport_1.default.create({
            productId,
            userId,
            reason,
        });
        res.status(201).json({ message: "Product reported successfully." });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message || "Failed to report product." });
    }
});
exports.reportProduct = reportProduct;
const blockVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { vendorId, reason } = req.body; // Accept reason from request body
        if (!vendorId) {
            res.status(400).json({ message: "vendorId is required." });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        if (userId === vendorId) {
            res.status(400).json({ message: "You cannot block yourself." });
            return;
        }
        // Check if already blocked
        const alreadyBlocked = yield blockedvendor_1.default.findOne({
            where: { userId, vendorId },
        });
        if (alreadyBlocked) {
            res.status(200).json({ message: "Vendor already blocked." });
            return;
        }
        yield blockedvendor_1.default.create({ userId, vendorId, reason }); // Save reason when blocking vendor
        res.status(200).json({ message: "Vendor blocked successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});
exports.blockVendor = blockVendor;
const unblockVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { vendorId } = req.body;
        if (!vendorId) {
            res.status(400).json({ message: "vendorId is required." });
            return;
        }
        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        // Check if vendor is blocked
        const blocked = yield blockedvendor_1.default.findOne({
            where: { userId, vendorId },
        });
        if (!blocked) {
            res.status(200).json({ message: "Vendor is not blocked." });
            return;
        }
        yield blockedvendor_1.default.destroy({ where: { userId, vendorId } });
        res.status(200).json({ message: "Vendor unblocked successfully." });
    }
    catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});
exports.unblockVendor = unblockVendor;
const getBlockedVendors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        const blockedVendors = yield blockedvendor_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
                },
            ],
        });
        res.status(200).json({
            message: "Blocked vendors retrieved successfully.",
            data: blockedVendors,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});
exports.getBlockedVendors = getBlockedVendors;
// Block a product for a user (hide product from user's view)
const blockProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
        const { productId, reason } = req.body; // Get productId and reason from request body
        if (!productId) {
            // Check if productId is provided
            res.status(400).json({ message: "productId is required." });
            return;
        }
        if (!userId) {
            // Check if user is authenticated
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        // Check if already blocked
        const alreadyBlocked = yield blockedproduct_1.default.findOne({
            where: { userId, productId }, // Check if this product is already blocked for this user
        });
        if (alreadyBlocked) {
            // If already blocked, return
            res.status(200).json({ message: "Product already blocked." });
            return;
        }
        yield blockedproduct_1.default.create({ userId, productId, reason }); // Block the product and save the reason
        res.status(200).json({ message: "Product blocked successfully." }); // Respond with success
    }
    catch (error) {
        res.status(500).json({ message: "Server error." }); // Handle server error
    }
});
exports.blockProduct = blockProduct;
const bookService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
        const serviceId = req.params.serviceId;
        const { message, vendorId, bookingDate } = req.body; // Get serviceId and message from request body
        if (!serviceId || !message) {
            // Check if serviceId and message are provided
            res.status(400).json({ message: "serviceId and message are required." });
            return;
        }
        if (!userId) {
            // Check if user is authenticated
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        if (!vendorId) {
            res.status(400).json({ message: "vendorId is required." });
            return;
        }
        // Check if the service exists
        const service = yield services_1.default.findOne({
            where: { id: serviceId, status: "active" },
            include: [
                {
                    model: user_1.default,
                    as: "provider",
                    attributes: ["id", "firstName", "lastName", "email", "fcmToken"],
                },
            ],
        });
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        // Create the booking
        yield servicebookings_1.default.create({
            userId,
            serviceId,
            vendorId,
            message,
            bookingDate,
        });
        // Notify the service provider about the new inquiry
        const provider = service.provider;
        if (provider) {
            yield notification_1.default.create({
                userId: provider.id,
                title: "New Service Inquiry",
                message: `You have a new inquiry for your service '${service.title}'.`,
                type: "service_inquiry",
            });
            if (provider.fcmToken) {
                const notificationMessage = {
                    notification: {
                        title: "New Service Inquiry",
                        body: `You have a new inquiry for your service '${service.title}'.`,
                    },
                    data: {
                        serviceId: service.id.toString(),
                        type: index_2.PushNotificationTypes.SERVICE_INQUIRY,
                    },
                    token: provider.fcmToken,
                };
                try {
                    yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                }
                catch (pushError) {
                    logger_1.default.error("Error sending push notification:", pushError);
                }
            }
        }
        res.status(200).json({ message: "Inquiry sent successfully." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." }); // Handle server error
    }
});
exports.bookService = bookService;
const getUserServiceBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
        if (!userId) {
            // Check if user is authenticated
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        // Fetch all bookings for the authenticated user
        const bookings = yield servicebookings_1.default.findAll({
            where: { userId },
            include: [
                {
                    model: services_1.default,
                    as: "service",
                    include: [
                        {
                            model: user_1.default,
                            as: "provider",
                            attributes: ["id", "firstName", "lastName", "email"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        res
            .status(200)
            .json({ message: "Bookings retrieved successfully.", data: bookings });
    }
    catch (error) {
        res.status(500).json({ message: "Server error." }); // Handle server error
    }
});
exports.getUserServiceBookings = getUserServiceBookings;
const addServiceReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
        const { serviceId, rating, comment } = req.body; // Get serviceId, rating, and comment from request body
        if (!serviceId || !rating) {
            // Check if serviceId and rating are provided
            res.status(400).json({ message: "serviceId and rating are required." });
            return;
        }
        if (!comment) {
            res.status(400).json({ message: "comment is required." });
            return;
        }
        if (typeof rating !== "number" ||
            isNaN(rating) ||
            rating < 1 ||
            rating > 5) {
            res
                .status(400)
                .json({ message: "Rating must be a numeric value between 1 and 5." });
            return;
        }
        if (!userId) {
            // Check if user is authenticated
            res.status(401).json({ message: "Unauthorized." });
            return;
        }
        // Check if the service exists
        const service = yield services_1.default.findOne({
            where: { id: serviceId, status: "active" },
            include: [
                {
                    model: user_1.default,
                    as: "provider",
                    attributes: ["id", "firstName", "lastName", "email", "fcmToken"],
                },
            ],
        });
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        // Check if the user has already reviewed this service
        const existingReview = yield servicereview_1.default.findOne({
            where: { userId, serviceId },
        });
        if (existingReview) {
            res
                .status(400)
                .json({ message: "You have already reviewed this service." });
            return;
        }
        const hasBooked = yield servicebookings_1.default.findOne({
            where: { userId, serviceId, status: "completed" },
        });
        if (!hasBooked) {
            res.status(403).json({
                message: "You can only review services that you have booked.",
            });
            return;
        }
        // Create the review
        yield servicereview_1.default.create({
            userId,
            serviceId,
            rating,
            comment,
        });
        // Notify the service provider about the new review
        const provider = service.provider;
        if (provider) {
            yield notification_1.default.create({
                userId: provider.id,
                title: "New Service Review",
                message: `Your service '${service.title}' has received a new review.`,
                type: "service_review",
            });
            if (provider.fcmToken) {
                const notificationMessage = {
                    notification: {
                        title: "New Service Review",
                        body: `Your service '${service.title}' has received a new review.`,
                    },
                    data: {
                        serviceId: service.id.toString(),
                        type: index_2.PushNotificationTypes.SERVICE_REVIEW,
                    },
                    token: provider.fcmToken,
                };
                try {
                    yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                }
                catch (pushError) {
                    logger_1.default.error("Error sending push notification:", pushError);
                }
            }
        }
        res.status(200).json({ message: "Review submitted successfully." });
    }
    catch (error) {
        logger_1.default.error("Error submitting service review:", error);
        res.status(500).json({ message: "Server error." }); // Handle server error
        return;
    }
});
exports.addServiceReview = addServiceReview;
const markServiceBookingComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const bookingId = req.params.bookingId;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID
    try {
        // Find the booking
        const booking = yield servicebookings_1.default.findOne({
            where: { id: bookingId, userId },
            include: [
                {
                    model: services_1.default,
                    as: "service",
                },
                {
                    model: user_1.default,
                    as: "provider",
                    attributes: ["id", "firstName", "lastName", "email", "fcmToken"],
                },
            ],
        });
        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }
        if (booking.status === "completed") {
            res.status(400).json({ message: "Booking is already completed." });
            return;
        }
        // Update the booking status to completed
        booking.status = "completed";
        yield booking.save();
        // Notify the service provider about the completed booking
        const service = booking.service;
        const provider = booking.provider;
        if (provider) {
            yield notification_1.default.create({
                userId: provider.id,
                title: "Service Booking Completed",
                message: `The booking for your service '${service.title}' has been marked as completed.`,
                type: "service_booking_completed",
            });
            if (provider.fcmToken) {
                const notificationMessage = {
                    notification: {
                        title: "Service Booking Completed",
                        body: `The booking for your service '${service.title}' has been marked as completed.`,
                    },
                    data: {
                        serviceId: service.id.toString(),
                        type: index_2.PushNotificationTypes.SERVICE_BOOKING_COMPLETED,
                    },
                    token: provider.fcmToken,
                };
                try {
                    yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                }
                catch (pushError) {
                    logger_1.default.error("Error sending push notification:", pushError);
                }
            }
        }
        res.status(200).json({ message: "Booking marked as completed." });
    }
    catch (error) {
        logger_1.default.error("Error marking booking as complete:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.markServiceBookingComplete = markServiceBookingComplete;
const cancelServiceBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const bookingId = req.params.bookingId;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID
    try {
        // Find the booking
        const booking = yield servicebookings_1.default.findOne({
            where: { id: bookingId, userId },
            include: [
                {
                    model: services_1.default,
                    as: "service",
                },
                {
                    model: user_1.default,
                    as: "provider",
                    attributes: ["id", "firstName", "lastName", "email", "fcmToken"],
                },
            ],
        });
        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }
        if (booking.status === "completed") {
            res
                .status(400)
                .json({ message: "Completed bookings cannot be cancelled." });
            return;
        }
        if (booking.status === "cancelled") {
            res.status(400).json({ message: "Booking is already cancelled." });
            return;
        }
        // Update the booking status to cancelled
        booking.status = "cancelled";
        yield booking.save();
        // Notify the service provider about the cancelled booking
        const service = booking.service;
        const provider = booking.provider;
        if (provider) {
            yield notification_1.default.create({
                userId: provider.id,
                title: "Service Booking Cancelled",
                message: `The booking for your service '${service.title}' has been cancelled.`,
                type: "service_booking_cancelled",
            });
            if (provider.fcmToken) {
                const notificationMessage = {
                    notification: {
                        title: "Service Booking Cancelled",
                        body: `The booking for your service '${service.title}' has been cancelled.`,
                    },
                    data: {
                        serviceId: service.id,
                        type: index_2.PushNotificationTypes.SERVICE_BOOKING_CANCELLED,
                    },
                    token: provider.fcmToken,
                };
                try {
                    yield (0, pushNotification_1.sendPushNotificationSingle)(notificationMessage);
                }
                catch (pushError) {
                    logger_1.default.error("Error sending push notification:", pushError);
                }
            }
        }
        res.status(200).json({ message: "Booking cancelled successfully." });
    }
    catch (error) {
        logger_1.default.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Server error." });
        return;
    }
});
exports.cancelServiceBooking = cancelServiceBooking;
const submitOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { productId } = req.params;
    const { offeredPrice, message } = req.body;
    if (!offeredPrice || isNaN(Number(offeredPrice)) || Number(offeredPrice) <= 0) {
        res.status(400).json({ message: "A valid offered price is required." });
        return;
    }
    try {
        const product = yield product_1.default.findByPk(productId);
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        const offer = yield productoffer_1.default.create({
            productId,
            buyerId,
            offeredPrice: Number(offeredPrice),
            message: message || null,
            status: "pending",
        });
        yield notification_1.default.create({
            userId: buyerId,
            title: "Offer Submitted",
            message: `Your offer of ${offeredPrice} on "${product.name}" has been submitted and is awaiting review.`,
            type: "OFFER_SUBMITTED",
            isRead: false,
        });
        const { createAdminNotification } = yield Promise.resolve().then(() => __importStar(require("../services/notification.service")));
        yield createAdminNotification("NEW_OFFER", `A buyer made an offer on "${product.name}"`, { offerId: offer.id, productId: product.id, offeredPrice, buyerId });
        res.status(201).json({ message: "Offer submitted successfully.", data: offer });
    }
    catch (error) {
        logger_1.default.error("Error submitting offer:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.submitOffer = submitOffer;
const getMyOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { page, limit, status, productId } = req.query;
    const offset = (Number(page) - 1) * Number(limit) || 0;
    const where = { buyerId };
    if (status)
        where.status = String(status);
    if (productId)
        where.productId = String(productId);
    try {
        const { count, rows: offers } = yield productoffer_1.default.findAndCountAll({
            where,
            subQuery: false,
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    attributes: ["id", "name", "price", "image_url"],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: Number(limit) || 10,
            offset,
        });
        res.status(200).json({ data: offers, total: count });
    }
    catch (error) {
        logger_1.default.error("Error fetching offers:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getMyOffers = getMyOffers;
const respondToCounterOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { offerId } = req.params;
    const { status } = req.body;
    if (!status || !["accepted", "rejected"].includes(status)) {
        res.status(400).json({ message: "Status must be either accepted or rejected." });
        return;
    }
    try {
        const offer = yield productoffer_1.default.findOne({
            where: { id: offerId, buyerId },
            include: [{ model: product_1.default, as: "product", attributes: ["id", "name"] }],
        });
        if (!offer) {
            res.status(404).json({ message: "Offer not found." });
            return;
        }
        if (offer.status !== "countered") {
            res.status(400).json({ message: "Only countered offers can be responded to." });
            return;
        }
        yield offer.update({ status });
        const product = offer.product;
        const { createAdminNotification } = yield Promise.resolve().then(() => __importStar(require("../services/notification.service")));
        yield createAdminNotification("OFFER_BUYER_RESPONSE", `Buyer has ${status} the counter offer on "${product.name}".`, { offerId: offer.id, productId: product.id, status, buyerId });
        res.status(200).json({ message: `Counter offer ${status} successfully.`, data: offer });
    }
    catch (error) {
        logger_1.default.error("Error responding to counter offer:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.respondToCounterOffer = respondToCounterOffer;
const initiateOfferPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { offerId } = req.params;
    try {
        const offer = yield productoffer_1.default.findOne({
            where: { id: offerId, buyerId },
            include: [{ model: product_1.default, as: "product", attributes: ["id", "name"] }],
        });
        if (!offer) {
            res.status(404).json({ message: "Offer not found." });
            return;
        }
        if (offer.status !== "accepted") {
            res.status(400).json({ message: "Payment can only be initiated for accepted offers." });
            return;
        }
        const user = yield user_1.default.findByPk(buyerId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const paymentGateway = yield paymentgateway_1.default.findOne({
            where: { name: "Paystack", isActive: true },
        });
        if (!paymentGateway || !paymentGateway.secretKey) {
            res.status(500).json({ message: "Active Paystack gateway not configured." });
            return;
        }
        const effectivePrice = offer.counterPrice !== null ? Number(offer.counterPrice) : Number(offer.offeredPrice);
        const uuidv4 = uuid.v4;
        const refId = `psk_offer_${uuidv4()}_${Date.now()}`;
        const paystack = yield (0, helpers_1.initializePaystackPayment)(refId, effectivePrice, user.email, paymentGateway.secretKey);
        res.status(200).json({
            message: "Payment initialized.",
            data: { refId, effectivePrice, paystackDetails: paystack },
        });
    }
    catch (error) {
        logger_1.default.error("Error initiating offer payment:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.initiateOfferPayment = initiateOfferPayment;
const checkoutOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const buyerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { offerId } = req.params;
    const { refId, shippingAddress } = req.body;
    if (!refId) {
        res.status(400).json({ message: "Payment reference ID is required." });
        return;
    }
    if (!shippingAddress) {
        res.status(400).json({ message: "Shipping address is required." });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const offer = yield productoffer_1.default.findOne({
            where: { id: offerId, buyerId },
            include: [{ model: product_1.default, as: "product" }],
            transaction,
        });
        if (!offer) {
            yield transaction.rollback();
            res.status(404).json({ message: "Offer not found." });
            return;
        }
        if (offer.status !== "accepted") {
            yield transaction.rollback();
            res.status(400).json({ message: "Checkout is only allowed for accepted offers." });
            return;
        }
        const paymentGateway = yield paymentgateway_1.default.findOne({
            where: { name: "Paystack", isActive: true },
            transaction,
        });
        if (!paymentGateway || !paymentGateway.secretKey) {
            yield transaction.rollback();
            res.status(500).json({ message: "Active Paystack gateway not configured." });
            return;
        }
        const verificationResponse = yield (0, helpers_1.verifyPayment)(refId, paymentGateway.secretKey);
        if (verificationResponse.status !== "success") {
            yield transaction.rollback();
            res.status(400).json({ message: "Payment verification failed." });
            return;
        }
        const product = offer.product;
        if (product.type === "in_stock") {
            const availableQuantity = (_b = product.quantity) !== null && _b !== void 0 ? _b : 0;
            if (availableQuantity < 1) {
                yield transaction.rollback();
                res.status(400).json({ message: "Product is out of stock." });
                return;
            }
            yield product.update({ quantity: availableQuantity - 1 }, { transaction });
        }
        const effectivePrice = offer.counterPrice !== null ? Number(offer.counterPrice) : Number(offer.offeredPrice);
        const user = yield user_1.default.findByPk(buyerId, { transaction });
        const order = yield order_1.default.create({
            userId: buyerId,
            totalAmount: effectivePrice,
            refId,
            shippingAddress,
            status: "pending",
        }, { transaction });
        yield orderitem_1.default.create({
            vendorId: product.vendorId,
            orderId: order.id,
            product,
            quantity: 1,
            price: effectivePrice,
        }, { transaction });
        yield payment_1.default.create({
            orderId: order.id,
            refId,
            amount: verificationResponse.amount / 100,
            currency: verificationResponse.currency,
            status: verificationResponse.status,
            channel: verificationResponse.channel,
            paymentDate: verificationResponse.transaction_date,
        }, { transaction });
        yield offer.update({ status: "completed" }, { transaction });
        yield notification_1.default.create({
            userId: buyerId,
            title: "Order Placed",
            message: `Your order for "${product.name}" at the agreed price has been placed successfully.`,
            type: "ORDER_PLACED",
            isRead: false,
        }, { transaction });
        const vendor = yield user_1.default.findByPk(product.vendorId, { transaction });
        const admin = yield admin_1.default.findByPk(product.vendorId, { transaction });
        if (vendor) {
            yield notification_1.default.create({
                userId: vendor.id,
                title: "New Order Received",
                type: "new_order",
                message: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for "${product.name}" via an offer.`,
            }, { transaction });
            yield vendor.update({ pendingWallet: new decimal_js_1.default(vendor.pendingWallet || 0).plus(effectivePrice) }, { transaction });
        }
        // Admin-owned products do not have a wallet to update
        yield transaction.commit();
        res.status(200).json({ message: "Order placed successfully.", data: { orderId: order.id, trackingNumber: order.trackingNumber } });
    }
    catch (error) {
        yield transaction.rollback();
        logger_1.default.error("Error during offer checkout:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.checkoutOffer = checkoutOffer;
//# sourceMappingURL=userController.js.map