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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoute.ts
const express_1 = require("express");
const userController = __importStar(require("../controllers/userController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const validations_1 = require("../utils/validations");
const userRoutes = (0, express_1.Router)();
// User routes
userRoutes.post("/logout", authMiddleware_1.default, userController.logout);
userRoutes.get('/profile', authMiddleware_1.default, userController.profile);
userRoutes.put('/profile/update', authMiddleware_1.default, userController.updateProfile);
userRoutes.patch('/profile/photo/update', authMiddleware_1.default, userController.updateProfilePhoto);
userRoutes.put('/profile/update/email', authMiddleware_1.default, (0, validations_1.updateProfileEmailValidationRules)(), validations_1.validate, userController.updateProfileEmail);
userRoutes.put('/profile/confirm/email', authMiddleware_1.default, (0, validations_1.confirmProfileEmailValidationRules)(), validations_1.validate, userController.confirmEmailUpdate);
userRoutes.put('/profile/update/phone', authMiddleware_1.default, (0, validations_1.updateProfilePhoneNumberValidationRules)(), validations_1.validate, userController.updateProfilePhoneNumber);
userRoutes.put('/profile/confirm/phone/number', authMiddleware_1.default, (0, validations_1.confirmProfilePhoneNumberValidationRules)(), validations_1.validate, userController.confirmPhoneNumberUpdate);
userRoutes.put('/profile/update/password', authMiddleware_1.default, (0, validations_1.updatePasswordValidationRules)(), validations_1.validate, userController.updatePassword);
userRoutes.get('/notification/settings', authMiddleware_1.default, userController.getUserNotificationSettings);
userRoutes.put('/update/notification/settings', authMiddleware_1.default, userController.updateUserNotificationSettings);
// Cart
userRoutes.post("/cart/add", authMiddleware_1.default, (0, validations_1.validateAddItemToCart)(), validations_1.validate, userController.addItemToCart);
userRoutes.put("/cart/update", authMiddleware_1.default, (0, validations_1.validateUpdateCartItem)(), validations_1.validate, userController.updateCartItem);
userRoutes.delete("/cart/remove", authMiddleware_1.default, userController.removeCartItem);
userRoutes.get("/cart", authMiddleware_1.default, userController.getCartContents);
userRoutes.delete("/cart/clear", authMiddleware_1.default, userController.clearCart);
userRoutes.get("/payment/gateway", authMiddleware_1.default, userController.getActivePaymentGateway);
userRoutes.post("/checkout", authMiddleware_1.default, userController.checkout);
// Conversation and Message
userRoutes.get('/conversations', authMiddleware_1.default, userController.getConversations);
userRoutes.get('/messages', authMiddleware_1.default, userController.getAllConversationMessages);
userRoutes.post('/messages', authMiddleware_1.default, (0, validations_1.validateSendMessage)(), validations_1.validate, userController.sendMessageHandler);
userRoutes.delete('/messages', authMiddleware_1.default, userController.deleteMessageHandler);
userRoutes.patch('/mark/message/read', authMiddleware_1.default, userController.markAsReadHandler);
// Bid
userRoutes.post('/auction/interest', authMiddleware_1.default, (0, validations_1.validateShowInterest)(), validations_1.validate, userController.showInterest);
userRoutes.post('/place/bid', authMiddleware_1.default, (0, validations_1.validatePlaceBid)(), validations_1.validate, userController.placeBid);
userRoutes.post("/become/vendor", authMiddleware_1.default, userController.becomeVendor);
// Notification
userRoutes.get("/notifications", authMiddleware_1.default, userController.getUserNotifications);
userRoutes.patch("/mark/notification/as/read", authMiddleware_1.default, userController.userMarkNotificationAsRead);
// Order, OrderItem and Payment
userRoutes.get("/orders", authMiddleware_1.default, userController.getAllOrders);
userRoutes.get("/order/items", authMiddleware_1.default, userController.getAllOrderItems);
userRoutes.get("/order/payment", authMiddleware_1.default, userController.getPaymentDetails);
exports.default = userRoutes;
//# sourceMappingURL=userRoute.js.map