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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminRoute.ts
const express_1 = require("express");
const adminController = __importStar(require("../controllers/adminController"));
const adminAuthMiddleware_1 = __importDefault(require("../middlewares/adminAuthMiddleware"));
const validations_1 = require("../utils/validations"); // Import the service
const checkPermissionMiddleware_1 = __importDefault(require("../middlewares/checkPermissionMiddleware"));
const adminRoutes = (0, express_1.Router)();
// User routes
adminRoutes.get("/logout", adminAuthMiddleware_1.default, adminController.logout);
adminRoutes.put('/profile/update', adminAuthMiddleware_1.default, (0, validations_1.adminUpdateProfileValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)('update-profile'), adminController.updateProfile);
adminRoutes.put('/profile/update/password', adminAuthMiddleware_1.default, (0, validations_1.updatePasswordValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)('update-password'), adminController.updatePassword);
// Sub Admin
adminRoutes.get('/sub-admins', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('view-subadmin'), adminController.subAdmins);
adminRoutes.post('/sub-admin/create', adminAuthMiddleware_1.default, (0, validations_1.createSubAdminValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)('create-subadmin'), adminController.createSubAdmin);
adminRoutes.put('/sub-admin/update', adminAuthMiddleware_1.default, (0, validations_1.updateSubAdminValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)('update-subadmin'), adminController.updateSubAdmin);
adminRoutes.patch('/sub-admin/status', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('activateanddeactivate-subadmin'), adminController.deactivateOrActivateSubAdmin);
adminRoutes.delete('/sub-admin/delete', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('delete-subadmin'), adminController.deleteSubAdmin);
adminRoutes.post('/sub-admin/resend-login', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('resendlogindetails-subadmin'), adminController.resendLoginDetailsSubAdmin);
// Role
adminRoutes.get('/roles', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('view-role'), adminController.getRoles);
adminRoutes.post('/role/create', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('create-role'), adminController.createRole);
adminRoutes.put('/role/update', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('update-role'), adminController.updateRole);
adminRoutes.get('/role/view/permissions', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('view-role-permissions'), adminController.viewRolePermissions);
adminRoutes.post('/role/assign/permission', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('assign-role-permissions'), adminController.assignPermissionToRole);
adminRoutes.delete('/role/delete/permission', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('delete-role-permissions'), adminController.deletePermissionFromRole);
// Permission
adminRoutes.get('/permissions', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('view-permission'), adminController.getPermissions);
adminRoutes.post('/permission/create', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('create-permission'), adminController.createPermission);
adminRoutes.put('/permission/update', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('update-permission'), adminController.updatePermission);
adminRoutes.delete('/permission/delete', adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)('delete-permission'), adminController.deletePermission);
// Subscription Plan
adminRoutes.get('/subscription/plans', adminAuthMiddleware_1.default, adminController.getAllSubscriptionPlans);
adminRoutes.post('/subscription/plan/create', adminAuthMiddleware_1.default, (0, validations_1.createSubscriptionPlanValidationRules)(), validations_1.validate, adminController.createSubscriptionPlan);
adminRoutes.put('/subscription/plan/update', adminAuthMiddleware_1.default, (0, validations_1.updateSubscriptionPlanValidationRules)(), validations_1.validate, adminController.updateSubscriptionPlan);
adminRoutes.delete('/subscription/plan/delete', adminAuthMiddleware_1.default, adminController.deleteSubscriptionPlan);
// Create a category
adminRoutes.post('/categories', adminAuthMiddleware_1.default, adminController.createCategory);
// Update a category
adminRoutes.put('/categories', adminAuthMiddleware_1.default, adminController.updateCategory);
// Delete a category
adminRoutes.delete('/categories', adminAuthMiddleware_1.default, adminController.deleteCategory);
// Fetch all categories
adminRoutes.get('/categories', adminAuthMiddleware_1.default, adminController.getAllCategories);
adminRoutes.get('/categories/sub/categories', adminAuthMiddleware_1.default, adminController.getCategoriesWithSubCategories);
adminRoutes.post('/sub/categories', adminAuthMiddleware_1.default, adminController.createSubCategory);
adminRoutes.put('/sub/categories', adminAuthMiddleware_1.default, adminController.updateSubCategory);
adminRoutes.delete('/sub/categories', adminAuthMiddleware_1.default, adminController.deleteSubCategory);
adminRoutes.get('/sub/categories', adminAuthMiddleware_1.default, adminController.getAllSubCategories);
// KYC
adminRoutes.get('/kyc', adminAuthMiddleware_1.default, adminController.getAllKYC);
adminRoutes.post('/kyc/approve-reject', adminAuthMiddleware_1.default, (0, validations_1.validateKYCNotification)(), validations_1.validate, adminController.approveOrRejectKYC);
// Payment Gateway
adminRoutes.post('/payment-gateway', adminAuthMiddleware_1.default, (0, validations_1.validatePaymentGateway)(), validations_1.validate, adminController.createPaymentGateway);
adminRoutes.put('/payment-gateway', adminAuthMiddleware_1.default, (0, validations_1.validatePaymentGateway)(), validations_1.validate, adminController.updatePaymentGateway);
adminRoutes.delete('/payment-gateway', adminAuthMiddleware_1.default, adminController.deletePaymentGateway);
adminRoutes.get('/payment-gateways', adminAuthMiddleware_1.default, adminController.getAllPaymentGateways);
adminRoutes.patch('/payment-gateways/status', adminAuthMiddleware_1.default, adminController.setPaymentGatewayActive);
// Currency
adminRoutes.post('/currency', adminAuthMiddleware_1.default, adminController.addCurrency);
adminRoutes.put('/currency', adminAuthMiddleware_1.default, adminController.updateCurrency);
adminRoutes.delete('/currency', adminAuthMiddleware_1.default, adminController.deleteCurrency);
adminRoutes.get('/currencies', adminAuthMiddleware_1.default, adminController.getAllCurrencies);
// users
adminRoutes.get('/customers', adminAuthMiddleware_1.default, adminController.getAllCustomers);
adminRoutes.get('/vendors', adminAuthMiddleware_1.default, adminController.getAllVendors);
adminRoutes.get('/user/details', adminAuthMiddleware_1.default, adminController.viewUser);
adminRoutes.patch('/toggle/user/status', adminAuthMiddleware_1.default, adminController.toggleUserStatus);
// Store
adminRoutes.get("/store", adminAuthMiddleware_1.default, adminController.getStore);
adminRoutes.post("/store", adminAuthMiddleware_1.default, (0, validations_1.createStoreValidation)(), validations_1.validate, adminController.createStore);
adminRoutes.put("/store", adminAuthMiddleware_1.default, (0, validations_1.updateStoreValidation)(), validations_1.validate, adminController.updateStore);
adminRoutes.delete("/store", adminAuthMiddleware_1.default, adminController.deleteStore);
// Product
adminRoutes.get("/products", adminAuthMiddleware_1.default, adminController.fetchProducts);
adminRoutes.post("/products", adminAuthMiddleware_1.default, (0, validations_1.addProductValidation)(), validations_1.validate, adminController.createProduct);
adminRoutes.put("/products", adminAuthMiddleware_1.default, (0, validations_1.updateProductValidation)(), validations_1.validate, adminController.updateProduct);
adminRoutes.delete("/products", adminAuthMiddleware_1.default, adminController.deleteProduct);
adminRoutes.get("/product", adminAuthMiddleware_1.default, adminController.viewProduct);
adminRoutes.patch("/products/move-to-draft", adminAuthMiddleware_1.default, adminController.moveToDraft);
adminRoutes.patch("/products/change-status", adminAuthMiddleware_1.default, adminController.changeProductStatus);
// Auction Product
adminRoutes.get("/auction/products", adminAuthMiddleware_1.default, adminController.fetchAuctionProducts);
adminRoutes.post("/auction/products", adminAuthMiddleware_1.default, (0, validations_1.auctionProductValidation)(), validations_1.validate, adminController.createAuctionProduct);
adminRoutes.put("/auction/products", adminAuthMiddleware_1.default, (0, validations_1.updateAuctionProductValidation)(), validations_1.validate, adminController.updateAuctionProduct);
adminRoutes.delete("/auction/products", adminAuthMiddleware_1.default, adminController.deleteAuctionProduct);
adminRoutes.patch("/auction/products", adminAuthMiddleware_1.default, adminController.cancelAuctionProduct);
adminRoutes.get("/auction/product", adminAuthMiddleware_1.default, adminController.viewAuctionProduct);
//General Store | Product | Auction Products | Adverts
adminRoutes.get("/general/stores", adminAuthMiddleware_1.default, adminController.getGeneralStores);
adminRoutes.get("/general/store/view", adminAuthMiddleware_1.default, adminController.viewGeneralStore);
adminRoutes.get("/general/products", adminAuthMiddleware_1.default, adminController.getGeneralProducts);
adminRoutes.get("/general/product/view", adminAuthMiddleware_1.default, adminController.viewGeneralProduct);
adminRoutes.delete("/general/product/delete", adminAuthMiddleware_1.default, adminController.deleteGeneralProduct);
adminRoutes.get("/general/auction/products", adminAuthMiddleware_1.default, adminController.getGeneralAuctionProducts);
adminRoutes.get("/general/auction/product/view", adminAuthMiddleware_1.default, adminController.viewGeneralAuctionProduct);
adminRoutes.delete("/general/auction/product/delete", adminAuthMiddleware_1.default, adminController.deleteGeneralAuctionProduct);
adminRoutes.get("/general/orders", adminAuthMiddleware_1.default, adminController.getAllGeneralOrders);
adminRoutes.get("/general/order/items", adminAuthMiddleware_1.default, adminController.getAllGeneralOrderItems);
adminRoutes.get("/general/order/payment", adminAuthMiddleware_1.default, adminController.getGeneralPaymentDetails);
adminRoutes.get("/general/adverts", adminAuthMiddleware_1.default, adminController.getGeneralAdverts);
adminRoutes.get("/general/advert/view", adminAuthMiddleware_1.default, adminController.viewGeneralAdvert);
// Subscribers
adminRoutes.get("/subscribers", adminAuthMiddleware_1.default, adminController.getAllSubscribers);
// Transactions
adminRoutes.get("/transactions", adminAuthMiddleware_1.default, adminController.getTransactionsForAdmin);
// Adverts
adminRoutes.get("/active/products", adminAuthMiddleware_1.default, adminController.activeProducts); // Create a new advert
adminRoutes.post("/adverts", (0, validations_1.createAdvertValidation)(), validations_1.validate, adminAuthMiddleware_1.default, adminController.createAdvert); // Create a new advert
adminRoutes.put("/adverts", (0, validations_1.updateAdvertValidation)(), validations_1.validate, adminAuthMiddleware_1.default, adminController.updateAdvert); // Update an existing advert
adminRoutes.get("/adverts", adminAuthMiddleware_1.default, adminController.getAdverts); // Get adverts
adminRoutes.get("/advert", adminAuthMiddleware_1.default, adminController.viewAdvert); // View a specific advert
adminRoutes.delete("/adverts", adminAuthMiddleware_1.default, adminController.deleteAdvert); // Delete an advert
adminRoutes.post("/approved-reject/advert", adminAuthMiddleware_1.default, adminController.approveOrRejectAdvert);
exports.default = adminRoutes; // Export the router
//# sourceMappingURL=adminRoute.js.map