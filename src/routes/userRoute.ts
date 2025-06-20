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

userRoutes.delete('/delete/account', authMiddleware, userController.deleteAccount);

// Cart
userRoutes.post("/cart/add", authMiddleware, validateAddItemToCart(), validate, userController.addItemToCart);
userRoutes.put("/cart/update", authMiddleware, validateUpdateCartItem(), validate, userController.updateCartItem);
userRoutes.delete("/cart/remove", authMiddleware, userController.removeCartItem);
userRoutes.get("/cart", authMiddleware, userController.getCartContents);
userRoutes.delete("/cart/clear", authMiddleware, userController.clearCart);

userRoutes.get("/payment/gateway", authMiddleware, userController.getActivePaymentGateways);
userRoutes.post("/checkout", authMiddleware, userController.checkout);
userRoutes.post("/checkout/dollar", authMiddleware, userController.checkoutDollar);


// Conversation and Message
userRoutes.get('/conversations', authMiddleware, userController.getConversations);
userRoutes.get('/messages', authMiddleware, userController.getAllConversationMessages);
userRoutes.post('/messages', authMiddleware, validateSendMessage(), validate, userController.sendMessageHandler);
userRoutes.delete('/messages', authMiddleware, userController.deleteMessageHandler);
userRoutes.patch('/mark/message/read', authMiddleware, userController.markAsReadHandler);

// Bid
userRoutes.post('/auction/interest', authMiddleware, validateShowInterest(), validate, userController.showInterest)
userRoutes.get('/auction/products/interest', authMiddleware, userController.getAllAuctionProductsInterest)
userRoutes.post('/place/bid', authMiddleware, validatePlaceBid(), validate, userController.placeBid)
userRoutes.get("/auction/product/bidders", authMiddleware, userController.actionProductBidders);

userRoutes.post("/become/vendor", authMiddleware, userController.becomeVendor);

// Notification
userRoutes.get("/notifications", authMiddleware, userController.getUserNotifications);
userRoutes.patch("/mark/notification/as/read", authMiddleware, userController.userMarkNotificationAsRead);

// Order, OrderItem and Payment
userRoutes.get("/orders", authMiddleware, userController.getAllOrders);
userRoutes.get("/order/items", authMiddleware, userController.getAllOrderItems);
userRoutes.get("/order/item", authMiddleware, userController.viewOrderItem);
userRoutes.post("/order/item/update/status", authMiddleware, userController.updateOrderStatus);
userRoutes.get("/order/payment", authMiddleware, userController.getPaymentDetails);

// Save Product
userRoutes.post("/save/product", authMiddleware, userController.toggleSaveProduct);
userRoutes.get("/saved/products", authMiddleware, userController.getSavedProducts);

// add Review
userRoutes.post("/add/review", authMiddleware, userController.addReview);
userRoutes.put("/update/review", authMiddleware, userController.updateReview);
userRoutes.get("/get/review", authMiddleware, userController.getProductReviews);
userRoutes.get("/view/review", authMiddleware, userController.getSingleReview);

export default userRoutes;
