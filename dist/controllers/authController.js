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
exports.aliExpressAuthCallback = exports.aliExpressAuth = exports.createAliexpressAccount = exports.adminLogin = exports.handleGoogleAuth = exports.socialAuthCallback = exports.googleAuth = exports.resetPassword = exports.codeCheck = exports.forgetPassword = exports.resendVerificationEmail = exports.login = exports.verifyEmailWithToken = exports.verifyEmail = exports.customerRegister = exports.vendorRegister = exports.index = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const helpers_1 = require("../utils/helpers");
const otp_1 = __importDefault(require("../models/otp"));
const mail_service_1 = require("../services/mail.service");
const messages_1 = require("../utils/messages");
const jwt_service_1 = __importDefault(require("../services/jwt.service"));
const logger_1 = __importDefault(require("../middlewares/logger")); // Adjust the path to your logger.js
const helpers_2 = require("../utils/helpers");
const admin_1 = __importDefault(require("../models/admin"));
const role_1 = __importDefault(require("../models/role"));
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const usernotificationsetting_1 = __importDefault(require("../models/usernotificationsetting"));
const notification_1 = __importDefault(require("../models/notification"));
const passport_1 = __importDefault(require("passport"));
const pushNotification_1 = require("../firebase/pushNotification");
const dropShipping_service_1 = require("../services/dropShipping.service");
const dropshippngCreds_1 = __importDefault(require("../models/dropshippngCreds"));
const index = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        code: 200,
        message: `Welcome to ${process.env.APP_NAME} Endpoint.`,
    });
});
exports.index = index;
const dropShippingService = new dropShipping_service_1.DropShippingService();
const vendorRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, phoneNumber, platform } = req.body;
    try {
        // Validate input
        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        // Check if the user already exists
        const existingUser = yield user_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Check if the phone number already exists
        const existingPhoneNumber = yield user_1.default.findOne({ where: { phoneNumber } });
        if (existingPhoneNumber) {
            res.status(400).json({ message: "Phone number already in use" });
            return;
        }
        // Find the free subscription plan
        const freePlan = yield subscriptionplan_1.default.findOne({
            where: { name: "Free Plan" },
        });
        if (!freePlan) {
            res
                .status(400)
                .json({ message: "Free plan not found. Please contact support." });
            return;
        }
        // Create the new user
        const newUser = yield user_1.default.create({
            email,
            password,
            firstName: (0, helpers_2.capitalizeFirstLetter)(firstName),
            lastName: (0, helpers_2.capitalizeFirstLetter)(lastName),
            phoneNumber,
            accountType: "Vendor",
        });
        if (!newUser) {
            throw new Error("Failed to create new user");
        }
        // Assign the free plan to the new user
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + freePlan.duration);
        yield vendorsubscription_1.default.create({
            vendorId: newUser.id,
            subscriptionPlanId: freePlan.id,
            startDate,
            endDate,
            isActive: true,
        });
        // Create default notification settings for the user
        yield usernotificationsetting_1.default.create({
            userId: newUser.id,
            hotDeals: false,
            auctionProducts: false,
            subscription: false,
        });
        try {
            let message;
            if (!platform || platform === "mobile") {
                // Generate OTP for verification
                const otpCode = (0, helpers_1.generateOTP)();
                const otp = yield otp_1.default.create({
                    userId: newUser.id,
                    otpCode: otpCode,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                });
                message = messages_1.emailTemplates.verifyEmail(newUser, otp.otpCode);
            }
            else {
                //web
                // Generate OTP Token for web verification
                const otpToken = (0, helpers_1.generateOTPToken)();
                // Generate OTP Token to store in database
                const hashedOtpToken = (0, helpers_1.generateHashedOTPToken)(otpToken);
                yield otp_1.default.create({
                    userId: newUser.id,
                    otpToken: hashedOtpToken,
                    otpTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
                });
                message = messages_1.emailTemplates.verifyEmailWithLink(newUser, otpToken);
            }
            // Send mail
            yield (0, mail_service_1.sendMail)(email, `${process.env.APP_NAME} - Verify Your Account`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError);
        }
        // Corrected Notification
        const notificationTitle = "Vendor Registration Successful";
        const notificationMessage = `Welcome, ${newUser.firstName}! Your vendor account has been created successfully.`;
        const notificationType = "vendor_registration";
        yield notification_1.default.create({
            userId: newUser.id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
        });
        // Return a success response
        res.status(200).json({
            message: "Vendor registered successfully. A verification email has been sent to your email address. Please check your inbox to verify your account.",
        });
    }
    catch (error) {
        logger_1.default.error("Error during registration:", error);
        if (error.message) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Server error" });
        }
    }
});
exports.vendorRegister = vendorRegister;
const customerRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, phoneNumber, platform } = req.body;
    try {
        // Validate input
        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        // Check if the user already exists
        const existingUser = yield user_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "Email already in use" });
            return; // Make sure the function returns void here
        }
        // Check if the phone number already exists
        const existingPhoneNumber = yield user_1.default.findOne({ where: { phoneNumber } });
        if (existingPhoneNumber) {
            res.status(400).json({ message: "Phone number already in use" });
            return;
        }
        // Create the new user
        const newUser = yield user_1.default.create({
            email,
            password,
            firstName: (0, helpers_2.capitalizeFirstLetter)(firstName),
            lastName: (0, helpers_2.capitalizeFirstLetter)(lastName),
            phoneNumber,
            accountType: "Customer",
        });
        // Step 2: Create default notification settings for the user
        yield usernotificationsetting_1.default.create({
            userId: newUser.id, // Link the settings to the new user
            hotDeals: false, // Default value is false
            auctionProducts: false, // Default value is false
            subscription: false, // Default value is false
        });
        try {
            let message;
            if (!platform || platform == "mobile") {
                // Generate OTP for verification
                const otpCode = (0, helpers_1.generateOTP)();
                const otp = yield otp_1.default.create({
                    userId: newUser.id,
                    otpCode: otpCode,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
                });
                // Send mail
                message = messages_1.emailTemplates.verifyEmail(newUser, otp.otpCode);
            }
            else {
                //web
                // Generate OTP Token for web verification
                const otpToken = (0, helpers_1.generateOTPToken)();
                // Generate OTP Token to store in database
                const hashedOtpToken = (0, helpers_1.generateHashedOTPToken)(otpToken);
                yield otp_1.default.create({
                    userId: newUser.id,
                    otpToken: hashedOtpToken,
                    otpTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
                });
                message = messages_1.emailTemplates.verifyEmailWithLink(newUser, otpToken);
            }
            yield (0, mail_service_1.sendMail)(email, `${process.env.APP_NAME} - Verify Your Account`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Corrected Notification
        const notificationTitle = "Registration Successful";
        const notificationMessage = `Welcome, ${newUser.firstName}! Your account has been created successfully.`;
        const notificationType = "vendor_registration";
        yield notification_1.default.create({
            userId: newUser.id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
        });
        const notificatonTopic = {
            topic: "new_user",
            notification: {
                title: "New User Registration",
                body: `A new user has registered with the email: ${newUser.email}`,
            },
            data: {
                userId: newUser.id,
            },
        };
        yield (0, pushNotification_1.sendPushNotificationToTopic)(notificatonTopic);
        // Return a success response
        res.status(200).json({
            message: "Customer registered successfully. A verification email has been sent to your email address. Please check your inbox to verify your account.",
        });
    }
    catch (error) {
        logger_1.default.error("Error during registration:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.customerRegister = customerRegister;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otpCode } = req.body; // Assuming OTP and email are sent in the request body
    try {
        // Check if the user exists
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (!user.email_verified_at) {
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
            // Update the user's email verification status
            user.email_verified_at = new Date(); // Assuming this field exists in the User model
            yield user.save();
            // Optionally delete the OTP record after successful verification
            yield otp_1.default.destroy({ where: { userId: user.id } });
            const isVendor = user.accountType === "Vendor";
            const title = "Welcome to Our Platform!";
            const message = isVendor
                ? "Thank you for joining as a vendor! Start adding your products and managing your store."
                : "Welcome to our platform! Start exploring our amazing products and features.";
            // Create the notification in the database
            const notification = yield notification_1.default.create({
                userId: user.id,
                title,
                message,
                type: "welcome",
            });
            // Return a success response
            res.status(200).json({
                message: "Email verified successfully.",
            });
        }
        else {
            // If the email is already verified
            res.status(200).json({
                message: "Your account has already been verified. You can now log in.",
            });
        }
    }
    catch (error) {
        logger_1.default.error("Error verifying email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.verifyEmail = verifyEmail;
const verifyEmailWithToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.body; // Assuming OTP token and email are sent in the request body
    try {
        // Check if the user exists
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (!user.email_verified_at) {
            // Generate an hash of the token
            const hashedOtpToken = (0, helpers_1.generateHashedOTPToken)(token);
            // Check for the OTP token
            const otpRecord = yield otp_1.default.findOne({
                where: { userId: user.id, otpToken: hashedOtpToken },
            });
            if (!otpRecord) {
                res.status(400).json({ message: "Invalid OTP token." });
                return;
            }
            // Check if the OTP has expired
            if (!otpRecord.otpTokenExpiresAt ||
                new Date() > otpRecord.otpTokenExpiresAt) {
                res.status(400).json({ message: "OTP has expired." });
                return;
            }
            // Update the user's email verification status
            user.email_verified_at = new Date(); // Assuming this field exists in the User model
            yield user.save();
            // Optionally delete the OTP record after successful verification
            yield otp_1.default.destroy({ where: { userId: user.id } });
            const isVendor = user.accountType === "Vendor";
            const title = "Welcome to Our Platform!";
            const message = isVendor
                ? "Thank you for joining as a vendor! Start adding your products and managing your store."
                : "Welcome to our platform! Start exploring our amazing products and features.";
            // Create the notification in the database
            const notification = yield notification_1.default.create({
                userId: user.id,
                title,
                message,
                type: "welcome",
            });
            // Return a success response
            res.status(200).json({
                message: "Email verified successfully.",
            });
        }
        else {
            // If the email is already verified
            res.status(200).json({
                message: "Your account has already been verified. You can now log in.",
            });
        }
    }
    catch (error) {
        logger_1.default.error("Error verifying email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.verifyEmailWithToken = verifyEmailWithToken;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, platform, fcmToken } = req.body;
    try {
        // Find user by email
        const user = yield user_1.default.scope("auth").findOne({ where: { email } });
        // Check if user exists
        if (!user) {
            res.status(400).json({ message: "Email doesn't exist" });
            return;
        }
        // Check if user is inactive
        if (user.status === "inactive") {
            res
                .status(403)
                .json({ message: "Your account is inactive. Please contact support." });
            return;
        }
        let message;
        // Check if email is verified
        if (!user.email_verified_at) {
            if (!platform || platform === "mobile") {
                // Generate a new OTP
                const otpCode = (0, helpers_1.generateOTP)();
                // Update or create the OTP record
                yield otp_1.default.upsert({
                    userId: user.id,
                    otpCode,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
                });
                // Prepare and send the verification email
                message = messages_1.emailTemplates.verifyEmail(user, otpCode); // Ensure verifyEmailMessage generates the correct email message
            }
            else {
                //web
                // Generate OTP Token for web verification
                const otpToken = (0, helpers_1.generateOTPToken)();
                // Generate OTP Token to store in database
                const hashedOtpToken = (0, helpers_1.generateHashedOTPToken)(otpToken);
                yield otp_1.default.upsert({
                    userId: user.id,
                    otpToken: hashedOtpToken,
                    otpTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP token expires in 1 hour
                });
                // Prepare and send the verification email
                message = messages_1.emailTemplates.verifyEmailWithLink(user, otpToken); // Ensure verifyEmailWithLink generates the correct email message
            }
            try {
                yield (0, mail_service_1.sendMail)(email, `${process.env.APP_NAME} - Verify Your Account`, message);
            }
            catch (emailError) {
                logger_1.default.error("Error sending email:", emailError); // Log error for internal use
            }
            res.status(403).json({
                message: "Your email is not verified. A verification email has been sent to your email address.",
            });
            return;
        }
        // Check if the password is correct
        const isPasswordValid = yield user.checkPassword(password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Incorrect password" });
            return;
        }
        // update FCM token if provided
        if (fcmToken) {
            user.fcmToken = fcmToken;
            yield user.save();
        }
        // Generate token
        const token = jwt_service_1.default.jwtSign(user.id);
        // Successful login
        res.status(200).json({
            message: "Login successful",
            data: Object.assign(Object.assign({}, user.toJSON()), { location: typeof user.location === "string"
                    ? JSON.parse(user.location)
                    : user.location, token }),
        });
    }
    catch (error) {
        logger_1.default.error("Error in login:", error);
        // Handle server errors
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
const resendVerificationEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, platform } = req.body; // Assuming the email is sent in the request body
    try {
        // Check if the user exists
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        if (user.email_verified_at) {
            // If the email is already verified
            res.status(200).json({
                message: "Your account has already been verified. You can now log in.",
            });
        }
        try {
            let message;
            if (!platform || platform === "mobile") {
                // Generate a new OTP
                const otpCode = (0, helpers_1.generateOTP)();
                // Update or create the OTP record
                yield otp_1.default.upsert({
                    userId: user.id,
                    otpCode: otpCode,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
                });
                // Prepare and send the verification email
                message = messages_1.emailTemplates.verifyEmail(user, otpCode); // Ensure this function generates the correct email message
            }
            else {
                //web
                // Generate OTP Token for web verification
                const otpToken = (0, helpers_1.generateOTPToken)();
                // Generate OTP Token to store in database
                const hashedOtpToken = (0, helpers_1.generateHashedOTPToken)(otpToken);
                yield otp_1.default.upsert({
                    userId: user.id,
                    otpToken: hashedOtpToken,
                    otpTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP token expires in 1 hour
                });
                // Prepare and send the verification email
                message = messages_1.emailTemplates.verifyEmailWithLink(user, otpToken); // Ensure this function generates the correct email message
            }
            yield (0, mail_service_1.sendMail)(email, `${process.env.APP_NAME} - Verify Your Account`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        // Return success response
        res.status(200).json({
            message: "Verification email has been resent successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Error resending verification email:", error);
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if user exists
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: "User with this email does not exist" });
            return;
        }
        // Generate OTP
        const otpCode = (0, helpers_1.generateOTP)();
        // Update or create OTP record
        yield otp_1.default.upsert({
            userId: user.id,
            otpCode: otpCode,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
        });
        // Send OTP to user's email
        const message = messages_1.emailTemplates.forgotPassword(user, otpCode);
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Reset Password`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        res.status(200).json({
            message: "Password reset OTP has been sent to your email",
        });
    }
    catch (error) {
        logger_1.default.error("Error in forgetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.forgetPassword = forgetPassword;
const codeCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otpCode } = req.body;
    try {
        // Find OTP for the user
        const otpRecord = yield otp_1.default.findOne({
            where: {
                otpCode,
            },
            include: {
                model: user_1.default, // Assuming OTP is linked to User model
                as: "user",
                where: { email },
            },
        });
        // Check if OTP is valid
        if (!otpRecord ||
            !otpRecord.expiresAt ||
            otpRecord.expiresAt < new Date()) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        res.status(200).json({
            message: "OTP is valid",
        });
    }
    catch (error) {
        logger_1.default.error("Error in checkResetCode:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.codeCheck = codeCheck;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otpCode, newPassword, confirmPassword } = req.body;
    try {
        // Find OTP and check if it's valid
        const otpRecord = yield otp_1.default.findOne({
            where: { otpCode },
            include: {
                model: user_1.default,
                as: "user",
                where: { email },
            },
        });
        // Ensure OTP and User are valid
        if (!otpRecord || !otpRecord.user || otpRecord.expiresAt < new Date()) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        // Hash the new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update user's password
        yield user_1.default.update({ password: hashedPassword }, { where: { email } });
        // Optionally delete OTP after successful password reset
        yield otp_1.default.destroy({ where: { userId: otpRecord.userId } });
        // Send password reset notification email
        const message = messages_1.emailTemplates.passwordResetNotification(otpRecord.user);
        try {
            yield (0, mail_service_1.sendMail)(otpRecord.user.email, `${process.env.APP_NAME} - Password Reset Notification`, message);
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
            userId: otpRecord.user.id,
            title,
            message: messageContent,
            type,
        });
        res.status(200).json({
            message: "Password has been reset successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error in resetPassword:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.resetPassword = resetPassword;
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const account_type = req.query.account_type;
    if (!account_type || !["Customer", "Vendor"].includes(account_type)) {
        res.status(400).json({
            message: "Invalid account type. Use 'Customer' or 'Vendor'.",
        });
        return;
    }
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: account_type, // Pass account type as state
    })(req, res);
});
exports.googleAuth = googleAuth;
/**
 * Handle Successful Social Login
 */
const socialAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }
        // Extract the user object from the request
        const user = req.user.toJSON() || req.user;
        // Ensure user.accountType is a string and matches the Vendor condition
        if (user.accountType === "Vendor") {
            // Find the free subscription plan
            const freePlan = yield subscriptionplan_1.default.findOne({
                where: { name: "Free Plan" },
            });
            if (!freePlan) {
                res
                    .status(400)
                    .json({ message: "Free plan not found. Please contact support." });
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
            });
            // Create default notification settings for the user
            yield usernotificationsetting_1.default.create({
                userId: user.id,
                hotDeals: false,
                auctionProducts: false,
                subscription: false,
            });
        }
        // Generate token
        const token = jwt_service_1.default.jwtSign(user.id);
        // Successful login, return the user data including token
        res.status(200).json({
            message: "Login successful",
            data: Object.assign(Object.assign({}, user), { // Spread the user object directly
                token }),
        });
    }
    catch (error) {
        logger_1.default.error("Error in login:", error);
        // Handle server errors
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.socialAuthCallback = socialAuthCallback;
const handleGoogleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, phoneNumber, accountType, fcmToken, providerId, } = req.body;
        if (!firstName || !lastName || !email || !accountType || !providerId) {
            res.status(400).json({ message: "All fields are required." });
            return;
        }
        if (!["Customer", "Vendor"].includes(accountType)) {
            res.status(400).json({ message: "Invalid account type." });
            return;
        }
        // Check if the user already exists
        let user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            // Create a new user
            user = yield user_1.default.create({
                email,
                firstName,
                lastName,
                fcmToken: fcmToken || "",
                accountType,
                password: yield (0, helpers_2.generateUniquePhoneNumber)(), // Generate unique phone number
                phoneNumber: yield (0, helpers_2.generateUniquePhoneNumber)(), // Generate unique phone number
                googleId: providerId, // Storing provider ID as Google ID
                email_verified_at: new Date(),
            });
        }
        else {
            yield user_1.default.update({
                fcmToken: fcmToken || user.fcmToken,
            }, {
                where: { email },
            });
            user.fcmToken = fcmToken; // Update FCM token if provided
        }
        // Attach user to req object for next function
        req.user = user;
        // Call socialAuthCallback after successful authentication
        yield (0, exports.socialAuthCallback)(req, res);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "An error occurred during authentication.", error });
    }
});
exports.handleGoogleAuth = handleGoogleAuth;
// Admin Login
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, fcmToken } = req.body;
    try {
        // Find admin by email
        const admin = yield admin_1.default.scope("auth").findOne({
            where: { email },
            include: [
                {
                    model: role_1.default, // Assuming you've imported the Role model
                    as: "role", // Make sure this alias matches the one you used in the association
                },
            ],
        });
        // Check if admin exists
        if (!admin) {
            res.status(400).json({ message: "Invalid email" });
            return;
        }
        // Check if user is inactive
        if (admin.status === "inactive") {
            res
                .status(403)
                .json({ message: "Your account is inactive. Please contact support." });
            return;
        }
        // Check if the password is correct
        const isPasswordValid = yield admin.checkPassword(password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Incorrect password" });
            return;
        }
        if (fcmToken) {
            // Update FCM token if provided
            admin.fcmToken = fcmToken;
            yield admin.save();
        }
        // Generate token
        const token = jwt_service_1.default.jwtSign(admin.id);
        // Successful login
        res.status(200).json({
            message: "Admin login successful",
            data: admin,
            token,
        });
    }
    catch (error) {
        logger_1.default.error("Error in login:", error);
        // Handle server errors
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.adminLogin = adminLogin;
const createAliexpressAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const {} = req.user;
    const vendorId = req.admin.id;
    const { account } = req.body;
    try {
        // Validate input
        if (!account) {
            res.status(400).json({ message: "Account is required" });
            return;
        }
        if (account && account.trim() === "") {
            res.status(400).json({ message: "Account cannot be empty" });
            return;
        }
        // Check if the dropshipping account already exists
        const existingAccount = yield dropshippngCreds_1.default.findOne({
            where: { account },
        });
        if (existingAccount) {
            res.status(400).json({ message: "Account already exists" });
            return;
        }
        // Create the new dropshipping account
        yield dropshippngCreds_1.default.create({
            account,
            vendorId,
        });
        // Return a success response
        res.status(200).json({
            message: "Dropshipping account created successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Error during dropshipping account creation:", error);
        if (error.message) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Server error" });
        }
    }
});
exports.createAliexpressAccount = createAliexpressAccount;
const aliExpressAuth = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dropShippingService = new dropShipping_service_1.DropShippingService();
        // Redirect to AliExpress authorization URL
        const authUrl = yield dropShippingService.getAuthorizationUrl();
        res.status(200).json({
            message: "Redirecting to AliExpress for authorization.",
            authUrl,
        });
    }
    catch (error) {
        logger_1.default.error("Error in aliExpressAuth:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.aliExpressAuth = aliExpressAuth;
const aliExpressAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const code = (_a = req.query) === null || _a === void 0 ? void 0 : _a.code;
        if (!code) {
            res.status(400).json({ message: "Authorization code is required." });
            return;
        }
        // Call the service to get the access token
        const accessTokenData = yield dropShippingService.getAccessToken(code);
        const existingCred = yield dropshippngCreds_1.default.findOne({
            where: { account: accessTokenData.account },
        });
        if (!existingCred) {
            res.status(400).json({
                message: "No matching account found for the provided credentials.",
            });
            return;
        }
        yield dropshippngCreds_1.default.update({
            accessToken: accessTokenData.accessToken,
            refreshToken: accessTokenData.refreshToken,
            expiresIn: accessTokenData.expiresIn,
            expireTime: accessTokenData.expireTime,
            userId: accessTokenData.userId,
            userNick: accessTokenData.userNick,
            refreshExpiresIn: accessTokenData.refreshExpiresIn,
            refreshTokenValidTime: accessTokenData.refreshTokenValidTime,
            locale: accessTokenData.locale,
            accountPlatform: accessTokenData.accountPlatform,
            sellerId: accessTokenData.sellerId,
        }, {
            where: { account: accessTokenData.account },
        });
        res.status(200).json({
            message: "AliExpress authentication successful. Access token saved.",
        });
    }
    catch (error) {
        logger_1.default.error("Error in aliExpressAuthCallback:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.aliExpressAuthCallback = aliExpressAuthCallback;
//# sourceMappingURL=authController.js.map