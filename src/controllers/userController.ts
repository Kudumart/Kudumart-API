// src/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { Op, Sequelize } from 'sequelize';
import { generateOTP, verifyPayment, sendSMS } from '../utils/helpers';
import { sendMail } from '../services/mail.service';
import { emailTemplates } from '../utils/messages';
import JwtService from '../services/jwt.service';
import logger from '../middlewares/logger'; // Adjust the path to your logger.js
import { capitalizeFirstLetter, hasPurchasedProduct } from '../utils/helpers';
import OTP from '../models/otp';
import { AuthenticatedRequest, ProductData } from '../types/index';
import UserNotificationSetting from '../models/usernotificationsetting';
import Message from '../models/message';
import Product from '../models/product';
import Conversation from '../models/conversation';
import AuctionProduct from '../models/auctionproduct';
import Bid from '../models/bid';
import { io } from '../index';
import Cart from '../models/cart';
import ShowInterest from '../models/showinterest';
import PaymentGateway from '../models/paymentgateway';
import sequelizeService from '../services/sequelize.service';
import Order from '../models/order';
import OrderItem from '../models/orderitem';
import Payment from '../models/payment';
import Store from '../models/store';
import Currency from '../models/currency';
import Notification from '../models/notification';
import SubscriptionPlan from '../models/subscriptionplan';
import VendorSubscription from '../models/vendorsubscription';
import SubCategory from '../models/subcategory';
import Admin from '../models/admin';
import SaveProduct from '../models/saveproduct';
import ReviewProduct from '../models/reviewproduct';
import crypto from 'crypto';
import ProductReport from '../models/productreport';
import BlockedVendor from '../models/blockedvendor';
import KYC from '../models/kyc';
import BlockedProduct from '../models/blockedproduct';

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the token from the request
    const token = JwtService.jwtGetToken(req);

    if (!token) {
      res.status(400).json({
        message: 'Token not provided',
      });
      return;
    }

    // Blacklist the token to prevent further usage
    await JwtService.jwtBlacklistToken(token);

    res.status(200).json({
      message: 'Logged out successfully.',
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: 'Server error during logout.',
    });
  }
};

export const profile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id; // Assuming the user ID is passed in the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      message: 'Profile retrieved successfully.',
      data: user,
    });
  } catch (error: any) {
    logger.error('Error retrieving user profile:', error);

    res.status(500).json({
      message: 'Server error during retrieving profile.',
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, location } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Assuming the user ID is passed in the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
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
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error: any) {
    logger.error('Error updating user profile:', error);

    res.status(500).json({
      message: 'Server error during profile update.',
    });
  }
};

