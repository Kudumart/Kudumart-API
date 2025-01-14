// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { Op, Sequelize } from "sequelize";
import { generateOTP, verifyPayment, sendSMS } from "../utils/helpers";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import JwtService from "../services/jwt.service";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import { capitalizeFirstLetter } from "../utils/helpers";
import OTP from "../models/otp";
import { AuthenticatedRequest } from "../types/index";
import UserNotificationSetting from "../models/usernotificationsetting";
import Message from "../models/message";
import Product from "../models/product";
import Conversation from "../models/conversation";
import AuctionProduct from "../models/auctionproduct";
import Bid from "../models/bid";
import { io } from "../index";
import Cart from "../models/cart";
import ShowInterest from "../models/showinterest";
import PaymentGateway from "../models/paymentgateway";
import sequelizeService from "../services/sequelize.service";
import Order from "../models/order";
import OrderItem from "../models/orderitem";
import Payment from "../models/payment";
import Store from "../models/store";
import Currency from "../models/currency";
import Notification from "../models/notification";
import SubscriptionPlan from "../models/subscriptionplan";
import VendorSubscription from "../models/vendorsubscription";

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the token from the request
    const token = JwtService.jwtGetToken(req);

    if (!token) {
      res.status(400).json({
        message: "Token not provided",
      });
      return;
    }

    // Blacklist the token to prevent further usage
    await JwtService.jwtBlacklistToken(token);

    res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Server error during logout.",
    });
  }
};

export const profile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id; // Assuming the user ID is passed in the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "Profile retrieved successfully.",
      data: user,
    });
  } catch (error: any) {
    logger.error("Error retrieving user profile:", error);

    res.status(500).json({
      message: "Server error during retrieving profile.",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, location } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Assuming the user ID is passed in the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Update user profile information
    user.firstName = firstName
      ? capitalizeFirstLetter(firstName)
      : user.firstName;
    user.lastName = lastName ? capitalizeFirstLetter(lastName) : user.lastName;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;
    user.location = location || user.location;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error: any) {
    logger.error("Error updating user profile:", error);

    res.status(500).json({
      message: "Server error during profile update.",
    });
  }
};

export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
    const { photo } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Assuming the user ID is passed in the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Update user profile photo
    user.photo = photo || user.photo;

    await user.save();

    res.status(200).json({
      message: "Profile photo updated successfully.",
      data: user,
    });
  } catch (error: any) {
    logger.error("Error updating user profile photo:", error);

    res.status(500).json({
      message: "Server error during profile photo update.",
    });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const userId = (req as AuthenticatedRequest).user?.id; // Using optional chaining to access userId

  try {
    // Find the user
    const user = await User.scope("auth").findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Check if the old password is correct
    const isMatch = await user.checkPassword(oldPassword);
    if (!isMatch) {
      res.status(400).json({ message: "Old password is incorrect." });
      return;
    }

    // Update the password
    user.password = await User.hashPassword(newPassword); // Hash the new password before saving
    await user.save();

    // Send password reset notification email
    const message = emailTemplates.passwordResetNotification(user);
    try {
      await sendMail(
        user.email,
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
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: "Server error during password update.",
    });
  }
};

export const updateProfileEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
  const { newEmail } = req.body;

  try {
    // Check if the current email matches the authenticated user's email
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if the new email already exists for another user
    const existingUser = await User.findOne({ where: { email: newEmail } });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "Email is already in use by another account" });
      return;
    }

    // Generate OTP for verification
    const otpCode = generateOTP();
    const otp = await OTP.upsert({
      userId: userId,
      otpCode: otpCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
    });

    // Send mail
    let message = emailTemplates.resendCode(user, otpCode, newEmail);
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Verify Your New Email Address`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    // Send response
    res.status(200).json({
      message: "New email verification code sent successfully",
      data: newEmail,
    });
  } catch (error) {
    logger.error("Error updating profile email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the email" });
  }
};

export const confirmEmailUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
  const { newEmail, otpCode } = req.body;

  try {
    // Check if the current email matches the authenticated user's email
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if the new email already exists for another user
    const existingUser = await User.findOne({ where: { email: newEmail } });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "Email is already in use by another account" });
      return;
    }

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

    // Update the user's email
    user.email = newEmail;
    await user.save();

    // Optionally delete the OTP record after successful verification
    await OTP.destroy({ where: { userId: user.id } });

    // Send mail
    let message = emailTemplates.emailAddressChanged(user);
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Email Address Changed`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    // Send a notification for becoming a vendor
    const title = "Email Address Updated";
    const messageContent = `Your email address has been successfully updated to ${newEmail}.`;
    const type = "update_email";

    // Create the notification in the database
    const notification = await Notification.create({
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    // Send response
    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    logger.error("Error updating profile email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the email" });
  }
};

