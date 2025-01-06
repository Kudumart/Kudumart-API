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
exports.placeBid = exports.showInterest = exports.clearCart = exports.getCartContents = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.markAsReadHandler = exports.deleteMessageHandler = exports.saveMessage = exports.sendMessageHandler = exports.getAllConversationMessages = exports.getConversations = exports.updateUserNotificationSettings = exports.getUserNotificationSettings = exports.confirmPhoneNumberUpdate = exports.updateProfilePhoneNumber = exports.confirmEmailUpdate = exports.updateProfileEmail = exports.updatePassword = exports.updateProfilePhoto = exports.updateProfile = exports.profile = exports.logout = void 0;
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
    var _b;
    try {
        const { firstName, lastName, dateOfBirth, gender, location } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id; // Assuming the user ID is passed in the URL params
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
    var _c;
    try {
        const { photo } = req.body;
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id; // Assuming the user ID is passed in the URL params
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
    var _d;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id; // Using optional chaining to access userId
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
        user.password = yield user_1.default.hashPassword(newPassword); // Hash the new password before saving
        yield user.save();
        // Send password reset notification email
        const message = messages_1.emailTemplates.passwordResetNotification(user);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Password Reset Notification`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
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
    var _e;
    const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.id; // Authenticated user ID from middleware
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
    var _f;
    const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f.id; // Authenticated user ID from middleware
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
    var _g;
    const userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g.id; // Authenticated user ID from middleware
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
        // Generate OTP for phone verification
        const otpCode = (0, helpers_1.generateOTP)();
        yield otp_1.default.upsert({
            userId: userId,
            otpCode: otpCode,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
        });
        // Send SMS with OTP
        const smsMessage = `Your ${process.env.APP_NAME} OTP code to verify your new phone number is: ${otpCode}`;
        try {
            yield (0, helpers_1.sendSMS)(newPhoneNumber, smsMessage);
            res.status(200).json({
                message: "OTP sent to your new phone number for verification",
                data: newPhoneNumber,
            });
        }
        catch (smsError) {
            logger_1.default.error("Error sending SMS:", smsError);
            res
                .status(500)
                .json({ message: "Failed to send OTP. Please try again later." });
            return;
        }
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
    var _h;
    const userId = (_h = req.user) === null || _h === void 0 ? void 0 : _h.id; // Authenticated user ID from middleware
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
    var _j;
    const userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j.id; // Get the authenticated user's ID
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
    var _k;
    const userId = (_k = req.user) === null || _k === void 0 ? void 0 : _k.id; // Get the authenticated user's ID
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
    var _l;
    const userId = (_l = req.user) === null || _l === void 0 ? void 0 : _l.id; // Get the authenticated user's ID
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
                    as: "senderUser",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Modify attributes as needed
                },
                {
                    model: user_1.default,
                    as: "receiverUser",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Modify attributes as needed
                },
                {
                    model: product_1.default,
                    as: "product",
                    attributes: ["id", "name"], // Modify attributes as needed
                },
                {
                    model: message_1.default,
                    as: "message",
                    limit: 1,
                    order: [["createdAt", "DESC"]],
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
    var _m;
    const userId = (_m = req.user) === null || _m === void 0 ? void 0 : _m.id; // Get the authenticated user's ID
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
                    as: "message",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
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
                userId: { [sequelize_1.Op.ne]: userId },
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
    var _o;
    const userId = (_o = req.user) === null || _o === void 0 ? void 0 : _o.id; // Get the authenticated user's ID
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
    var _p;
    const userId = (_p = req.user) === null || _p === void 0 ? void 0 : _p.id; // Get the authenticated user's ID
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
    var _q;
    const userId = (_q = req.user) === null || _q === void 0 ? void 0 : _q.id; // Get the authenticated user's ID
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
    var _r;
    const userId = (_r = req.user) === null || _r === void 0 ? void 0 : _r.id; // Get the authenticated user's ID
    // Ensure userId is defined
    if (!userId) {
        res.status(400).json({ message: "User must be authenticated" });
        return;
    }
    const { productId, quantity } = req.body;
    try {
        const existingCartItem = yield cart_1.default.findOne({
            where: { userId, productId },
        });
        if (existingCartItem) {
            // If item already in cart, update quantity
            existingCartItem.quantity += quantity;
            yield existingCartItem.save();
        }
        else {
            // Add new item to cart
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
    var _s;
    const userId = (_s = req.user) === null || _s === void 0 ? void 0 : _s.id; // Get the authenticated user's ID
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
    var _t;
    const userId = (_t = req.user) === null || _t === void 0 ? void 0 : _t.id; // Get the authenticated user's ID
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
    var _u;
    const userId = (_u = req.user) === null || _u === void 0 ? void 0 : _u.id; // Get the authenticated user's ID
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
// Bid
const showInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
    try {
        const { auctionProductId, amountPaid } = req.body;
        const userId = (_v = req.user) === null || _v === void 0 ? void 0 : _v.id; // Get the authenticated user's ID
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
const placeBid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _w, _x;
    try {
        const { auctionProductId, bidAmount } = req.body;
        const bidderId = (_w = req.user) === null || _w === void 0 ? void 0 : _w.id; // Authenticated user ID from middleware
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
        const highestBid = (_x = auctionProduct === null || auctionProduct === void 0 ? void 0 : auctionProduct.bids) === null || _x === void 0 ? void 0 : _x[0];
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
            res.status(500).json({ message: "An error occurred while calculating the bid amount." });
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
//# sourceMappingURL=userController.js.map