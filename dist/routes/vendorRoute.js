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
const vendorController = __importStar(require("../controllers/vendorController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const authorizeVendor_1 = __importDefault(require("../middlewares/authorizeVendor"));
const validations_1 = require("../utils/validations");
const vendorRoutes = (0, express_1.Router)();
// User routes
vendorRoutes.post("/kyc", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.kycValidationRules)(), validations_1.validate, vendorController.submitOrUpdateKYC);
vendorRoutes.get("/kyc", authMiddleware_1.default, vendorController.getKYC);
// Store
vendorRoutes.get("/store", authMiddleware_1.default, vendorController.getStore);
vendorRoutes.post("/store", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.createStoreValidation)(), validations_1.validate, vendorController.createStore);
vendorRoutes.put("/store", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.updateStoreValidation)(), validations_1.validate, vendorController.updateStore);
vendorRoutes.delete("/store", authMiddleware_1.default, authorizeVendor_1.default, vendorController.deleteStore);
// Product
vendorRoutes.get("/vendors/products", authMiddleware_1.default, vendorController.fetchVendorProducts);
vendorRoutes.post("/products", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.addProductValidation)(), validations_1.validate, vendorController.createProduct);
vendorRoutes.put("/products", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.updateProductValidation)(), validations_1.validate, vendorController.updateProduct);
vendorRoutes.delete("/products", authMiddleware_1.default, authorizeVendor_1.default, vendorController.deleteProduct);
vendorRoutes.get("/product", authMiddleware_1.default, authorizeVendor_1.default, vendorController.viewProduct);
vendorRoutes.patch("/products/move-to-draft", authMiddleware_1.default, authorizeVendor_1.default, vendorController.moveToDraft);
vendorRoutes.patch("/products/change-status", authMiddleware_1.default, authorizeVendor_1.default, vendorController.changeProductStatus);
// Auction Product
vendorRoutes.get("/auction/products", authMiddleware_1.default, authorizeVendor_1.default, vendorController.fetchVendorAuctionProducts);
vendorRoutes.post("/auction/products", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.auctionProductValidation)(), validations_1.validate, vendorController.createAuctionProduct);
vendorRoutes.put("/auction/products", authMiddleware_1.default, authorizeVendor_1.default, (0, validations_1.updateAuctionProductValidation)(), validations_1.validate, vendorController.updateAuctionProduct);
vendorRoutes.delete("/auction/products", authMiddleware_1.default, authorizeVendor_1.default, vendorController.deleteAuctionProduct);
vendorRoutes.patch("/auction/products", authMiddleware_1.default, authorizeVendor_1.default, vendorController.cancelAuctionProduct);
vendorRoutes.get("/auction/product", authMiddleware_1.default, authorizeVendor_1.default, vendorController.viewAuctionProduct);
// Subscription
vendorRoutes.get("/subscription/plans", authMiddleware_1.default, authorizeVendor_1.default, vendorController.subscriptionPlans);
vendorRoutes.post("/subscribe", authMiddleware_1.default, authorizeVendor_1.default, vendorController.subscribe);
vendorRoutes.get("/verifyCAC", authMiddleware_1.default, authorizeVendor_1.default, vendorController.verifyCAC);
vendorRoutes.get('/currencies', authMiddleware_1.default, authorizeVendor_1.default, vendorController.getAllCurrencies);
vendorRoutes.get('/categories', authMiddleware_1.default, authorizeVendor_1.default, vendorController.getAllSubCategories);
vendorRoutes.get("/order/items", authMiddleware_1.default, vendorController.getVendorOrderItems);
vendorRoutes.get("/order/item/details", authMiddleware_1.default, vendorController.getOrderItemsInfo);
// Adverts
vendorRoutes.get("/active/products", authMiddleware_1.default, vendorController.activeProducts); // Create a new advert
vendorRoutes.post("/adverts", (0, validations_1.createAdvertValidation)(), validations_1.validate, authMiddleware_1.default, vendorController.createAdvert); // Create a new advert
vendorRoutes.put("/adverts", (0, validations_1.updateAdvertValidation)(), validations_1.validate, authMiddleware_1.default, vendorController.updateAdvert); // Update an existing advert
vendorRoutes.get("/adverts", authMiddleware_1.default, vendorController.getAdverts); // Get adverts
vendorRoutes.get("/advert", authMiddleware_1.default, vendorController.viewAdvert); // View a specific advert
vendorRoutes.delete("/adverts", authMiddleware_1.default, vendorController.deleteAdvert); // Delete an advert
exports.default = vendorRoutes;
//# sourceMappingURL=vendorRoute.js.map