export const updateProfilePhoneNumber = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
  const { newPhoneNumber } = req.body;

  try {
    // Check if the current user exists
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if the new phone number already exists for another user
    const existingUser = await User.findOne({
      where: { phoneNumber: newPhoneNumber },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "Phone number is already in use by another account" });
      return;
    }

    // Generate OTP for phone verification
    const otpCode = generateOTP();
    await OTP.upsert({
      userId: userId,
      otpCode: otpCode,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // OTP expires in 1 hour
    });

    // Send SMS with OTP
    const smsMessage = `Your ${process.env.APP_NAME} OTP code to verify your new phone number is: ${otpCode}`;
    try {
      await sendSMS(newPhoneNumber, smsMessage);
      res.status(200).json({
        message: "OTP sent to your new phone number for verification",
        data: newPhoneNumber,
      });
    } catch (smsError) {
      logger.error("Error sending SMS:", smsError);
      res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again later." });
      return;
    }
  } catch (error) {
    logger.error("Error updating phone number:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the phone number" });
  }
};

export const confirmPhoneNumberUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
  const { newPhoneNumber, otpCode } = req.body;

  try {
    // Check if the current user exists
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if the new phone number already exists for another user
    const existingUser = await User.findOne({
      where: { phoneNumber: newPhoneNumber },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "Phone number is already in use by another account" });
      return;
    }

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

    // Update the user's phone number
    user.phoneNumber = newPhoneNumber;
    await user.save();

    // Optionally delete the OTP record after successful verification
    await OTP.destroy({ where: { userId: user.id } });

    // Send mail
    let message = emailTemplates.phoneNumberUpdated(user);
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Phone Number Updated`,
        message
      );
    } catch (emailError) {
      logger.error("Error sending email:", emailError); // Log error for internal use
    }

    // Send a notification for becoming a vendor
    const title = "Phone Number Updated";
    const messageContent = `Your phone number has been successfully updated to ${newPhoneNumber}.`;
    const type = "update_phone";

    // Create the notification in the database
    const notification = await Notification.create({
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    // Send response
    res.status(200).json({ message: "Phone number updated successfully" });
  } catch (error) {
    logger.error("Error updating profile email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the email" });
  }
};

export const getUserNotificationSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  try {
    // Step 1: Retrieve the user's notification settings
    const userSettings = await UserNotificationSetting.findOne({
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
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving notification settings.",
    });
  }
};

export const updateUserNotificationSettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID
  const { hotDeals, auctionProducts, subscription } = req.body; // These values will be passed from the frontend

  // Step 1: Validate the notification settings
  if (
    typeof hotDeals !== "boolean" ||
    typeof auctionProducts !== "boolean" ||
    typeof subscription !== "boolean"
  ) {
    res.status(400).json({
      message:
        "All notification settings (hotDeals, auctionProducts, subscription) must be boolean values.",
    });
    return;
  }

  try {
    // Step 2: Check if the user already has notification settings
    const userSettings = await UserNotificationSetting.findOne({
      where: { userId },
    });

    if (userSettings) {
      // Step 3: Update notification settings
      await userSettings.update({
        hotDeals,
        auctionProducts,
        subscription,
      });

      res
        .status(200)
        .json({ message: "Notification settings updated successfully." });
    } else {
      // Step 4: If the settings don't exist (this shouldn't happen since they are created on signup), create them
      await UserNotificationSetting.create({
        userId,
        hotDeals,
        auctionProducts,
        subscription,
      });

      res
        .status(200)
        .json({ message: "Notification settings created successfully." });
    }
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      message: error.message || "Error updating notification settings.",
    });
  }
};

export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  if (!userId) {
    res
      .status(400)
      .json({ message: "User ID is required and user must be authenticated" });
    return;
  }

  try {
    // Fetch all conversations where the user is either the sender or the receiver
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        {
          model: User,
          as: "senderUser", // Assuming senderId references the User model
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Modify attributes as needed
        },
        {
          model: User,
          as: "receiverUser", // Assuming receiverId references the User model
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Modify attributes as needed
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"], // Modify attributes as needed
        },
        {
          model: Message,
          as: "message",
          limit: 1, // Limit to 1 message to get the last one
          order: [["createdAt", "DESC"]], // Order by createdAt in descending order to get the latest message
          attributes: ["id", "content", "fileUrl", "createdAt", "isRead"], // Modify attributes as needed
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`
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
  } catch (error: any) {
    logger.error("Error fetching conversations:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getAllConversationMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  try {
    const { conversationId } = req.query;

    // Validate that conversationId is provided
    if (!conversationId) {
      res.status(400).json({ message: "Conversation ID is required." });
      return;
    }

    // Fetch the conversation with related messages, users, and product
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
      include: [
        {
          model: Message,
          as: "message", // Ensure this matches your Sequelize model alias
          include: [
            {
              model: User,
              as: "user", // Alias for sender relationship
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price"],
        },
      ],
      order: [[{ model: Message, as: "message" }, "createdAt", "ASC"]], // Order messages by creation date
    });

    if (!conversation) {
      res
        .status(404)
        .json({ message: "No conversation found with the given ID." });
      return;
    }

    // Mark messages not sent by the user as read
    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId,
          userId: { [Op.ne]: userId }, // Not equal to userId
          isRead: false, // Only update unread messages
        },
      }
    );

    res.status(200).json({ data: conversation });
  } catch (error: any) {
    logger.error("Error fetching conversation messages:", error);
    res.status(500).json({
      message: "An error occurred while retrieving conversation messages.",
      error: error.message,
    });
  }
};

