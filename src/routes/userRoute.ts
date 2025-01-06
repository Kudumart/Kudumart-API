// src/routes/userRoute.ts
import { Router } from 'express';
import * as userController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import { updatePasswordValidationRules, 
        updateProfileEmailValidationRules, 
        confirmProfileEmailValidationRules, 
        updateProfilePhoneNumberValidationRules, 
        confirmProfilePhoneNumberValidationRules, 
        validateSendMessage, 
        validatePlaceBid, 
        validateAddItemToCart,
        validateUpdateCartItem,
        validateShowInterest,
        validate 
} from '../utils/validations';

const userRoutes = Router();

// User routes
userRoutes.post("/logout", authMiddleware, userController.logout);
userRoutes.get('/profile', authMiddleware, userController.profile);
userRoutes.put('/profile/update', authMiddleware, userController.updateProfile);
userRoutes.patch('/profile/photo/update', authMiddleware, userController.updateProfilePhoto);
userRoutes.put('/profile/update/email', authMiddleware, updateProfileEmailValidationRules(), validate, userController.updateProfileEmail);
userRoutes.put('/profile/confirm/email', authMiddleware, confirmProfileEmailValidationRules(), validate, userController.confirmEmailUpdate);
userRoutes.put('/profile/update/phone', authMiddleware, updateProfilePhoneNumberValidationRules(), validate, userController.updateProfilePhoneNumber);
userRoutes.put('/profile/confirm/phone/number', authMiddleware, confirmProfilePhoneNumberValidationRules(), validate, userController.confirmPhoneNumberUpdate);
userRoutes.put('/profile/update/password', authMiddleware, updatePasswordValidationRules(), validate, userController.updatePassword);

userRoutes.get('/notification/settings', authMiddleware, userController.getUserNotificationSettings);
userRoutes.put('/update/notification/settings', authMiddleware, userController.updateUserNotificationSettings);

// Cart
userRoutes.post("/cart/add", authMiddleware, validateAddItemToCart(), validate, userController.addItemToCart);
userRoutes.put("/cart/update", authMiddleware, validateUpdateCartItem(), validate, userController.updateCartItem);
userRoutes.delete("/cart/remove", authMiddleware, userController.removeCartItem);
userRoutes.get("/cart", authMiddleware, userController.getCartContents);
userRoutes.delete("/cart/clear", authMiddleware, userController.clearCart);

// Conversation and Message
userRoutes.get('/conversations', authMiddleware, userController.getConversations);
userRoutes.get('/messages', authMiddleware, userController.getAllConversationMessages);
userRoutes.post('/messages', authMiddleware, validateSendMessage(), validate, userController.sendMessageHandler);
userRoutes.delete('/messages', authMiddleware, userController.deleteMessageHandler);
userRoutes.patch('/mark/message/read', authMiddleware, userController.markAsReadHandler);

// Bid
userRoutes.post('/auction/interest', authMiddleware, validateShowInterest(), validate, userController.showInterest)
userRoutes.post('/place/bid', authMiddleware, validatePlaceBid(), validate, userController.placeBid)

export default userRoutes;
