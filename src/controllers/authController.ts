// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { generateOTP } from "../utils/helpers";
import OTP from "../models/otp";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import JwtService from "../services/jwt.service";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import { capitalizeFirstLetter, generateUniquePhoneNumber } from "../utils/helpers";
import Admin from "../models/admin";
import Role from "../models/role";
import SubscriptionPlan from "../models/subscriptionplan";
import VendorSubscription from "../models/vendorsubscription";
import UserNotificationSetting from "../models/usernotificationsetting";
import Notification from "../models/notification";
import passport from "passport";

export const index = async (req: Request, res: Response) => {
  res.status(200).json({
    code: 200,
    message: `Welcome to ${process.env.APP_NAME} Endpoint.`,
  });
};

export const vendorRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  try {
    // Validate input
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // Check if the phone number already exists
    const existingPhoneNumber = await User.findOne({ where: { phoneNumber } });
    if (existingPhoneNumber) {
      res.status(400).json({ message: "Phone number already in use" });
      return;
    }

    // Find the free subscription plan
    const freePlan = await SubscriptionPlan.findOne({ where: { name: "Free Plan" } });
    if (!freePlan) {
      res.status(400).json({ message: "Free plan not found. Please contact support." });
      return;
    }

    // Create the new user
    const newUser = await User.create({
      email,
      password,
      firstName: capitalizeFirstLetter(firstName),
      lastName: capitalizeFirstLetter(lastName),
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

    await VendorSubscription.create({
      vendorId: newUser.id,
      subscriptionPlanId: freePlan.id,
      startDate,
      endDate,
      isActive: true,
    });

    // Create default notification settings for the user
    await UserNotificationSetting.create({
      userId: newUser.id,
      hotDeals: false,
      auctionProducts: false,
      subscription: false,
    });

    // Generate OTP for verification
    const otpCode = generateOTP();
    const otp = await OTP.create({
      userId: newUser.id,
      otpCode: otpCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    // Send mail
    const message = emailTemplates.verifyEmail(newUser, otp.otpCode);
    try {
      await sendMail(
        email,
        `${process.env.APP_NAME} - Verify Your Account`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError);
    }

    // Corrected Notification
    const notificationTitle = "Vendor Registration Successful";
    const notificationMessage = `Welcome, ${newUser.firstName}! Your vendor account has been created successfully.`;
    const notificationType = "vendor_registration";

    await Notification.create({
      userId: newUser.id,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
    });

    // Return a success response
    res.status(200).json({
      message:
        "Vendor registered successfully. A verification email has been sent to your email address. Please check your inbox to verify your account.",
    });
  } catch (error: any) {
    logger.error("Error during registration:", error);
    if (error.message) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const customerRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  try {
    // Validate input
    if (!email || !password || !firstName || !lastName || !phoneNumber) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return; // Make sure the function returns void here
    }

    // Check if the phone number already exists
    const existingPhoneNumber = await User.findOne({ where: { phoneNumber } });
    if (existingPhoneNumber) {
      res.status(400).json({ message: "Phone number already in use" });
      return;
    }

    // Create the new user
    const newUser = await User.create({
      email,
      password,
      firstName: capitalizeFirstLetter(firstName),
      lastName: capitalizeFirstLetter(lastName),
      phoneNumber,
      accountType: "Customer",
    });

    // Step 2: Create default notification settings for the user
    await UserNotificationSetting.create({
      userId: newUser.id,  // Link the settings to the new user
      hotDeals: false,  // Default value is false
      auctionProducts: false,  // Default value is false
      subscription: false,  // Default value is false
    });

    // Generate OTP for verification
    const otpCode = generateOTP();
    const otp = await OTP.create({
      userId: newUser.id,
      otpCode: otpCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
    });

    // Send mail
    let message = emailTemplates.verifyEmail(newUser, otp.otpCode);
    try {
      await sendMail(
        email,
        `${process.env.APP_NAME} - Verify Your Account`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    // Corrected Notification
    const notificationTitle = "Registration Successful";
    const notificationMessage = `Welcome, ${newUser.firstName}! Your account has been created successfully.`;
    const notificationType = "vendor_registration";

    await Notification.create({
      userId: newUser.id,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
    });

    // Return a success response
    res.status(200).json({ message: "Customer registered successfully. A verification email has been sent to your email address. Please check your inbox to verify your account." });
  } catch (error) {
    logger.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, otpCode } = req.body; // Assuming OTP and email are sent in the request body

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    if (!user.email_verified_at) {
      // Check for the OTP
      const otpRecord = await OTP.findOne({
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
      await user.save();

      // Optionally delete the OTP record after successful verification
      await OTP.destroy({ where: { userId: user.id } });

      const isVendor = user.accountType === "Vendor";
      const title = "Welcome to Our Platform!";
      const message = isVendor
        ? "Thank you for joining as a vendor! Start adding your products and managing your store."
        : "Welcome to our platform! Start exploring our amazing products and features.";

      // Create the notification in the database
      const notification = await Notification.create({
        userId: user.id,
        title,
        message,
        type: "welcome",
      });

      // Return a success response
      res.status(200).json({
        message: "Email verified successfully.",
      });
    } else {
      // If the email is already verified
      res.status(200).json({
        message: "Your account has already been verified. You can now log in.",
      });
    }
  } catch (error: any) {
    logger.error("Error verifying email:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.scope("auth").findOne({ where: { email } });

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

    // Check if email is verified
    if (!user.email_verified_at) {
      // Generate a new OTP
      const otpCode = generateOTP();

      // Update or create the OTP record
      await OTP.upsert({
        userId: user.id,
        otpCode,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
      });

      // Prepare and send the verification email
      const message = emailTemplates.verifyEmail(user, otpCode); // Ensure verifyEmailMessage generates the correct email message
      try {
        await sendMail(
          email,
          `${process.env.APP_NAME} - Verify Your Account`,
          message
        );
      } catch (emailError) {
        logger.error("Error sending email:", emailError); // Log error for internal use
      }

      res.status(403).json({
        message:
          "Your email is not verified. A verification email has been sent to your email address.",
      });
      return;
    }

    // Check if the password is correct
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    // Generate token
    const token = JwtService.jwtSign(user.id);

    // Successful login
    res.status(200).json({
      message: "Login successful",
      data: {
        ...user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error("Error in login:", error);

    // Handle server errors
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body; // Assuming the email is sent in the request body

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email } });
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

    // Generate a new OTP
    const otpCode = generateOTP();

    // Update or create the OTP record
    await OTP.upsert({
      userId: user.id,
      otpCode: otpCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
    });

    // Prepare and send the verification email
    const message = emailTemplates.verifyEmail(user, otpCode); // Ensure this function generates the correct email message
    try {
      await sendMail(
        email,
        `${process.env.APP_NAME} - Verify Your Account`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    // Return success response
    res.status(200).json({
      message: "Verification email has been resent successfully.",
    });
  } catch (error) {
    logger.error("Error resending verification email:", error);

    res.status(500).json({ code: 500, message: "Internal server error" });
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User with this email does not exist" });
      return;
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Update or create OTP record
    await OTP.upsert({
      userId: user.id,
      otpCode: otpCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
    });

    // Send OTP to user's email
    const message = emailTemplates.forgotPassword(user, otpCode);
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Reset Password`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    res.status(200).json({
      message: "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    logger.error("Error in forgetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const codeCheck = async (req: Request, res: Response): Promise<void> => {
  const { email, otpCode } = req.body;

  try {
    // Find OTP for the user
    const otpRecord = await OTP.findOne({
      where: {
        otpCode,
      },
      include: {
        model: User, // Assuming OTP is linked to User model
        as: "user",
        where: { email },
      },
    });

    // Check if OTP is valid
    if (!otpRecord || !otpRecord.expiresAt || otpRecord.expiresAt < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    res.status(200).json({
      message: "OTP is valid",
    });
  } catch (error) {
    logger.error("Error in checkResetCode:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, otpCode, newPassword, confirmPassword } = req.body;

  try {
    // Find OTP and check if it's valid
    const otpRecord = await OTP.findOne({
      where: { otpCode },
      include: {
        model: User,
        as: "user",
        where: { email },
      },
    });

    // Ensure OTP and User are valid
    if (!otpRecord || !otpRecord.user || otpRecord.expiresAt! < new Date()) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await User.update({ password: hashedPassword }, { where: { email } });

    // Optionally delete OTP after successful password reset
    await OTP.destroy({ where: { userId: otpRecord.userId } });

    // Send password reset notification email
    const message = emailTemplates.passwordResetNotification(otpRecord.user);
    try {
      await sendMail(
        otpRecord.user.email,
        `${process.env.APP_NAME} - Password Reset Notification`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    // Send reset password notification
    const title = "Password Reset Request";
    const messageContent = "A password reset request was initiated for your account. If this wasn't you, please contact support.";
    const type = "reset_password";

    // Create the notification in the database
    const notification = await Notification.create({
      userId: otpRecord.user.id,
      title,
      message: messageContent,
      type,
    });

    res.status(200).json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    logger.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const account_type = req.query.account_type as string;

  if (!account_type || !["Customer", "Vendor"].includes(account_type)) {
    res.status(400).json({
      message: "Invalid account type. Use 'Customer' or 'Vendor'.",
    });
    return;
  }

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: account_type, // Pass account type as state
  })(req, res);
};

/**
 * Handle Successful Social Login
 */
export const socialAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication failed' });
      return;
    }

    // Extract the user object from the request
    const user = (req.user as any).toJSON() || req.user;

    // Ensure user.accountType is a string and matches the Vendor condition
    if (user.accountType === 'Vendor') {
      // Find the free subscription plan
      const freePlan = await SubscriptionPlan.findOne({ where: { name: "Free Plan" } });
      if (!freePlan) {
        res.status(400).json({ message: "Free plan not found. Please contact support." });
        return;
      }

      // Assign the free plan to the new user
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + freePlan.duration);

      await VendorSubscription.create({
        vendorId: user.id,
        subscriptionPlanId: freePlan.id,
        startDate,
        endDate,
        isActive: true,
      });

      // Create default notification settings for the user
      await UserNotificationSetting.create({
        userId: user.id,
        hotDeals: false,
        auctionProducts: false,
        subscription: false,
      });
    }

    // Generate token
    const token = JwtService.jwtSign(user.id);

    // Successful login, return the user data including token
    res.status(200).json({
      message: "Login successful",
      data: {
        ...user, // Spread the user object directly
        token, // Add the token directly here
      },
    });
  } catch (error) {
    logger.error("Error in login:", error);

    // Handle server errors
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleGoogleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phoneNumber, accountType, providerId } = req.body;

    if (!firstName || !lastName || !email || !accountType || !providerId) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (!["Customer", "Vendor"].includes(accountType)) {
      res.status(400).json({ message: "Invalid account type." });
      return;
    }

    // Check if the user already exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Create a new user
      user = await User.create({
        email,
        firstName,
        lastName,
        accountType,
        password: await generateUniquePhoneNumber(), // Generate unique phone number
        phoneNumber: await generateUniquePhoneNumber(), // Generate unique phone number
        googleId: providerId, // Storing provider ID as Google ID
        email_verified_at: new Date(),
      });
    }

    // Attach user to req object for next function
    (req as any).user = user;

    // Call socialAuthCallback after successful authentication
    await socialAuthCallback(req, res);
  } catch (error) {
    res.status(500).json({ message: "An error occurred during authentication.", error });
  }
};

// Admin Login
export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await Admin.scope("auth").findOne({
      where: { email },
      include: [
        {
          model: Role, // Assuming you've imported the Role model
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
    const isPasswordValid = await admin.checkPassword(password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    // Generate token
    const token = JwtService.jwtSign(admin.id);

    // Successful login
    res.status(200).json({
      message: "Admin login successful",
      data: admin,
      token,
    });
  } catch (error) {
    logger.error("Error in login:", error);

    // Handle server errors
    res.status(500).json({ message: "Internal server error" });
  }
};