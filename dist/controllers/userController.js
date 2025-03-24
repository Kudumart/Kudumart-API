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
exports.getSingleReview = exports.getProductReviews = exports.updateReview = exports.addReview = exports.getSavedProducts = exports.toggleSaveProduct = exports.getPaymentDetails = exports.updateOrderStatus = exports.viewOrderItem = exports.getAllOrderItems = exports.getAllOrders = exports.userMarkNotificationAsRead = exports.getUserNotifications = exports.becomeVendor = exports.actionProductBidders = exports.placeBid = exports.getAllAuctionProductsInterest = exports.showInterest = exports.checkoutDollar = exports.checkout = exports.getActivePaymentGateways = exports.clearCart = exports.getCartContents = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.markAsReadHandler = exports.deleteMessageHandler = exports.saveMessage = exports.sendMessageHandler = exports.getAllConversationMessages = exports.getConversations = exports.updateUserNotificationSettings = exports.getUserNotificationSettings = exports.confirmPhoneNumberUpdate = exports.updateProfilePhoneNumber = exports.confirmEmailUpdate = exports.updateProfileEmail = exports.updatePassword = exports.updateProfilePhoto = exports.updateProfile = exports.profile = exports.logout = void 0;
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
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const subcategory_1 = __importDefault(require("../models/subcategory"));
const admin_1 = __importDefault(require("../models/admin"));
const saveproduct_1 = __importDefault(require("../models/saveproduct"));
const reviewproduct_1 = __importDefault(require("../models/reviewproduct"));
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
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "photo"], // Modify attributes as needed
                },
                {
                    model: user_1.default,
                    as: "receiverUser", // Assuming receiverId references the User model
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "photo"], // Modify attributes as needed
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
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const { productId, quantity } = req.body;
    try {
        // Find the product by productId and include vendor and currency details
        const product = yield product_1.default.findByPk(productId, {
            attributes: ["vendorId", "name"],
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
        });
        if (!product || !product.store || !product.store.currency) {
            res.status(404).json({ message: "Product not found or invalid currency data" });
            return;
        }
        const { vendorId, name } = product;
        const productCurrency = product.store.currency;
        // Ensure product currency is either $, #, or ₦
        const allowedCurrencies = ["$", "#", "₦"];
        if (!allowedCurrencies.includes(productCurrency.symbol)) {
            res.status(400).json({ message: `Only products with currencies ${allowedCurrencies.join(", ")} are allowed.` });
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
            if (!existingProduct || !existingProduct.store || !existingProduct.store.currency) {
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
            // If the item is already in the cart, update its quantity
            existingCartItem.quantity += quantity;
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
            yield cart_1.default.create({ userId, productId, quantity });
        }
        res.status(200).json({ message: "Item added to cart successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: error.message || "Error adding item to cart." });
    }
});
exports.addItemToCart = addItemToCart;
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, quantity } = req.body;
    try {
        const cartItem = yield cart_1.default.findByPk(cartId);
        if (!cartItem) {
            res.status(404).json({ message: "Cart item not found." });
            return;
        }
        cartItem.quantity = quantity;
        yield cartItem.save();
        res.status(200).json({ message: "Cart item updated successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: error.message || "Error updating cart item." });
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
        res.status(500).json({ message: error.message || "Error removing cart item." });
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
        res.status(500).json({ message: error.message || "Error fetching cart contents." });
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
const getActivePaymentGateways = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Query for active payment gateways (only Paystack and Stripe)
        const paymentGateways = yield paymentgateway_1.default.findAll({
            where: {
                isActive: true,
                name: ["paystack", "stripe"], // Assuming 'name' is the field for gateway names
            },
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
const checkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get authenticated user ID
    const { refId, shippingAddress } = req.body;
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
                    attributes: ["id", "name", "price", "vendorId"],
                },
            ],
        });
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        // Calculate total price and validate inventory
        let totalAmount = 0;
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            if (!product) {
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            }
            // if (product.quantity < cartItem.quantity) {
            //   throw new Error(`Insufficient stock for product: ${product.name}`);
            // }
            totalAmount += product.price * cartItem.quantity;
        }
        // Validate that the total amount matches the Paystack transaction amount
        if (paymentData.amount / 100 !== totalAmount) {
            throw new Error("Payment amount does not match cart total");
        }
        // Create order
        const order = yield order_1.default.create({
            userId,
            totalAmount,
            refId,
            shippingAddress,
            status: "pending",
        }, { transaction });
        logger_1.default.error('Check 2');
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
                        as: 'store',
                        attributes: ["name"],
                        include: [
                            {
                                model: currency_1.default,
                                as: 'currency',
                                attributes: ["name", "symbol"]
                            },
                        ],
                    },
                    {
                        model: subcategory_1.default,
                        as: "sub_category",
                        attributes: ["id", "name"],
                    },
                ],
            });
            if (!product) {
                throw new Error(`Product with ID ${cartItem.product.id} not found.`);
            }
            // Check if vendorId exists in the User table (Vendor)
            const vendor = yield user_1.default.findByPk(product.vendorId);
            // Check if vendorId exists in the Admin table
            const admin = yield admin_1.default.findByPk(product.vendorId);
            if (!vendor && !admin) {
                res.status(404).json({ message: "Owner not found" });
                return;
            }
            // Create the order item
            yield orderitem_1.default.create({
                vendorId: product.vendorId,
                orderId: order.id,
                product: product,
                quantity: cartItem.quantity,
                price: product.price,
            }, { transaction });
            if (vendor) {
                yield notification_1.default.create({
                    userId: vendor.id,
                    title: "New Order Received",
                    type: "new_order",
                    message: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
                });
                const message = messages_1.emailTemplates.newOrderNotification(vendor, order);
                yield (0, mail_service_1.sendMail)(vendor.email, `${process.env.APP_NAME} - New Order Received`, message);
            }
            else if (admin) {
                yield notification_1.default.create({
                    userId: admin.id,
                    title: "New Order Received",
                    type: "new_order",
                    message: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed.`,
                });
                const message = messages_1.emailTemplates.newOrderAdminNotification(admin, order);
                yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - New Order Received`, message);
            }
            // If it's a vendor 
            // if (vendor) {
            //   await vendor.update(
            //     { wallet: (vendor.wallet as number) + totalAmount },
            //     { transaction }
            //   );    
            // }
            // Update product inventory
            // await product.update(
            //   { quantity: product.quantity - cartItem.quantity },
            //   { transaction }
            // );
        }
        logger_1.default.error('check 3');
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
        logger_1.default.error('Check 4');
        const groupedVendorOrders = {};
        logger_1.default.error('final check');
        cartItems.forEach(cartItem => {
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
                    price: cartItem.product.price,
                }, // Ensure product is an object
                quantity: cartItem.quantity,
                price: cartItem.product.price,
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
        const user = yield user_1.default.findByPk(userId, { transaction }); // Add transaction scope
        if (!user) {
            throw new Error(`User not found.`);
        }
        // Commit the transaction
        yield transaction.commit();
        transactionCommitted = true; // Mark as committed
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderConfirmationNotification(user, order, groupedVendorOrders, '₦');
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Order Confirmation`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError);
        }
        res.status(200).json({
            message: "Checkout successful"
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
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { refId, shippingAddress } = req.body;
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
        // Fetch cart items
        const cartItems = yield cart_1.default.findAll({
            where: { userId },
            include: [{ model: product_1.default, as: "product", attributes: ["id", "name", "price", "vendorId"] }],
        });
        if (!cartItems || cartItems.length === 0) {
            res.status(400).json({ message: "Cart is empty" });
            return;
        }
        // Calculate total price
        let totalAmount = 0;
        const vendorOrders = {}; // Stores vendor-specific order items
        for (const cartItem of cartItems) {
            const product = cartItem.product;
            if (!product)
                throw new Error(`Product with ID ${cartItem.productId} not found`);
            const productInfo = yield product_1.default.findByPk(cartItem.productId, {
                include: [
                    {
                        model: store_1.default,
                        as: 'store',
                        attributes: ["name"],
                        include: [
                            {
                                model: currency_1.default,
                                as: 'currency',
                                attributes: ["name", "symbol"]
                            },
                        ],
                    },
                    {
                        model: subcategory_1.default,
                        as: "sub_category",
                        attributes: ["id", "name"],
                    },
                ],
            });
            if (!productInfo) {
                throw new Error(`Product with ID ${cartItem.productId} not found.`);
            }
            totalAmount += product.price * cartItem.quantity;
            // Organize order items by vendor
            if (!vendorOrders[product.vendorId]) {
                vendorOrders[product.vendorId] = [];
            }
            vendorOrders[product.vendorId].push({
                vendorId: product.vendorId,
                product: productInfo,
                quantity: cartItem.quantity,
                price: product.price,
            });
        }
        // Create a single order for the buyer
        const order = yield order_1.default.create({
            userId,
            totalAmount,
            refId,
            shippingAddress,
            status: "pending",
        }, { transaction });
        // Process order items per vendor
        for (const vendorId in vendorOrders) {
            const vendorOrderItems = vendorOrders[vendorId];
            for (const item of vendorOrderItems) {
                yield orderitem_1.default.create({
                    vendorId: item.vendorId,
                    orderId: order.id,
                    product: item.product,
                    quantity: item.quantity,
                    price: item.price,
                }, { transaction });
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
        const user = yield user_1.default.findByPk(userId, { transaction }); // Add transaction scope
        if (!user) {
            throw new Error(`User not found.`);
        }
        // Notify the Buyer
        yield notification_1.default.create({
            userId,
            title: "Order Confirmation",
            type: "order_confirmation",
            message: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
        }, { transaction });
        // Commit transaction before sending notifications
        yield transaction.commit();
        transactionCommitted = true; // Mark as committed
        // Notify Each Vendor/Admin
        for (const vendorId in vendorOrders) {
            try {
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
                    });
                    const message = messages_1.emailTemplates.newOrderNotification(vendor, order);
                    yield (0, mail_service_1.sendMail)(vendor.email, `${process.env.APP_NAME} - New Order Received`, message);
                }
                else if (admin) {
                    yield notification_1.default.create({
                        userId: admin.id,
                        title: "New Order Received",
                        type: "new_order",
                        message: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed for your product.`,
                    });
                    const message = messages_1.emailTemplates.newOrderAdminNotification(admin, order);
                    yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - New Order Received`, message);
                }
            }
            catch (notificationError) {
                logger_1.default.error(`Failed to notify vendor ${vendorId}:`, notificationError);
            }
        }
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderConfirmationNotification(user, order, vendorOrders, '$');
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Order Confirmation`, message);
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
        res.status(500).json({ message: "Checkout failed" });
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
            res.status(404).json({ message: "Auction product not found or is not upcoming." });
            return;
        }
        // Validate auction date is not the start date
        if (auctionProduct.startDate && new Date(auctionProduct.startDate).toDateString() === new Date().toDateString()) {
            res.status(400).json({ message: "You cannot show interest on the day the auction starts." });
            return;
        }
        // Check if user has already shown interest
        const existingInterest = yield showinterest_1.default.findOne({
            where: { userId, auctionProductId },
        });
        if (existingInterest) {
            res.status(400).json({ message: "You have already shown interest in this auction." });
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
        res.status(200).json({
            message: "Interest recorded successfully. Please wait for confirmation.",
            data: newInterest,
        });
    }
    catch (error) {
        logger_1.default.error("Error showing interest:", error);
        res.status(500).json({ message: error.message || "An error occurred while recording your interest." });
    }
});
exports.showInterest = showInterest;
const getAllAuctionProductsInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get authenticated user ID
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: User not authenticated." });
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
                            as: "vendor"
                        },
                        {
                            model: admin_1.default,
                            as: "admin",
                            attributes: ["id", "name", "email"],
                        },
                        {
                            model: store_1.default,
                            as: "store",
                            attributes: ['name'],
                            include: [
                                {
                                    model: currency_1.default,
                                    as: "currency",
                                    attributes: ['symbol']
                                },
                            ]
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
            res
                .status(404)
                .json({
                message: "Auction product not found or auction is not ongoing.",
            });
            return;
        }
        // Get the current highest bid
        const highestBid = (_b = auctionProduct === null || auctionProduct === void 0 ? void 0 : auctionProduct.bids) === null || _b === void 0 ? void 0 : _b[0];
        // Determine minimum acceptable bid
        const highestBidAmount = highestBid ? Number(highestBid.bidAmount) : 0;
        const bidIncrement = auctionProduct.bidIncrement ? Number(auctionProduct.bidIncrement) : 0;
        const startingPrice = auctionProduct.price ? Number(auctionProduct.price) : 0;
        // Determine minimum acceptable bid
        const minAcceptableBid = highestBid
            ? highestBidAmount + bidIncrement
            : startingPrice;
        if (isNaN(minAcceptableBid)) {
            logger_1.default.error("Invalid minimum acceptable bid calculation.");
            res.status(500).json({ message: "Invalid minimum acceptable bid calculation." });
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
            const previousBidders = auctionProduct.bids.filter((bid) => bid.bidderId !== bidderId && bid.user // Exclude current bidder and ensure user exists
            );
            for (const previousBid of previousBidders) {
                if (previousBid.user) { // Ensure user is not undefined
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
                            attributes: ['symbol']
                        },
                    ]
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
                        }
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
            res.status(400).json({ message: "Account type cannot be changed to vendor" });
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
            res.status(400).json({ message: "Free plan not found. Please contact support." });
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
        res.status(200).json({ message: "Account successfully upgraded to vendor" });
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
            where.isRead = isRead === 'true';
        }
        // Calculate offset for pagination
        const paginationLimit = parseInt(limit, 10);
        const paginationPage = parseInt(page, 10);
        const offset = (paginationPage - 1) * paginationLimit;
        // Fetch notifications with filters, pagination, and sorting
        const { rows: notifications, count: total } = yield notification_1.default.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
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
            res.status(404).json({ message: "Notification not found or does not belong to the user" });
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
    const { orderId, page = 1, limit = 10 } = req.query;
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
            where: { orderId },
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
                            attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Include user details
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
    const { status, orderItemId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    // Define allowed statuses
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid order status provided." });
        return;
    }
    // Start transaction
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        // Find the order item
        const order = yield orderitem_1.default.findOne({ where: { id: orderItemId }, transaction });
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
                message: `Order is already ${order.status}. No further updates are allowed.`
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
        // Update the order status
        order.status = status;
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
        if ((status === "delivered" && currencySymbol === "#" && vendor) || (status === "delivered" && currencySymbol === "₦" && vendor)) {
            const price = Number(order.price);
            vendor.wallet = (Number(vendor.wallet) + price);
            yield vendor.save({ transaction });
        }
        // If the order is delivered and the currency is USD, add funds to the vendor's wallet
        if (status === "delivered" && currencySymbol === "$" && vendor) {
            const price = Number(order.price);
            vendor.dollarWallet = (Number(vendor.dollarWallet) + price);
            yield vendor.save({ transaction });
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
        // Commit transaction
        yield transaction.commit();
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderStatusUpdateNotification(buyer, status, productData === null || productData === void 0 ? void 0 : productData.name);
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
        res.status(500).json({ message: "An error occurred while updating the order status." });
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
        const product = yield product_1.default.findOne({ where: { id: productId, status: "active" } });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if the product is already saved (wishlist)
        const existingSavedProduct = yield saveproduct_1.default.findOne({
            where: { userId, productId }
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
        res.status(500).json({ message: "An error occurred while processing the request." });
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
                    ]
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
        res.status(500).json({ message: "An error occurred while fetching saved products." });
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
        res.status(400).json({ message: "Rating must be a numeric value between 1 and 5." });
        return;
    }
    try {
        // Check if user has purchased the product
        const purchased = yield (0, helpers_2.hasPurchasedProduct)(orderId, productId);
        if (!purchased) {
            res.status(403).json({ message: "You can only review products that has been delivered." });
            return;
        }
        // Check if the user already reviewed the product
        const existingReview = yield reviewproduct_1.default.findOne({ where: { userId, productId } });
        if (existingReview) {
            res.status(400).json({ message: "You have already reviewed this product." });
            return;
        }
        // Create the review
        yield reviewproduct_1.default.create({ userId, productId, rating, comment });
        res.status(200).json({ message: "Review submitted successfully." });
    }
    catch (error) {
        logger_1.default.error("Error adding review:", error);
        res.status(500).json({ message: "An error occurred while submitting the review." });
    }
});
exports.addReview = addReview;
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { reviewId, rating, comment } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID
    // Ensure rating is a valid number between 1 and 5
    if (typeof rating !== "number" || isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({ message: "Rating must be a numeric value between 1 and 5." });
        return;
    }
    try {
        // Find existing review
        const review = yield reviewproduct_1.default.findOne({ where: { userId, id: reviewId } });
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
        res.status(500).json({ message: "An error occurred while updating the review." });
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
                    attributes: ["id", "firstName", "lastName", "email"]
                }
            ],
        });
        res.status(200).json({ data: reviews });
    }
    catch (error) {
        logger_1.default.error("Error fetching reviews:", error);
        res.status(500).json({ message: "An error occurred while fetching reviews." });
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
                    attributes: ["id", "firstName", "lastName", "email"]
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
                    ]
                }
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
        res.status(500).json({ message: "An error occurred while fetching the review." });
    }
});
exports.getSingleReview = getSingleReview;
//# sourceMappingURL=userController.js.map