export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
    const { photo } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Assuming the user ID is passed in the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Update user profile photo
    user.photo = photo || user.photo;

    await user.save();

    res.status(200).json({
      message: 'Profile photo updated successfully.',
      data: user,
    });
  } catch (error: any) {
    logger.error('Error updating user profile photo:', error);

    res.status(500).json({
      message: 'Server error during profile photo update.',
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
    const user = await User.scope('auth').findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Check if the old password is correct
    const isMatch = await user.checkPassword(oldPassword);
    if (!isMatch) {
      res.status(400).json({ message: 'Old password is incorrect.' });
      return;
    }

    // Update the password
    user.password = newPassword; // Hash the new password before saving
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
      logger.error('Error sending email:', emailError); // Log error for internal use
    }

    // Send reset password notification
    const title = 'Password Reset Request';
    const messageContent =
      "A password reset request was initiated for your account. If this wasn't you, please contact support.";
    const type = 'reset_password';

    // Create the notification in the database
    const notification = await Notification.create({
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    res.status(200).json({
      message: 'Password updated successfully.',
    });
  } catch (error) {
    logger.error(error);

    res.status(500).json({
      message: 'Server error during password update.',
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
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the new email already exists for another user
    const existingUser = await User.findOne({ where: { email: newEmail } });

    if (existingUser) {
      res
        .status(400)
        .json({ message: 'Email is already in use by another account' });
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
      logger.error('Error sending email:', emailError); // Log error for internal use
    }

    // Send response
    res.status(200).json({
      message: 'New email verification code sent successfully',
      data: newEmail,
    });
  } catch (error) {
    logger.error('Error updating profile email:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the email' });
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
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the new email already exists for another user
    const existingUser = await User.findOne({ where: { email: newEmail } });

    if (existingUser) {
      res
        .status(400)
        .json({ message: 'Email is already in use by another account' });
      return;
    }

    // Check for the OTP
    const otpRecord = await OTP.findOne({
      where: { userId: user.id, otpCode },
    });
    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid OTP code.' });
      return;
    }

    // Check if the OTP has expired
    if (!otpRecord.expiresAt || new Date() > otpRecord.expiresAt) {
      res.status(400).json({ message: 'OTP has expired.' });
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
      logger.error('Error sending email:', emailError); // Log error for internal use
    }

    // Send a notification for becoming a vendor
    const title = 'Email Address Updated';
    const messageContent = `Your email address has been successfully updated to ${newEmail}.`;
    const type = 'update_email';

    // Create the notification in the database
    const notification = await Notification.create({
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    // Send response
    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    logger.error('Error updating profile email:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the email' });
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
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the new phone number already exists for another user
    const existingUser = await User.findOne({
      where: { phoneNumber: newPhoneNumber },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ message: 'Phone number is already in use by another account' });
      return;
    }

    // Update the user's phone number
    user.phoneNumber = newPhoneNumber;
    await user.save();

    // Send mail
    let message = emailTemplates.phoneNumberUpdated(user);
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Phone Number Updated`,
        message
      );
    } catch (emailError) {
      logger.error('Error sending email:', emailError); // Log error for internal use
    }

    // Send a notification for becoming a vendor
    const title = 'Phone Number Updated';
    const messageContent = `Your phone number has been successfully updated to ${newPhoneNumber}.`;
    const type = 'update_phone';

    // Create the notification in the database
    const notification = await Notification.create({
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    // Send response
    res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
    logger.error('Error updating phone number:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the phone number' });
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
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if the new phone number already exists for another user
    const existingUser = await User.findOne({
      where: { phoneNumber: newPhoneNumber },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ message: 'Phone number is already in use by another account' });
      return;
    }

    // Check for the OTP
    const otpRecord = await OTP.findOne({
      where: { userId: user.id, otpCode },
    });
    if (!otpRecord) {
      res.status(400).json({ message: 'Invalid OTP code.' });
      return;
    }

    // Check if the OTP has expired
    if (!otpRecord.expiresAt || new Date() > otpRecord.expiresAt) {
      res.status(400).json({ message: 'OTP has expired.' });
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
      logger.error('Error sending email:', emailError); // Log error for internal use
    }

    // Send a notification for becoming a vendor
    const title = 'Phone Number Updated';
    const messageContent = `Your phone number has been successfully updated to ${newPhoneNumber}.`;
    const type = 'update_phone';

    // Create the notification in the database
    const notification = await Notification.create({
      userId: user.id,
      title,
      message: messageContent,
      type,
    });

    // Send response
    res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
    logger.error('Error updating profile email:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the email' });
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
      attributes: ['hotDeals', 'auctionProducts', 'subscription'], // Include only relevant fields
    });

    // Step 2: Check if settings exist
    if (!userSettings) {
      res.status(404).json({
        message: 'Notification settings not found for the user.',
      });
      return;
    }

    // Step 3: Send the settings as a response
    res.status(200).json({
      message: 'Notification settings retrieved successfully.',
      settings: userSettings,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving notification settings.',
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
    typeof hotDeals !== 'boolean' ||
    typeof auctionProducts !== 'boolean' ||
    typeof subscription !== 'boolean'
  ) {
    res.status(400).json({
      message:
        'All notification settings (hotDeals, auctionProducts, subscription) must be boolean values.',
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
        .json({ message: 'Notification settings updated successfully.' });
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
        .json({ message: 'Notification settings created successfully.' });
    }
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({
      message: error.message || 'Error updating notification settings.',
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
      .json({ message: 'User ID is required and user must be authenticated' });
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
          as: 'senderUser', // Assuming senderId references the User model
          attributes: [
            'id',
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'photo',
          ], // Modify attributes as needed
        },
        {
          model: User,
          as: 'receiverUser', // Assuming receiverId references the User model
          attributes: [
            'id',
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'photo',
          ], // Modify attributes as needed
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name'], // Modify attributes as needed
        },
        {
          model: Message,
          as: 'message',
          limit: 1, // Limit to 1 message to get the last one
          order: [['createdAt', 'DESC']], // Order by createdAt in descending order to get the latest message
          attributes: ['id', 'content', 'fileUrl', 'createdAt', 'isRead'], // Modify attributes as needed
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
            'unreadMessagesCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Conversations fetched successfully',
      data: conversations,
    });
  } catch (error: any) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
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
      res.status(400).json({ message: 'Conversation ID is required.' });
      return;
    }

    // Fetch the conversation with related messages, users, and product
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
      include: [
        {
          model: Message,
          as: 'message', // Ensure this matches your Sequelize model alias
          include: [
            {
              model: User,
              as: 'user', // Alias for sender relationship
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price'],
        },
      ],
      order: [[{ model: Message, as: 'message' }, 'createdAt', 'ASC']], // Order messages by creation date
    });

    if (!conversation) {
      res
        .status(404)
        .json({ message: 'No conversation found with the given ID.' });
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
    logger.error('Error fetching conversation messages:', error);
    res.status(500).json({
      message: 'An error occurred while retrieving conversation messages.',
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
      message: 'Sender ID is required and user must be authenticated',
    });
    return;
  }

  const { productId, receiverId, content, fileUrl } = req.body;

  // Prevent user from sending a message to themselves
  if (userId === receiverId) {
    res.status(400).json({ message: 'You cannot send a message to yourself' });
    return;
  }

  // Block check: if receiver is a vendor and sender has blocked them
  const receiver = await User.findByPk(receiverId);
  if (receiver && receiver.accountType === 'Vendor') {
    const blocked = await BlockedVendor.findOne({
      where: { userId, vendorId: receiverId },
    });
    if (blocked) {
      res.status(403).json({ message: 'You have blocked this vendor.' });
      return;
    }
  }

  try {
    // Find the product by its ID
    const product = await Product.findByPk(productId);

    // Check if the product exists
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const user = await User.findByPk(receiverId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Find an existing conversation between sender and receiver or create a new one
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
        productId,
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
      res.status(500).json({ message: 'Failed to send message' });
      return;
    }

    res
      .status(200)
      .json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    logger.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    logger.error('Error creating message:', error);
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
      message: 'Sender ID is required and user must be authenticated',
    });
    return;
  }

  const messageId = req.query.messageId as string; // Get the message ID from the URL

  try {
    // Find the message by its ID
    const message = await Message.findByPk(messageId);

    // Check if the message exists
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Ensure the message was sent by the authenticated user
    if (message.userId !== userId) {
      res
        .status(403)
        .json({ message: 'You can only delete your own messages' });
      return;
    }

    // Delete the message
    await message.destroy();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    logger.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsReadHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  // Ensure userId is defined
  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  const messageId = req.query.messageId as string; // Get the message ID from the URL

  try {
    // Find the message by its ID
    const message = await Message.findByPk(messageId);

    // Check if the message exists
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    // Ensure the message is for the authenticated user (i.e., the receiver)
    if (message.userId === userId) {
      res
        .status(403)
        .json({ message: 'You can only mark your received messages as read' });
      return;
    }

    // Mark the message as read
    message.isRead = true;
    await message.save();

    res.status(200).json({ message: 'Message marked as read', data: message });
  } catch (error) {
    logger.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cart
export const addItemToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  const { productId, quantity } = req.body;

  try {
    // Find the product by productId and include vendor and currency details
    const product = await Product.findByPk(productId, {
      attributes: ['vendorId', 'name', 'quantity'], // Include quantity in the attributes
      include: [
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Currency,
              as: 'currency',
              attributes: ['name', 'symbol'],
            },
          ],
        },
      ],
    });

    if (!product || !product.store || !product.store.currency) {
      res
        .status(404)
        .json({ message: 'Product not found or invalid currency data' });
      return;
    }

    const { vendorId, name, quantity: availableQuantity = 0 } = product; // Get available quantity
    const productCurrency = product.store.currency;

    // Ensure product currency is either $, #, or ₦
    const allowedCurrencies = ['$', '#', '₦'];
    if (!allowedCurrencies.includes(productCurrency.symbol)) {
      res.status(400).json({
        message: `Only products with currencies ${allowedCurrencies.join(
          ', '
        )} are allowed.`,
      });
      return;
    }

    // Check if vendorId exists in the User table (Vendor)
    const vendor = await User.findByPk(vendorId);

    // Check if vendorId exists in the Admin table
    const admin = await Admin.findByPk(vendorId);

    if (!vendor && !admin) {
      res.status(404).json({ message: 'Owner not found' });
      return;
    }

    // If it's a vendor, ensure they are verified
    if (vendor && !vendor.isVerified) {
      res.status(400).json({
        message: 'Cannot add item to cart. Vendor is not verified.',
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
    const existingCartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Store,
              as: 'store',
              include: [
                {
                  model: Currency,
                  as: 'currency',
                  attributes: ['name', 'symbol'],
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

      if (
        !existingProduct ||
        !existingProduct.store ||
        !existingProduct.store.currency
      ) {
        throw new Error(
          'Cart contains invalid product or currency information.'
        );
      }

      const existingCurrency = existingProduct.store.currency;

      // Check if the currency matches
      if (
        existingCurrency.name !== productCurrency.name ||
        existingCurrency.symbol !== productCurrency.symbol
      ) {
        res.status(400).json({
          message: `Your cart contains products in ${existingCurrency.name}. Please clear your cart before adding items in ${productCurrency.name}.`,
        });
        return;
      }
    }

    // Check if the product is already in the user's cart
    const existingCartItem = await Cart.findOne({
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
      await existingCartItem.save();
    } else {
      const title = 'Product Added to Cart';
      const message = `You have successfully added "${product.name}" to your cart.`;
      const type = 'add_to_cart';

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

    res.status(200).json({ message: 'Item added to cart successfully.' });
  } catch (error: any) {
    logger.error(error);
    res
      .status(500)
      .json({ message: error.message || 'Error adding item to cart.' });
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cartId, quantity } = req.body;

  try {
    // Find the cart item by cartId
    const cartItem = await Cart.findByPk(cartId, {
      include: [
        {
          model: Product, // Assuming you have a 'Product' model associated with 'Cart'
          as: 'product', // Alias used in the association
          include: [
            {
              model: Store,
              as: 'store', // Store model that has the 'currency'
              include: [
                {
                  model: Currency,
                  as: 'currency', // Currency associated with the store
                  attributes: ['name', 'symbol'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cartItem || !cartItem.product || !cartItem.product.quantity) {
      res.status(404).json({ message: 'Cart item or product not found.' });
      return;
    }

    const { productId, product } = cartItem;
    const availableQuantity = product.quantity ?? 0; // Use 0 if quantity is undefined

    // Ensure the requested quantity doesn't exceed available quantity
    if (quantity > availableQuantity) {
      res.status(400).json({
        message: `Sorry, only ${availableQuantity} of this product is available. Please reduce the quantity.`,
      });
      return;
    }

    // Update the cart item quantity if stock is sufficient
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: 'Cart item updated successfully.' });
  } catch (error: any) {
    logger.error(error);
    res
      .status(500)
      .json({ message: error.message || 'Error updating cart item.' });
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  // Ensure userId is defined
  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  const { cartId } = req.query;

  try {
    const cartItem = await Cart.findOne({
      where: { userId, id: cartId },
    });

    if (!cartItem) {
      res.status(404).json({ message: 'Cart item not found.' });
      return;
    }

    await cartItem.destroy();

    res.status(200).json({ message: 'Cart item removed successfully.' });
  } catch (error: any) {
    logger.error(error);
    res
      .status(500)
      .json({ message: error.message || 'Error removing cart item.' });
  }
};

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
          as: 'user',
        },
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Store,
              as: 'store',
              attributes: ['name'],
              include: [
                {
                  model: Currency,
                  as: 'currency',
                  attributes: ['name', 'symbol'],
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
    res
      .status(500)
      .json({ message: error.message || 'Error fetching cart contents.' });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

  try {
    await Cart.destroy({ where: { userId } });

    res.status(200).json({ message: 'Cart cleared successfully.' });
  } catch (error: any) {
    logger.error(error);
    res.status(500).json({ message: error.message || 'Error clearing cart.' });
  }
};

export const getActivePaymentGateways = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Query for active payment gateways (only Paystack and Stripe)
    const paymentGateways = await PaymentGateway.findAll({
      where: {
        isActive: true,
        name: ['paystack', 'stripe'], // Assuming 'name' is the field for gateway names
      },
    });

    if (!paymentGateways.length) {
      res.status(404).json({ message: 'No active payment gateways found' });
      return;
    }

    res.status(200).json({
      message: 'Active payment gateways fetched successfully',
      data: paymentGateways,
    });
  } catch (error: any) {
    logger.error('Error fetching active payment gateways:', error);
    res.status(500).json({
      message: 'An error occurred while fetching the active payment gateways',
    });
  }
};

export const checkout = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Get authenticated user ID
  const { refId, shippingAddress } = req.body;

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  // if (!refId) {
  //   res.status(400).json({ message: 'Payment reference ID is required' });
  //   return;
  // }

  if (!shippingAddress) {
    res.status(400).json({ message: 'Shipping address is required' });
    return;
  }

  const transaction = await sequelizeService.connection!.transaction();
  let transactionCommitted = false;

  try {
    // Fetch active Paystack secret key from PaymentGateway model
    const paymentGateway = await PaymentGateway.findOne({
      where: {
        name: 'Paystack',
        isActive: true,
      },
    });

    if (!paymentGateway || !paymentGateway.secretKey) {
      throw new Error('Active Paystack gateway not configured');
    }

    const PAYSTACK_SECRET_KEY = paymentGateway.secretKey;

    // Verify payment reference with Paystack
    const verificationResponse = await verifyPayment(
      refId,
      PAYSTACK_SECRET_KEY
    );

    if (verificationResponse.status !== 'success') {
      res.status(400).json({ message: 'Payment verification failed.' });
      return;
    }

    const paymentData = verificationResponse;

    // Fetch cart items
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'vendorId', 'quantity', 'sku'],
        },
      ],
    });

    if (!cartItems || cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty' });
      return;
    }

    // Calculate total price and validate inventory
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      const product = cartItem.product;
      if (!product) {
        throw new Error(`Product with ID ${cartItem.productId} not found`);
      }

      // Check if product.quantity is defined and if there's enough stock before proceeding
      const availableQuantity = product.quantity ?? 0; // If quantity is undefined, fallback to 0
      if (availableQuantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      totalAmount += product.price * cartItem.quantity;
    }

    // Validate that the total amount matches the Paystack transaction amount
    // if (paymentData.amount / 100 !== totalAmount) {
    //   throw new Error("Payment amount does not match cart total");
    // }

    // Create order
    const order = await Order.create(
      {
        userId,
        totalAmount,
        refId,
        shippingAddress,
        status: 'pending',
      },
      { transaction }
    );

    // Create order items and update product inventory
    for (const cartItem of cartItems) {
      // Ensure cartItem.product is defined
      if (!cartItem.product) {
        throw new Error(
          `Product information is missing for cart item with ID ${cartItem.id}`
        );
      }

      const product = await Product.findByPk(cartItem.product.id, {
        include: [
          {
            model: Store,
            as: 'store',
            attributes: ['name'],
            include: [
              {
                model: Currency,
                as: 'currency',
                attributes: ['name', 'symbol'],
              },
            ],
          },
          {
            model: SubCategory,
            as: 'sub_category',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!product) {
        throw new Error(`Product with ID ${cartItem.product.id} not found.`);
      }

      // Reduce product quantity in inventory
      const availableQuantity = product.quantity ?? 0; // Fallback to 0 if quantity is undefined
      if (availableQuantity >= cartItem.quantity) {
        // Update the product quantity in inventory
        await product.update(
          { quantity: availableQuantity - cartItem.quantity },
          { transaction }
        );
      } else {
        throw new Error(`Not enough stock for product: ${product.name}`);
      }

      // Check if vendorId exists in the User table (Vendor)
      const vendor = await User.findByPk(product.vendorId);
      // Check if vendorId exists in the Admin table
      const admin = await Admin.findByPk(product.vendorId);
      if (!vendor && !admin) {
        res.status(404).json({ message: 'Owner not found' });
        return;
      }

      // Create the order item
      await OrderItem.create(
        {
          vendorId: product.vendorId,
          orderId: order.id,
          product: product,
          quantity: cartItem.quantity,
          price: product.price,
        },
        { transaction }
      );

      if (vendor) {
        await Notification.create(
          {
            userId: vendor.id,
            title: 'New Order Received',
            type: 'new_order',
            message: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
          },
          { transaction }
        );

        // Fetch user before the for loop so it's available
        const user = await User.findByPk(vendor.id, { transaction });
        if (!user) {
          throw new Error(`User not found.`);
        }

        const message = emailTemplates.newOrderNotification(
          vendor,
          order,
          user,
          cartItem.product
        );

        try {
          await sendMail(
            vendor.email,
            `${process.env.APP_NAME} - New Order Received`,
            message
          );
        } catch (emailError) {
          logger.error('Error sending email:', emailError);
        }
      } else if (admin) {
        await Notification.create(
          {
            userId: admin.id,
            title: 'New Order Received',
            type: 'new_order',
            message: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed.`,
          },
          { transaction }
        );

        const message = emailTemplates.newOrderAdminNotification(admin, order);
        try {
          await sendMail(
            admin.email,
            `${process.env.APP_NAME} - New Order Received`,
            message
          );
        } catch (emailError) {
          logger.error('Error sending email:', emailError);
        }
      }
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

    const groupedVendorOrders: { [key: string]: OrderItem[] } = {};

    cartItems.forEach((cartItem) => {
      if (!cartItem.product) {
        logger.error(
          `❌ Product not found for cart item with ID ${cartItem.id}`
        );
        throw new Error(
          `Product not found for cart item with ID ${cartItem.id}`
        );
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
        status: 'pending', // Default status (if required)
        createdAt: new Date(), // Ensure timestamps if needed
      } as OrderItem);
    });

    // Clear user's cart
    await Cart.destroy({ where: { userId }, transaction });

    // Notify the Buyer
    await Notification.create(
      {
        userId,
        title: 'Order Confirmation',
        type: 'order_confirmation',
        message: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
      },
      { transaction }
    );

    // Fetch user before the for loop so it's available
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error(`User not found.`);
    }

    // Commit the transaction
    await transaction.commit();
    transactionCommitted = true; // Mark as committed

    // Send mail (outside of transaction)
    const message = emailTemplates.orderConfirmationNotification(
      user,
      order,
      groupedVendorOrders,
      '₦'
    );
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Order Confirmation`,
        message
      );
    } catch (emailError) {
      logger.error('Error sending email:', emailError);
    }

    res.status(200).json({
      message: 'Checkout successful',
    });
  } catch (error: any) {
    if (!transactionCommitted) {
      await transaction.rollback();
    }
    logger.error('Error during checkout:', error);
    res.status(500).json({ message: error.message || 'Checkout failed' });
  }
};

export const checkoutDollar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id;
  const { refId, shippingAddress } = req.body;

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  if (!refId) {
    res.status(400).json({ message: 'Payment reference ID is required' });
    return;
  }

  if (!shippingAddress) {
    res.status(400).json({ message: 'Shipping address is required' });
    return;
  }

  const transaction = await sequelizeService.connection!.transaction();
  let transactionCommitted = false;

  try {
    // Fetch cart items
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'vendorId', 'quantity'],
        },
      ],
    });

    if (!cartItems || cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty' });
      return;
    }

    // Calculate total price
    let totalAmount = 0;
    const vendorOrders: { [key: string]: OrderItem[] } = {}; // Stores vendor-specific order items

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      if (!product)
        throw new Error(`Product with ID ${cartItem.productId} not found`);

      // Check if product has enough stock
      const availableQuantity = product.quantity ?? 0; // Fallback to 0 if undefined
      if (availableQuantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const productInfo = await Product.findByPk(cartItem.productId, {
        include: [
          {
            model: Store,
            as: 'store',
            attributes: ['name'],
            include: [
              {
                model: Currency,
                as: 'currency',
                attributes: ['name', 'symbol'],
              },
            ],
          },
          {
            model: SubCategory,
            as: 'sub_category',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!productInfo) {
        throw new Error(`Product with ID ${cartItem.productId} not found.`);
      }

      // Reduce stock quantity
      const newQuantity = availableQuantity - cartItem.quantity;
      await product.update({ quantity: newQuantity }, { transaction });

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
      } as unknown as OrderItem);
    }

    // Create a single order for the buyer
    const order = await Order.create(
      {
        userId,
        totalAmount,
        refId,
        shippingAddress,
        status: 'pending',
      },
      { transaction }
    );

    // Process order items per vendor
    // Fetch user before the vendorOrders loop so it's available and not null
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error('User not found.');
    }
    for (const vendorId in vendorOrders) {
      const vendorOrderItems = vendorOrders[vendorId];
      // Loop through each order item for the current vendor
      for (const item of vendorOrderItems) {
        // Create the order item in the database
        await OrderItem.create(
          {
            vendorId: item.vendorId,
            orderId: order.id,
            product: item.product,
            quantity: item.quantity,
            price: item.price,
          },
          { transaction }
        );

        // Fetch vendor object
        const vendor = await User.findByPk(item.vendorId, { transaction });
        if (!vendor) {
          throw new Error(`Vendor not found.`);
        }
        // Fetch user (customer) object
        const user = await User.findByPk(order.userId, { transaction });
        if (!user) {
          throw new Error(`User not found.`);
        }

        // Create the email message for the current order item
        const message = emailTemplates.newOrderNotification(
          vendor,
          order,
          user,
          item.product
        );
        try {
          // Send the email to the vendor
          await sendMail(
            vendor.email,
            `${process.env.APP_NAME} - New Order Received`,
            message
          );
        } catch (emailError) {
          logger.error('Error sending email:', emailError);
        }
      }
    }

    // Save payment details
    await Payment.create(
      {
        orderId: order.id,
        refId,
        amount: totalAmount,
        currency: 'USD',
        status: 'success',
        channel: 'Stripe',
        paymentDate: new Date(),
      },
      { transaction }
    );

    // Clear cart
    await Cart.destroy({ where: { userId }, transaction });

    // **Send Notifications**

    // Notify the Buyer
    await Notification.create(
      {
        userId,
        title: 'Order Confirmation',
        type: 'order_confirmation',
        message: `Your order (TRACKING NO: ${order.trackingNumber}) has been successfully placed.`,
      },
      { transaction }
    );

    // Commit transaction before sending notifications
    await transaction.commit();
    transactionCommitted = true; // Mark as committed

    // Notify Each Vendor/Admin
    for (const vendorId in vendorOrders) {
      const vendorOrderItems = vendorOrders[vendorId]; // Get all order items for this vendor
      for (const item of vendorOrderItems) {
        // Loop through each order item for the current vendor

        const vendor = await User.findByPk(vendorId);
        const admin = await Admin.findByPk(vendorId);

        if (!vendor && !admin) {
          res.status(404).json({ message: 'Owner not found' });
          return;
        }

        if (vendor) {
          await Notification.create(
            {
              userId: vendor.id,
              title: 'New Order Received',
              type: 'new_order',
              message: `You have received a new order (TRACKING NO: ${order.trackingNumber}) for your product.`,
            },
            { transaction }
          );

          const message = emailTemplates.newOrderNotification(
            vendor,
            order,
            user,
            item.product
          );

          try {
            await sendMail(
              vendor.email,
              `${process.env.APP_NAME} - New Order Received`,
              message
            );
          } catch (emailError) {
            logger.error('Error sending email:', emailError);
          }
        } else if (admin) {
          await Notification.create(
            {
              userId: admin.id,
              title: 'New Order Received',
              type: 'new_order',
              message: `A new order (TRACKING NO: ${order.trackingNumber}) has been placed for your product.`,
            },
            { transaction }
          );

          const message = emailTemplates.newOrderAdminNotification(
            admin,
            order
          );

          try {
            await sendMail(
              admin.email,
              `${process.env.APP_NAME} - New Order Received`,
              message
            );
          } catch (emailError) {
            logger.error('Error sending email:', emailError);
          }
        }
      }
    }

    // Send mail (outside of transaction)
    const message = emailTemplates.orderConfirmationNotification(
      user,
      order,
      vendorOrders,
      '$'
    );
    try {
      await sendMail(
        user.email,
        `${process.env.APP_NAME} - Order Confirmation`,
        message
      );
    } catch (emailError) {
      logger.error('Error sending email:', emailError);
    }

    res.status(200).json({
      message: 'Checkout successful',
    });
  } catch (error: any) {
    if (!transactionCommitted) {
      await transaction.rollback();
    }
    logger.error('Error during checkout:', error);
    res.status(500).json({ message: 'Checkout failed' });
  }
};

// Bid
export const showInterest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { auctionProductId, amountPaid } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

    // Fetch the auction product
    const auctionProduct = await AuctionProduct.findOne({
      where: {
        id: auctionProductId,
        auctionStatus: 'upcoming', // Ensure auction status is "upcoming"
      },
    });

    if (!auctionProduct) {
      res
        .status(404)
        .json({ message: 'Auction product not found or is not upcoming.' });
      return;
    }

    // Validate auction date is not the start date
    if (
      auctionProduct.startDate &&
      new Date(auctionProduct.startDate).toDateString() ===
        new Date().toDateString()
    ) {
      res.status(400).json({
        message: 'You cannot show interest on the day the auction starts.',
      });
      return;
    }

    // Check if user has already shown interest
    const existingInterest = await ShowInterest.findOne({
      where: { userId, auctionProductId },
    });

    if (existingInterest) {
      res
        .status(400)
        .json({ message: 'You have already shown interest in this auction.' });
      return;
    }

    // Create a new interest record
    const newInterest = await ShowInterest.create({
      userId,
      auctionProductId,
      amountPaid,
      status: 'confirmed',
    });

    // Fetch the user based on userId
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      logger.warn(
        `User with ID ${userId} not found. Email notification skipped.`
      );
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Notify user via email
    if (user.email) {
      const message = emailTemplates.interestNotification(
        user,
        amountPaid,
        auctionProduct
      );
      try {
        await sendMail(
          user.email,
          `${process.env.APP_NAME} - Interest Confirmation`,
          message
        );
      } catch (emailError) {
        logger.error('Error sending email notification:', emailError);
      }
    } else {
      logger.warn(`User with ID ${userId} has no email. Notification skipped.`);
    }

    res.status(200).json({
      message: 'Interest recorded successfully. Please wait for confirmation.',
      data: newInterest,
    });
  } catch (error: any) {
    logger.error('Error showing interest:', error);
    res.status(500).json({
      message:
        error.message || 'An error occurred while recording your interest.',
    });
  }
};

export const getAllAuctionProductsInterest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id; // Get authenticated user ID

    if (!userId) {
      res
        .status(401)
        .json({ message: 'Unauthorized: User not authenticated.' });
      return;
    }

    // Fetch all interests for the authenticated user
    const userAuctionProductInterests = await ShowInterest.findAll({
      where: { userId }, // Filter by authenticated user ID
      include: [
        {
          model: AuctionProduct,
          as: 'auctionProduct',
          include: [
            {
              model: User,
              as: 'vendor',
            },
            {
              model: Admin,
              as: 'admin',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Store,
              as: 'store',
              attributes: ['name'],
              include: [
                {
                  model: Currency,
                  as: 'currency',
                  attributes: ['symbol'],
                },
              ],
            },
            {
              model: SubCategory,
              as: 'sub_category',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      message: 'User auction product interests retrieved successfully.',
      data: userAuctionProductInterests,
    });
  } catch (error: any) {
    logger.error('Error retrieving user auction product interests:', error);
    res.status(500).json({
      message: error.message || 'An error occurred while retrieving interests.',
    });
  }
};

export const placeBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { auctionProductId, bidAmount } = req.body;
    const bidderId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    // Check if the user has an interest in the auction product
    const existingInterest = await ShowInterest.findOne({
      where: {
        userId: bidderId,
        auctionProductId,
        status: 'confirmed',
      },
    });

    if (!existingInterest) {
      res.status(403).json({
        message: 'You must show interest in this auction before placing a bid.',
      });
      return;
    }

    // Fetch the auction product
    const auctionProduct = await AuctionProduct.findOne({
      where: {
        id: auctionProductId,
        auctionStatus: 'ongoing',
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
      order: [[{ model: Bid, as: 'bids' }, 'bidAmount', 'DESC']], // Ordering the bids by amount descending
    });

    if (!auctionProduct) {
      res.status(404).json({
        message: 'Auction product not found or auction is not ongoing.',
      });
      return;
    }

    // Get the current highest bid
    const highestBid = auctionProduct?.bids?.[0];

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
      logger.error('Invalid minimum acceptable bid calculation.');
      res
        .status(500)
        .json({ message: 'Invalid minimum acceptable bid calculation.' });
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
        if (previousBid.user) {
          // Ensure user is not undefined
          try {
            // Generate outbid notification message
            const message = emailTemplates.outBidNotification(
              previousBid,
              auctionProduct
            );

            // Send notification email
            await sendMail(
              previousBid.user.email,
              `${process.env.APP_NAME} - Outbid Notification`,
              message
            );
          } catch (emailError) {
            logger.error(
              `Error sending email to ${previousBid.user.email}:`,
              emailError
            );
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
      io.to(auctionProductId).emit('newBid', {
        auctionProductId,
        bidAmount: existingBid.bidAmount,
        bidderId: existingBid.bidderId,
      });

      res.status(200).json({
        message: 'Bid updated successfully.',
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
    io.to(auctionProductId).emit('newBid', {
      auctionProductId,
      bidAmount: newBid.bidAmount,
      bidderId: newBid.bidderId,
    });

    res.status(200).json({
      message: 'Bid placed successfully.',
      data: newBid,
    });
  } catch (error: any) {
    logger.error('Error placing bid:', error);
    res.status(500).json({
      message: 'An error occurred while placing your bid.',
    });
  }
};

export const actionProductBidders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { auctionproductId } = req.query; // Ensure userId is passed in the request

  try {
    // Fetch the main product by ID or SKU
    const product = await AuctionProduct.findOne({
      where: {
        [Op.or]: [
          { id: auctionproductId },
          { SKU: auctionproductId }, // Replace 'SKU' with the actual SKU column name if different
        ],
      },
      include: [
        {
          model: User,
          as: 'vendor',
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Currency,
              as: 'currency',
              attributes: ['symbol'],
            },
          ],
        },
        {
          model: SubCategory,
          as: 'sub_category',
          attributes: ['id', 'name'],
        },
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ data: product });
  } catch (error: any) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      message: error.message || 'An error occurred while fetching the product.',
    });
  }
};

export const becomeVendor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  const transaction = await sequelizeService.connection!.transaction();

  try {
    // Fetch the user
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      await transaction.rollback();
      return;
    }

    // Check if the user is already a vendor
    if (user.accountType === 'Vendor') {
      res.status(400).json({ message: 'User is already a vendor' });
      await transaction.rollback();
      return;
    }

    // Check if the user is eligible to become a vendor
    if (user.accountType !== 'Customer') {
      res
        .status(400)
        .json({ message: 'Account type cannot be changed to vendor' });
      await transaction.rollback();
      return;
    }

    // Update the accountType to vendor
    user.accountType = 'Vendor';
    await user.save({ transaction });

    // Find the free subscription plan
    const freePlan = await SubscriptionPlan.findOne({
      where: { name: 'Free Plan' },
      transaction,
    });

    if (!freePlan) {
      res
        .status(400)
        .json({ message: 'Free plan not found. Please contact support.' });
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
    await Notification.create(
      {
        userId: user.id,
        title: 'Welcome, Vendor!',
        message:
          'Congratulations! You are now a vendor. Start setting up your store and manage your products.',
        type: 'vendor',
      },
      { transaction }
    );

    await transaction.commit(); // Commit transaction
    res
      .status(200)
      .json({ message: 'Account successfully upgraded to vendor' });
  } catch (error) {
    await transaction.rollback(); // Rollback transaction on error
    logger.error('Error upgrading account to vendor:', error);
    res.status(500).json({ message: 'Failed to update account type' });
  }
};

export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
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
    const { rows: notifications, count: total } =
      await Notification.findAndCountAll({
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
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error });
  }
};

export const userMarkNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
  const notificationId = req.query.notificationId as string; // Notification ID passed in the request body

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  if (!notificationId) {
    res.status(400).json({ message: 'Notification ID is required' });
    return;
  }

  try {
    // Fetch the notification to ensure it belongs to the user
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      res.status(404).json({
        message: 'Notification not found or does not belong to the user',
      });
      return;
    }

    // Update the `readAt` field to mark it as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  const { trackingNumber } = req.query; // Only track by tracking number, no pagination

  try {
    // Fetch orders with the count of order items, and apply search by tracking number
    const orders = await Order.findAll({
      where: {
        userId,
        ...(trackingNumber && {
          trackingNumber: { [Op.like]: `%${trackingNumber}%` }, // Search by tracking number
        }),
      },
      attributes: {
        include: [
          [
            Sequelize.fn('COUNT', Sequelize.col('orderItems.id')),
            'orderItemsCount', // Alias for the count of order items
          ],
        ],
      },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: [], // Do not include actual order items
        },
      ],
      group: ['Order.id'], // Group by order to ensure correct counting
      order: [['createdAt', 'DESC']], // Order by createdAt
    });

    if (!orders || orders.length === 0) {
      res.status(404).json({ message: 'No orders found for this user' });
      return;
    }

    // Return the response with orders data
    res.status(200).json({
      message: 'Orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllOrderItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId, page = 1, limit = 10 } = req.query;

  // Convert `page` and `limit` to numbers and ensure they are valid
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  const offset = (pageNumber - 1) * limitNumber;

  try {
    // Ensure `orderId` is provided
    if (!orderId) {
      res.status(400).json({ message: 'Order ID is required' });
      return;
    }

    // Query for order items with pagination and required associations
    const { rows: orderItems, count } = await OrderItem.findAndCountAll({
      where: { orderId },
      limit: limitNumber,
      offset,
      order: [['createdAt', 'DESC']],
    });

    if (!orderItems || orderItems.length === 0) {
      res.status(404).json({ message: 'No items found for this order' });
      return;
    }

    // Prepare metadata for pagination
    const totalPages = Math.ceil(count / limitNumber);

    res.status(200).json({
      message: 'Order items retrieved successfully',
      data: orderItems,
      meta: {
        total: count, // Total number of order items
        page: pageNumber,
        limit: limitNumber,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const viewOrderItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderItemId } = req.query;

  try {
    // Query for a single order item and required associations
    const orderItem = await OrderItem.findOne({
      where: { id: orderItemId },
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'user',
              attributes: [
                'id',
                'firstName',
                'lastName',
                'email',
                'phoneNumber',
              ], // Include user details
            },
          ],
        },
      ],
    });

    // If order item is not found
    if (!orderItem) {
      res.status(404).json({ message: 'Order item not found' });
      return;
    }

    // Convert Sequelize model to plain object and add computed field
    const formattedOrderItem = {
      ...orderItem.get(), // Convert to plain object
      totalPrice: orderItem.quantity * orderItem.price, // Compute total price
    };

    res.status(200).json({
      message: 'Order item retrieved successfully',
      data: formattedOrderItem,
    });
  } catch (error) {
    logger.error('Error fetching order item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { status, orderItemId } = req.body;

  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  // Define allowed statuses
  const allowedStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ message: 'Invalid order status provided.' });
    return;
  }

  // Start transaction
  const transaction = await sequelizeService.connection!.transaction();

  try {
    // Find the order item
    const order = await OrderItem.findOne({
      where: { id: orderItemId },
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      res.status(404).json({ message: 'Order item not found.' });
      return;
    }

    const mainOrder = await Order.findOne({ where: { id: order.orderId } });

    if (!mainOrder) {
      await transaction.rollback();
      res.status(404).json({ message: 'Buyer information not found.' });
      return;
    }

    const buyer = await User.findByPk(mainOrder.userId, { transaction });

    if (!buyer) {
      await transaction.rollback();
      res.status(404).json({ message: 'Buyer not found.' });
      return;
    }

    // If the order is already delivered or cancelled, stop further processing
    if (order.status === 'delivered' || order.status === 'cancelled') {
      await transaction.rollback();
      res.status(400).json({
        message: `Order is already ${order.status}. No further updates are allowed.`,
      });
      return;
    }

    let productData: ProductData | null = order.product as ProductData;

    // If product data is stored as a string, parse it
    if (typeof order.product === 'string') {
      productData = JSON.parse(order.product) as ProductData;
    }

    // Extract vendorId safely
    const vendorId = productData?.vendorId ?? null;
    const currencySymbol = productData?.store?.currency?.symbol ?? null;

    if (!vendorId) {
      await transaction.rollback();
      res.status(400).json({ message: 'Vendor ID not found in product data.' });
      return;
    }

    if (!currencySymbol) {
      await transaction.rollback();
      res.status(400).json({ message: 'Currency not found in product data.' });
      return;
    }

    // Update the order status
    order.status = status;
    // If status is shipped, generate delivery code and email customer
    if (status === 'shipped') {
      const deliveryCode = crypto.randomBytes(6).toString('hex').toUpperCase();
      const mainOrder = await Order.findOne({
        where: { id: order.orderId },
        transaction,
      });
      if (mainOrder) {
        mainOrder.deliveryCode = deliveryCode;
        await mainOrder.save({ transaction });
        // Send email to customer
        const customer = await User.findByPk(mainOrder.userId, { transaction });
        if (customer) {
          const html = `
            <h3>Hi ${customer.firstName},</h3>
            <p>Your order <strong>#${mainOrder.id}</strong> has been shipped.</p>
            <p>Please be available to collect it. Use the code below to confirm delivery:</p>
            <h2 style="color: blue;">${deliveryCode}</h2>
            <p>Thanks for shopping with us!</p>
          `;
          try {
            await sendMail(
              customer.email,
              'Your order has been shipped!',
              html
            );
          } catch (emailError) {
            logger.error('Error sending shipping email:', emailError);
          }
        }
      }
    }
    await order.save({ transaction });

    // Check if vendorId exists in the User or Admin table
    const vendor = await User.findByPk(vendorId, { transaction });
    const admin = await Admin.findByPk(vendorId, { transaction });

    if (!vendor && !admin) {
      await transaction.rollback();
      res.status(404).json({ message: 'Product owner not found.' });
      return;
    }

    // If the order is delivered, add funds to the vendor's wallet
    if (
      (status === 'delivered' && currencySymbol === '#' && vendor) ||
      (status === 'delivered' && currencySymbol === '₦' && vendor)
    ) {
      const price = Number(order.price);
      vendor.wallet = Number(vendor.wallet) + price;
      await vendor.save({ transaction });
    }

    // If the order is delivered and the currency is USD, add funds to the vendor's wallet
    if (status === 'delivered' && currencySymbol === '$' && vendor) {
      const price = Number(order.price);
      vendor.dollarWallet = Number(vendor.dollarWallet) + price;
      await vendor.save({ transaction });
    }

    // Send a notification to the Buyer
    await Notification.create(
      {
        userId: mainOrder.userId,
        title: 'Order Status Updated',
        message: `Your product has been marked as '${status}'.`,
        type: 'order_status_update',
      },
      { transaction }
    );

    // Send a notification to the vendor/admin (who owns the product)
    await Notification.create(
      {
        userId: vendorId,
        title: 'Order Status Updated',
        message: `The status of the product '${productData?.name}' purchased from you has been updated to '${status}'.`,
        type: 'order_status_update',
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Send mail (outside of transaction)
    const message = emailTemplates.orderStatusUpdateNotification(
      buyer,
      status,
      productData?.name
    );
    try {
      await sendMail(
        buyer.email,
        `${process.env.APP_NAME} - Order Status Update`,
        message
      );
    } catch (emailError) {
      logger.error('Error sending email:', emailError);
    }

    res.status(200).json({
      message: `Order status updated to '${status}' successfully.`,
      data: order,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error updating order status:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the order status.' });
  }
};

export const getPaymentDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId, page = 1, limit = 10 } = req.query;

  // Convert `page` and `limit` to numbers
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  // Calculate the offset for pagination
  const offset = (pageNumber - 1) * limitNumber;

  try {
    // Fetch payments for the given orderId with pagination
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: { orderId },
      limit: limitNumber,
      offset: offset,
      order: [['createdAt', 'DESC']], // Order by latest payments
    });

    if (!payments || payments.length === 0) {
      res.status(404).json({ message: 'No payments found for this order' });
      return;
    }

    res.status(200).json({
      message: 'Payments retrieved successfully',
      data: payments,
      meta: {
        total: count, // Total number of payments for the order
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(count / limitNumber), // Calculate total pages
      },
    });
  } catch (error) {
    logger.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleSaveProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.body;
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  try {
    // Check if the product exists
    const product = await Product.findOne({
      where: { id: productId, status: 'active' },
    });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if the product is already saved (wishlist)
    const existingSavedProduct = await SaveProduct.findOne({
      where: { userId, productId },
    });

    if (existingSavedProduct) {
      // If exists, remove it (toggle)
      await existingSavedProduct.destroy();
      res.status(200).json({ message: 'Product removed from your saved list' });
    } else {
      // Otherwise, add the product to the saved list
      await SaveProduct.create({ userId, productId });
      res.status(200).json({ message: 'Product added to your saved list' });
    }
  } catch (error: any) {
    logger.error('Error toggling save product:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while processing the request.' });
  }
};

export const getSavedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  try {
    // Fetch all saved products for the authenticated user
    const savedProducts = await SaveProduct.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product', // Adjust the alias if necessary
          where: { status: 'active' }, // Only include active products
          include: [
            {
              model: User,
              as: 'vendor',
            },
            {
              model: Admin,
              as: 'admin',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: SubCategory,
              as: 'sub_category',
              attributes: ['id', 'name', 'categoryId'],
            },
            {
              model: Store,
              as: 'store',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Currency,
                  as: 'currency',
                  attributes: ['symbol'],
                },
              ],
            },
          ],
        },
      ],
    });

    // If no saved products are found
    if (savedProducts.length === 0) {
      res.status(404).json({ message: 'No saved products found' });
      return;
    }

    // Send the saved products in the response
    res.status(200).json({ data: savedProducts });
  } catch (error: any) {
    logger.error('Error fetching saved products:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching saved products.' });
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  const { orderId, productId, rating, comment } = req.body;
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: User ID is missing.' });
    return;
  }

  // Ensure rating is a valid number between 1 and 5
  if (typeof rating !== 'number' || isNaN(rating) || rating < 1 || rating > 5) {
    res
      .status(400)
      .json({ message: 'Rating must be a numeric value between 1 and 5.' });
    return;
  }

  try {
    // Check if user has purchased the product
    const purchased = await hasPurchasedProduct(orderId, productId);
    if (!purchased) {
      res.status(403).json({
        message: 'You can only review products that has been delivered.',
      });
      return;
    }

    // Check if the user already reviewed the product
    const existingReview = await ReviewProduct.findOne({
      where: { userId, productId },
    });

    if (existingReview) {
      res
        .status(400)
        .json({ message: 'You have already reviewed this product.' });
      return;
    }

    // Create the review
    await ReviewProduct.create({ userId, productId, rating, comment });

    res.status(200).json({ message: 'Review submitted successfully.' });
  } catch (error) {
    logger.error('Error adding review:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while submitting the review.' });
  }
};

export const updateReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { reviewId, rating, comment } = req.body;
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID

  // Ensure rating is a valid number between 1 and 5
  if (typeof rating !== 'number' || isNaN(rating) || rating < 1 || rating > 5) {
    res
      .status(400)
      .json({ message: 'Rating must be a numeric value between 1 and 5.' });
    return;
  }

  try {
    // Find existing review
    const review = await ReviewProduct.findOne({
      where: { userId, id: reviewId },
    });

    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    // Update the review
    await review.update({ rating, comment });

    res.status(200).json({ message: 'Review updated successfully.' });
  } catch (error) {
    logger.error('Error updating review:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the review.' });
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { productId } = req.query; // Query parameter for productId
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID

  try {
    const whereClause: any = { userId }; // Default filter by user ID

    if (productId) {
      whereClause.productId = productId; // Add product filter if provided
    }

    const reviews = await ReviewProduct.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    res.status(200).json({ data: reviews });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching reviews.' });
  }
};

export const getSingleReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const reviewId = req.query.reviewId as string;

  try {
    const review = await ReviewProduct.findOne({
      where: { id: reviewId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'vendor',
            },
            {
              model: Admin,
              as: 'admin',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: SubCategory,
              as: 'sub_category',
              attributes: ['id', 'name', 'categoryId'],
            },
            {
              model: Store,
              as: 'store',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Currency,
                  as: 'currency',
                  attributes: ['symbol'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!review) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    res.status(200).json({ data: review });
  } catch (error) {
    logger.error('Error fetching review:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching the review.' });
  }
};

// Delete user account
export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

  if (!userId) {
    res.status(400).json({ message: 'User must be authenticated' });
    return;
  }

  try {
    console.log('[DELETE] Starting account deletion for user:', userId);

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('[DELETE] User found, starting to delete related records...');

    // Delete related records first to handle RESTRICT constraints
    try {
      await OTP.destroy({ where: { userId } });
      console.log('[DELETE] OTP records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting OTP:', error.message);
    }

    try {
      await VendorSubscription.destroy({ where: { vendorId: userId } });
      console.log('[DELETE] VendorSubscription records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting VendorSubscription:', error.message);
    }

    try {
      await Store.destroy({ where: { vendorId: userId } });
      console.log('[DELETE] Store records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting Store:', error.message);
    }

    try {
      await KYC.destroy({ where: { vendorId: userId } });
      console.log('[DELETE] KYC records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting KYC:', error.message);
    }

    try {
      await Bid.destroy({ where: { bidderId: userId } });
      console.log('[DELETE] Bid records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting Bid:', error.message);
    }

    try {
      await Cart.destroy({ where: { userId } });
      console.log('[DELETE] Cart records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting Cart:', error.message);
    }

    try {
      await ShowInterest.destroy({ where: { userId } });
      console.log('[DELETE] ShowInterest records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting ShowInterest:', error.message);
    }

    try {
      await SaveProduct.destroy({ where: { userId } });
      console.log('[DELETE] SaveProduct records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting SaveProduct:', error.message);
    }

    try {
      await ReviewProduct.destroy({ where: { userId } });
      console.log('[DELETE] ReviewProduct records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting ReviewProduct:', error.message);
    }

    try {
      await Notification.destroy({ where: { userId } });
      console.log('[DELETE] Notification records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting Notification:', error.message);
    }

    try {
      await UserNotificationSetting.destroy({ where: { userId } });
      console.log('[DELETE] UserNotificationSetting records deleted');
    } catch (error: any) {
      console.log(
        '[DELETE] Error deleting UserNotificationSetting:',
        error.message
      );
    }

    try {
      await ProductReport.destroy({ where: { userId } });
      console.log('[DELETE] ProductReport records deleted');
    } catch (error: any) {
      console.log('[DELETE] Error deleting ProductReport:', error.message);
    }

    try {
      await BlockedVendor.destroy({ where: { userId } });
      console.log('[DELETE] BlockedVendor records deleted (userId)');
    } catch (error: any) {
      console.log(
        '[DELETE] Error deleting BlockedVendor (userId):',
        error.message
      );
    }

    try {
      await BlockedVendor.destroy({ where: { vendorId: userId } });
      console.log('[DELETE] BlockedVendor records deleted (vendorId)');
    } catch (error: any) {
      console.log(
        '[DELETE] Error deleting BlockedVendor (vendorId):',
        error.message
      );
    }

    // Delete messages and conversations
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ userId1: userId }, { userId2: userId }],
        },
      });

      for (const conversation of conversations) {
        await Message.destroy({ where: { conversationId: conversation.id } });
      }
      await Conversation.destroy({
        where: {
          [Op.or]: [{ userId1: userId }, { userId2: userId }],
        },
      });
      console.log('[DELETE] Messages and conversations deleted');
    } catch (error: any) {
      console.log(
        '[DELETE] Error deleting messages/conversations:',
        error.message
      );
    }

    console.log('[DELETE] All related records deleted, now deleting user...');

    // Now delete the user
    await user.destroy();
    console.log('[DELETE] User deleted successfully');

    // Admin notification removed to prevent backend crashes
    // The model isn't properly set up in local database

    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('[DELETE] Error deleting user account:', error);
    res
      .status(500)
      .json({ message: 'An error occurred while deleting the account.' });
  }
};

// Report a product with a reason
export const reportProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id; // Authenticated user ID from middleware
    const { productId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!productId || !reason) {
      res.status(400).json({ message: 'Product ID and reason are required.' });
      return;
    }

    await ProductReport.create({
      productId,
      userId,
      reason,
    });

    res.status(201).json({ message: 'Product reported successfully.' });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message || 'Failed to report product.' });
  }
};

export const blockVendor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { vendorId } = req.body;

    if (!vendorId) {
      res.status(400).json({ message: 'vendorId is required.' });
      return;
    }
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }
    if (userId === vendorId) {
      res.status(400).json({ message: 'You cannot block yourself.' });
      return;
    }

    // Check if already blocked
    const alreadyBlocked = await BlockedVendor.findOne({
      where: { userId, vendorId },
    });
    if (alreadyBlocked) {
      res.status(200).json({ message: 'Vendor already blocked.' });
      return;
    }

    await BlockedVendor.create({ userId, vendorId });
    res.status(200).json({ message: 'Vendor blocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const unblockVendor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { vendorId } = req.body;

    if (!vendorId) {
      res.status(400).json({ message: 'vendorId is required.' });
      return;
    }
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    // Check if vendor is blocked
    const blocked = await BlockedVendor.findOne({
      where: { userId, vendorId },
    });
    if (!blocked) {
      res.status(200).json({ message: 'Vendor is not blocked.' });
      return;
    }

    await BlockedVendor.destroy({ where: { userId, vendorId } });
    res.status(200).json({ message: 'Vendor unblocked successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const getBlockedVendors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const blockedVendors = await BlockedVendor.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
        },
      ],
    });

    res.status(200).json({
      message: 'Blocked vendors retrieved successfully.',
      data: blockedVendors,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Block a product for a user (hide product from user's view)
export const blockProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID
    const { productId, reason } = req.body; // Get productId and reason from request body

    if (!productId) {
      // Check if productId is provided
      res.status(400).json({ message: 'productId is required.' });
      return;
    }
    if (!userId) {
      // Check if user is authenticated
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    // Check if already blocked
    const alreadyBlocked = await BlockedProduct.findOne({
      where: { userId, productId }, // Check if this product is already blocked for this user
    });
    if (alreadyBlocked) {
      // If already blocked, return
      res.status(200).json({ message: 'Product already blocked.' });
      return;
    }

    await BlockedProduct.create({ userId, productId, reason }); // Block the product and save the reason
    res.status(200).json({ message: 'Product blocked successfully.' }); // Respond with success
  } catch (error) {
    res.status(500).json({ message: 'Server error.' }); // Handle server error
  }
};
