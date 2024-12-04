// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { Op, Sequelize } from "sequelize";
import { generateOTP, sendSMS } from "../utils/helpers";
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

// Bid
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
    const minAcceptableBid = highestBid
      ? Number(highestBid.bidAmount) + (auctionProduct.bidIncrement || 0)
      : auctionProduct.price;

    if (bidAmount < minAcceptableBid) {
      res.status(400).json({
        message: `Bid amount must be at least ${minAcceptableBid.toFixed(2)}.`,
      });
      return;
    }

    // Check if the bidder has exceeded max number of bids
    const userBidCount = await Bid.count({
      where: { auctionProductId, bidderId },
    });

    if (
      auctionProduct.maxBidsPerUser &&
      userBidCount >= auctionProduct.maxBidsPerUser
    ) {
      res.status(400).json({
        message:
          "You have reached the maximum number of bids allowed for this auction.",
      });
      return;
    }

    // Notify previous highest bidder
    if (highestBid && highestBid.user) {
      // Send mail
      let message = emailTemplates.outBidNotification(highestBid, auctionProduct);
      try {
        await sendMail(
          highestBid.user.email,
          `${process.env.APP_NAME} - Outbid Notification`,
          message
        );
      } catch (emailError) {
        logger.error("Error sending email:", emailError); // Log error for internal use
      }
    }

    // Create the new bid
    const newBid = await Bid.create({
      auctionProductId,
      bidderId,
      bidAmount,
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