export const sendMessageHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

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
    const product = await Product.findByPk(productId);

    // Check if the product exists
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const user = await User.findByPk(receiverId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Find an existing conversation between sender and receiver or create a new one
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        senderId: userId,
        receiverId,
        productId,
      });
    }

    // Call the sendMessage function to save the message
    const message = await saveMessage(
      conversation.id,
      userId,
      content,
      fileUrl
    );

    if (!message) {
      res.status(500).json({ message: "Failed to send message" });
      return;
    }

    res
      .status(200)
      .json({ message: "Message sent successfully", data: message });
  } catch (error) {
    logger.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const saveMessage = async (
  conversationId: string,
  userId: string,
  content: string,
  fileUrl: string
): Promise<Message | null> => {
  try {
    // Save message to the database
    const message = await Message.create({
      conversationId,
      userId,
      content,
      fileUrl,
    });

    // Return the created message
    return message;
  } catch (error) {
    logger.error("Error creating message:", error);
    return null; // Return null or throw a custom error based on your needs
  }
};

export const deleteMessageHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  // Ensure userId is defined
  if (!userId) {
    res.status(400).json({
      message: "Sender ID is required and user must be authenticated",
    });
    return;
  }

  const messageId = req.query.messageId as string; // Get the message ID from the URL

  try {
    // Find the message by its ID
    const message = await Message.findByPk(messageId);

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
    await message.destroy();

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    logger.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsReadHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  // Ensure userId is defined
  if (!userId) {
    res.status(400).json({ message: "User must be authenticated" });
    return;
  }

  const messageId = req.query.messageId as string; // Get the message ID from the URL

  try {
    // Find the message by its ID
    const message = await Message.findByPk(messageId);

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
    await message.save();

    res.status(200).json({ message: "Message marked as read", data: message });
  } catch (error) {
    logger.error("Error marking message as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cart
export const addItemToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  if (!userId) {
    res.status(400).json({ message: "User must be authenticated" });
    return;
  }

  const { productId, quantity } = req.body;

  try {
    // Find the product by productId and include vendor and currency details
    const product = await Product.findByPk(productId, {
      attributes: ["vendorId"],
      include: [
        {
          model: Store,
          as: "store",
          include: [
            {
              model: Currency,
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

    const { vendorId } = product;
    const productCurrency = product.store.currency;

    // Find the vendor by vendorId and check if isVerified is true
    const vendor = await User.findByPk(vendorId);

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    if (!vendor.isVerified) {
      res.status(400).json({
        message: "Cannot add item to cart. Vendor is not verified.",
      });
      return;
    }

    // Check if the user has an existing cart
    const existingCartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            {
              model: Store,
              as: "store",
              include: [
                {
                  model: Currency,
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
      if (
        existingCurrency.name !== productCurrency.name ||
        existingCurrency.symbol !== productCurrency.symbol
      ) {
        // Clear the cart if the currency doesn't match
        await Cart.destroy({ where: { userId } });
      }
    }
    
    // Check if the product is already in the user's cart
    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      // If the item is already in the cart, update its quantity
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      const title = "Product Added to Cart";
      const message = `You have successfully added "${product.name}" to your cart.`;
      const type = "add_to_cart";

      // Create the notification in the database
      const notification = await Notification.create({
        userId,
        title,
        message,
        type,
      });

      // Add a new item to the cart
      await Cart.create({ userId, productId, quantity });
    }

    res.status(200).json({ message: "Item added to cart successfully." });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ message: error.message || "Error adding item to cart." });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cartId, quantity } = req.body;

  try {
    const cartItem = await Cart.findByPk(cartId);

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found." });
      return;
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cart item updated successfully." });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ message: error.message || "Error updating cart item." });
  }
}

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  // Ensure userId is defined
  if (!userId) {
    res.status(400).json({ message: "User must be authenticated" });
    return;
  }

  const { cartId } = req.query;

  try {
    const cartItem = await Cart.findOne({
      where: { userId, id: cartId },
    });

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found." });
      return;
    }

    await cartItem.destroy();

    res.status(200).json({ message: "Cart item removed successfully." });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ message: error.message || "Error removing cart item." });
  }
}

export const getCartContents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  try {
    const cartItems = await Cart.findAll({ 
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Product,
          as: "product",
          include: [
            {
              model: Store,
              as: "store",
              attributes: ["name"],
              include: [
                {
                  model: Currency,
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
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ message: error.message || "Error fetching cart contents." });
  }
}

export const clearCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  try {
    await Cart.destroy({ where: { userId } });

    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ message: error.message || "Error clearing cart." });
  }

}

export const getActivePaymentGateway = async (req: Request, res: Response): Promise<void> => {
  try {
    // Query for an active payment gateway
    const paymentGateway = await PaymentGateway.findOne({
      where: { isActive: true }, // Assumes 'status' is a field in your model
    });

    if (!paymentGateway) {
      res.status(404).json({ message: "No active payment gateway found" });
      return;
    }

    res.status(200).json({
      message: "Active payment gateway fetched successfully",
      data: paymentGateway,
    });
  } catch (error: any) {
    logger.error("Error fetching active payment gateway:", error);
    res.status(500).json({
      message: "An error occurred while fetching the active payment gateway",
    });
  }
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get authenticated user ID
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

  const transaction = await sequelizeService.connection!.transaction();

  try {
    // Fetch active Paystack secret key from PaymentGateway model
    const paymentGateway = await PaymentGateway.findOne({
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
    const verificationResponse = await verifyPayment(refId, PAYSTACK_SECRET_KEY);

    if (verificationResponse.status !== "success") {
      res.status(400).json({ message: "Payment verification failed." });
      return;
    }

    const paymentData = verificationResponse;

    // Fetch user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Fetch cart items
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
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
    const order = await Order.create(
      {
        userId,
        totalAmount,
        refId,
        shippingAddress,
        status: "pending",
      },
      { transaction }
    );

    // Create order items and update product inventory
    for (const cartItem of cartItems) {
      // Ensure cartItem.product is defined
      if (!cartItem.product) {
        throw new Error(`Product information is missing for cart item with ID ${cartItem.id}`);
      }

      const product = await Product.findByPk(cartItem.product.id);

      if (!product) {
        throw new Error(`Product with ID ${cartItem.product.id} not found.`);
      }

      await OrderItem.create(
        {
          orderId: order.id,
          product: cartItem.product, // Store the product as a JSON object
          quantity: cartItem.quantity,
          price: product.price,
        },
        { transaction }
      );

      // Update product inventory
      // await product.update(
      //   { quantity: product.quantity - cartItem.quantity },
      //   { transaction }
      // );
    }

     // Create payment record
     const payment = await Payment.create(
      {
        orderId: order.id,
        refId,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        status: paymentData.status,
        channel: paymentData.channel,
        paymentDate: paymentData.transaction_date,
      },
      { transaction }
    );


    // Clear user's cart
    await Cart.destroy({ where: { userId }, transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: "Checkout successful"
    });
  } catch (error: any) {
    await transaction.rollback();
    logger.error("Error during checkout:", error);
    res.status(500).json({ message: error.message || "Checkout failed" });
  }
};

// Bid
export const showInterest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { auctionProductId, amountPaid } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

    // Fetch the auction product
    const auctionProduct = await AuctionProduct.findOne({
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
    const existingInterest = await ShowInterest.findOne({
      where: { userId, auctionProductId },
    });

    if (existingInterest) {
      res.status(400).json({ message: "You have already shown interest in this auction." });
      return;
    }

    // Create a new interest record
    const newInterest = await ShowInterest.create({
      userId,
      auctionProductId,
      amountPaid,
      status: "confirmed",
    });

    // Fetch the user based on userId
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      logger.warn(`User with ID ${userId} not found. Email notification skipped.`);
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Notify user via email
    if (user.email) {
      const message = emailTemplates.interestNotification(
        user,
        amountPaid,
        auctionProduct,
      );
      try {
        await sendMail(
          user.email,
          `${process.env.APP_NAME} - Interest Confirmation`,
          message
        );
      } catch (emailError) {
        logger.error("Error sending email notification:", emailError);
      }
    } else {
      logger.warn(`User with ID ${userId} has no email. Notification skipped.`);
    }
    
    res.status(200).json({
      message: "Interest recorded successfully. Please wait for confirmation.",
      data: newInterest,
    });
  } catch (error: any) {
    logger.error("Error showing interest:", error);
    res.status(500).json({ message: error.message || "An error occurred while recording your interest." });
  }
};

export const placeBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { auctionProductId, bidAmount } = req.body;
    const bidderId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    // Fetch the auction product
    const auctionProduct = await AuctionProduct.findOne({
      where: {
        id: auctionProductId,
        auctionStatus: "ongoing",
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Bid,
          as: "bids",
          include: [
            {
              model: User,
              as: "user",
            },
          ],
        },
      ],
      order: [[{ model: Bid, as: "bids" }, "bidAmount", "DESC"]], // Ordering the bids by amount descending
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
    const highestBid = auctionProduct?.bids?.[0];

    // Determine minimum acceptable bid
    const highestBidAmount = highestBid ? Number(highestBid.bidAmount) : 0;
    const bidIncrement = auctionProduct.bidIncrement ? Number(auctionProduct.bidIncrement) : 0;
    const startingPrice = auctionProduct.price ? Number(auctionProduct.price) : 0;

    // Determine minimum acceptable bid
    const minAcceptableBid = highestBid
        ? highestBidAmount + bidIncrement
        : startingPrice;

    if (isNaN(minAcceptableBid)) {
      logger.error("Invalid minimum acceptable bid calculation.");
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
      const previousBidders = auctionProduct.bids.filter(
        (bid) => bid.bidderId !== bidderId && bid.user // Exclude current bidder and ensure user exists
      );
    
      for (const previousBid of previousBidders) {
        if (previousBid.user) { // Ensure user is not undefined
          try {
            // Generate outbid notification message
            const message = emailTemplates.outBidNotification(previousBid, auctionProduct);
    
            // Send notification email
            await sendMail(
              previousBid.user.email,
              `${process.env.APP_NAME} - Outbid Notification`,
              message
            );
          } catch (emailError) {
            logger.error(`Error sending email to ${previousBid.user.email}:`, emailError);
          }
        }
      }
    }
    
    // Find an existing bid by the current bidder
    const existingBid = await Bid.findOne({
      where: { auctionProductId, bidderId },
    });

    if (existingBid) {
      // Update the existing bid amount and increment bidCount
      existingBid.bidAmount = bidAmount;
      existingBid.isWinningBid = true;
      existingBid.bidCount = Number(existingBid.bidCount || 0) + 1; // Increment bid count
      await existingBid.save();

      // Update previous highest bid status
      if (highestBid && highestBid.bidderId !== bidderId) {
        highestBid.isWinningBid = false;
        await highestBid.save();
      }

      // Real-time bid update via WebSocket
      io.to(auctionProductId).emit("newBid", {
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
    const newBid = await Bid.create({
      auctionProductId,
      bidderId,
      bidAmount,
      bidCount: 1, // Initialize bid count for new bids
    });

    // Update previous highest bid status
    if (highestBid) {
      highestBid.isWinningBid = false;
      await highestBid.save();
    }

    // Mark new bid as the winning bid
    newBid.isWinningBid = true;
    await newBid.save();

    // Real-time bid update via WebSocket
    io.to(auctionProductId).emit("newBid", {
      auctionProductId,
      bidAmount: newBid.bidAmount,
      bidderId: newBid.bidderId,
    });

    res.status(200).json({
      message: "Bid placed successfully.",
      data: newBid,
    });
  } catch (error: any) {
    logger.error("Error placing bid:", error);
    res.status(500).json({
      message: "An error occurred while placing your bid.",
    });
  }
};

export const becomeVendor = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(400).json({ message: "User must be authenticated" });
    return;
  }

  const transaction = await sequelizeService.connection!.transaction();

  try {
    // Fetch the user
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      await transaction.rollback();
      return;
    }

    // Check if the user is already a vendor
    if (user.accountType === "Vendor") {
      res.status(400).json({ message: "User is already a vendor" });
      await transaction.rollback();
      return;
    }

    // Check if the user is eligible to become a vendor
    if (user.accountType !== "Customer") {
      res.status(400).json({ message: "Account type cannot be changed to vendor" });
      await transaction.rollback();
      return;
    }

    // Update the accountType to vendor
    user.accountType = "Vendor";
    await user.save({ transaction });

    // Find the free subscription plan
    const freePlan = await SubscriptionPlan.findOne({
      where: { name: "Free Plan" },
      transaction,
    });

    if (!freePlan) {
      res.status(400).json({ message: "Free plan not found. Please contact support." });
      await transaction.rollback();
      return;
    }

    // Assign the free plan to the new user
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + freePlan.duration);

    await VendorSubscription.create(
      {
        vendorId: user.id,
        subscriptionPlanId: freePlan.id,
        startDate,
        endDate,
        isActive: true,
      },
      { transaction }
    );

    // Send a notification for becoming a vendor
    const title = "Welcome, Vendor!";
    const message = "Congratulations! You are now a vendor. Start setting up your store and manage your products.";
    const type = "vendor";

    await Notification.create(
      {
        userId: user.id,
        title,
        message,
        type,
      },
      { transaction }
    );

    await transaction.commit(); // Commit transaction
    res.status(200).json({ message: "Account successfully upgraded to vendor" });
  } catch (error) {
    await transaction.rollback(); // Rollback transaction on error
    logger.error("Error upgrading account to vendor:", error);
    res.status(500).json({ message: "Failed to update account type" });
  }
};

export const getUserNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
      res.status(400).json({ message: "User must be authenticated" });
      return;
  }

  const { isRead, limit = 10, page = 1 } = req.query; // Query params

  try {
      // Build the query conditions
      const where: any = { userId };

      if (isRead !== undefined) {
          where.isRead = isRead === 'true';
      }

      // Calculate offset for pagination
      const paginationLimit = parseInt(limit as string, 10);
      const paginationPage = parseInt(page as string, 10);
      const offset = (paginationPage - 1) * paginationLimit;

      // Fetch notifications with filters, pagination, and sorting
      const { rows: notifications, count: total } = await Notification.findAndCountAll({
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
  } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

export const userMarkNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
  const notificationId = req.query.notificationId as string; // Notification ID passed in the request body

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
      const notification = await Notification.findOne({
          where: { id: notificationId, userId },
      });

      if (!notification) {
          res.status(404).json({ message: "Notification not found or does not belong to the user" });
          return;
      }

      // Update the `readAt` field to mark it as read
      notification.isRead = true;
      await notification.save();

      res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
      logger.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
  }
};
