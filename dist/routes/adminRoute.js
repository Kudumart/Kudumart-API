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
const homeController = __importStar(require("../controllers/homeController"));
const adminAuthMiddleware_1 = __importDefault(require("../middlewares/adminAuthMiddleware"));
const validations_1 = require("../utils/validations"); // Import the service
const checkPermissionMiddleware_1 = __importDefault(require("../middlewares/checkPermissionMiddleware"));
const permissions_1 = require("../utils/permissions");
const adminController_1 = require("../controllers/adminController");
const adminRoutes = (0, express_1.Router)();
// User routes
adminRoutes.get("/logout", adminAuthMiddleware_1.default, adminController.logout);
adminRoutes.put("/profile/update", adminAuthMiddleware_1.default, (0, validations_1.adminUpdateProfileValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)("update-profile"), adminController.updateProfile);
adminRoutes.put("/profile/update/password", adminAuthMiddleware_1.default, (0, validations_1.updatePasswordValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)("update-password"), adminController.updatePassword);
// Sub Admin
adminRoutes.get("/sub-admins", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("view-subadmin"), adminController.subAdmins);
adminRoutes.post("/sub-admin/create", adminAuthMiddleware_1.default, (0, validations_1.createSubAdminValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)("create-subadmin"), adminController.createSubAdmin);
adminRoutes.put("/sub-admin/update", adminAuthMiddleware_1.default, (0, validations_1.updateSubAdminValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)("update-subadmin"), adminController.updateSubAdmin);
adminRoutes.patch("/sub-admin/status", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("activateanddeactivate-subadmin"), adminController.deactivateOrActivateSubAdmin);
adminRoutes.delete("/sub-admin/delete", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("delete-subadmin"), adminController.deleteSubAdmin);
adminRoutes.post("/sub-admin/resend-login", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("resendlogindetails-subadmin"), adminController.resendLoginDetailsSubAdmin);
// Role
adminRoutes.get("/roles", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("view-role"), adminController.getRoles);
adminRoutes.post("/role/create", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("create-role"), adminController.createRole);
adminRoutes.put("/role/update", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("update-role"), adminController.updateRole);
adminRoutes.get("/role/view/permissions", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("view-role-permissions"), adminController.viewRolePermissions);
adminRoutes.post("/role/assign/permission", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("assign-role-permissions"), adminController.assignPermissionToRole);
adminRoutes.delete("/role/delete/permission", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("delete-role-permissions"), adminController.deletePermissionFromRole);
// Permission
adminRoutes.get("/permissions", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)("view-permission"), adminController.getPermissions);
adminRoutes.get("/permissions/me", adminAuthMiddleware_1.default, adminController.getMyPermissions);
// Subscription Plan
adminRoutes.get("/subscription/plans", adminAuthMiddleware_1.default, adminController.getAllSubscriptionPlans);
adminRoutes.post("/subscription/plan/create", adminAuthMiddleware_1.default, (0, validations_1.createSubscriptionPlanValidationRules)(), validations_1.validate, adminController.createSubscriptionPlan);
adminRoutes.put("/subscription/plan/update", adminAuthMiddleware_1.default, (0, validations_1.updateSubscriptionPlanValidationRules)(), validations_1.validate, adminController.updateSubscriptionPlan);
adminRoutes.delete("/subscription/plan/delete", adminAuthMiddleware_1.default, adminController.deleteSubscriptionPlan);
// Create a category
adminRoutes.post("/categories", adminAuthMiddleware_1.default, adminController.createCategory);
// Update a category
adminRoutes.put("/categories", adminAuthMiddleware_1.default, adminController.updateCategory);
// Delete a category
adminRoutes.delete("/categories", adminAuthMiddleware_1.default, adminController.deleteCategory);
// Fetch all categories
adminRoutes.get("/categories", adminAuthMiddleware_1.default, adminController.getAllCategories);
adminRoutes.get("/categories/sub/categories", adminAuthMiddleware_1.default, adminController.getCategoriesWithSubCategories);
adminRoutes.post("/sub/categories", adminAuthMiddleware_1.default, adminController.createSubCategory);
adminRoutes.put("/sub/categories", adminAuthMiddleware_1.default, adminController.updateSubCategory);
adminRoutes.delete("/sub/categories", adminAuthMiddleware_1.default, adminController.deleteSubCategory);
adminRoutes.get("/sub/categories", adminAuthMiddleware_1.default, adminController.getAllSubCategories);
// KYC
adminRoutes.get("/kyc", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_KYC), adminController.getAllKYC);
adminRoutes.post("/kyc/approve-reject", adminAuthMiddleware_1.default, (0, validations_1.validateKYCNotification)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_KYC), adminController.approveOrRejectKYC);
// Payment Gateway
adminRoutes.post("/payment-gateway", adminAuthMiddleware_1.default, (0, validations_1.validatePaymentGateway)(), validations_1.validate, adminController.createPaymentGateway);
adminRoutes.put("/payment-gateway", adminAuthMiddleware_1.default, (0, validations_1.validatePaymentGateway)(), validations_1.validate, adminController.updatePaymentGateway);
adminRoutes.delete("/payment-gateway", adminAuthMiddleware_1.default, adminController.deletePaymentGateway);
adminRoutes.get("/payment-gateways", adminAuthMiddleware_1.default, adminController.getAllPaymentGateways);
adminRoutes.get("/payment-gateway", adminAuthMiddleware_1.default, adminController.paymentGateway);
adminRoutes.patch("/payment-gateways/status", adminAuthMiddleware_1.default, adminController.setPaymentGatewayActive);
// Currency
adminRoutes.post("/currency", adminAuthMiddleware_1.default, adminController.addCurrency);
adminRoutes.put("/currency", adminAuthMiddleware_1.default, adminController.updateCurrency);
adminRoutes.delete("/currency", adminAuthMiddleware_1.default, adminController.deleteCurrency);
adminRoutes.get("/currencies", adminAuthMiddleware_1.default, adminController.getAllCurrencies);
// users
adminRoutes.get("/customers", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_CUSTOMERS), adminController.getAllCustomers);
adminRoutes.get("/vendors", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_VENDORS), adminController.getAllVendors);
adminRoutes.get("/user/details", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_CUSTOMERS), adminController.viewUser);
adminRoutes.patch("/toggle/user/status", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_CUSTOMERS), adminController.toggleUserStatus);
// Store
adminRoutes.get("/store", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_STORES), adminController.getStore);
adminRoutes.post("/store", adminAuthMiddleware_1.default, (0, validations_1.createStoreValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_STORES), adminController.createStore);
adminRoutes.put("/store", adminAuthMiddleware_1.default, (0, validations_1.updateStoreValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_STORES), adminController.updateStore);
adminRoutes.delete("/store", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_STORES), adminController.deleteStore);
// Product
adminRoutes.get("/products", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.fetchProducts);
adminRoutes.post("/products", adminAuthMiddleware_1.default, (0, validations_1.addProductValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.createProduct);
adminRoutes.put("/products", adminAuthMiddleware_1.default, (0, validations_1.updateProductValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.updateProduct);
adminRoutes.delete("/products", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.deleteProduct);
adminRoutes.get("/product", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.viewProduct);
adminRoutes.patch("/products/move-to-draft", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.moveToDraft);
adminRoutes.patch("/products/change-status", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.changeProductStatus);
// Auction Product
adminRoutes.get("/auction/products", adminAuthMiddleware_1.default, adminController.fetchAuctionProducts);
adminRoutes.post("/auction/products", adminAuthMiddleware_1.default, (0, validations_1.auctionProductValidation)(), validations_1.validate, adminController.createAuctionProduct);
adminRoutes.put("/auction/products", adminAuthMiddleware_1.default, (0, validations_1.updateAuctionProductValidation)(), validations_1.validate, adminController.updateAuctionProduct);
adminRoutes.delete("/auction/products", adminAuthMiddleware_1.default, adminController.deleteAuctionProduct);
adminRoutes.patch("/auction/products", adminAuthMiddleware_1.default, adminController.cancelAuctionProduct);
adminRoutes.get("/auction/product", adminAuthMiddleware_1.default, adminController.viewAuctionProduct);
adminRoutes.get("/auction/product/bidders", adminAuthMiddleware_1.default, adminController.getAllBidsByAuctionProductId);
// Orders
adminRoutes.get("/order/items", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getOrderItems);
adminRoutes.get("/order/item", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.viewOrderItem);
adminRoutes.get("/order/dropship/items", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getDropshipedOrderItemDetails);
adminRoutes.get("/order/dropship/tracking/info", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getDropshipOrderTrackingInfo);
adminRoutes.get("/order/item/details", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getOrderItemsInfo);
adminRoutes.post("/order/item/update/status", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_ORDERS), adminController.updateOrderStatus);
//General Store | Product | Auction Products | Adverts
adminRoutes.get("/general/stores", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_STORES), adminController.getGeneralStores);
adminRoutes.get("/general/store/view", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_STORES), adminController.viewGeneralStore);
adminRoutes.get("/general/products", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.getGeneralProducts);
adminRoutes.get("/general/product/view", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.viewGeneralProduct);
adminRoutes.delete("/general/product/delete", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.deleteGeneralProduct);
adminRoutes.put("/general/product/unpublished", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.unpublishProduct);
adminRoutes.put("/general/product/publish", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.publishProduct);
adminRoutes.get("/general/auction/products", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.getGeneralAuctionProducts);
adminRoutes.get("/general/auction/product/view", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.viewGeneralAuctionProduct);
adminRoutes.delete("/general/auction/product/delete", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PRODUCTS), adminController.deleteGeneralAuctionProduct);
adminRoutes.get("/general/auction/product/bidders", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PRODUCTS), adminController.getAllBiddersByAuctionProductId);
adminRoutes.get("/general/orders", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getAllGeneralOrders);
adminRoutes.get("/general/order/items", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getAllGeneralOrderItems);
adminRoutes.get("/general/order/payment", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ORDERS), adminController.getGeneralPaymentDetails);
adminRoutes.get("/general/adverts", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ADVERTS), adminController.getGeneralAdverts);
adminRoutes.get("/general/advert/view", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ADVERTS), adminController.viewGeneralAdvert);
// Subscribers
adminRoutes.get("/subscribers", adminAuthMiddleware_1.default, adminController.getAllSubscribers);
// Transactions
adminRoutes.get("/transactions", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_TRANSACTIONS), adminController.getTransactionsForAdmin);
// Adverts
adminRoutes.get("/active/products", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ADVERTS), adminController.activeProducts);
adminRoutes.post("/adverts", (0, validations_1.createAdvertValidation)(), validations_1.validate, adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_ADVERTS), adminController.createAdvert);
adminRoutes.put("/adverts", (0, validations_1.updateAdvertValidation)(), validations_1.validate, adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_ADVERTS), adminController.updateAdvert);
adminRoutes.get("/adverts", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ADVERTS), adminController.getAdverts);
adminRoutes.get("/advert", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_ADVERTS), adminController.viewAdvert);
adminRoutes.delete("/adverts", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_ADVERTS), adminController.deleteAdvert);
adminRoutes.post("/approved-reject/advert", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_ADVERTS), adminController.approveOrRejectAdvert);
// Testimonial
adminRoutes.post("/testimonial", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.createTestimonial);
adminRoutes.put("/testimonial", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.updateTestimonial);
adminRoutes.get("/testimonials", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getAllTestimonials);
adminRoutes.get("/testimonial", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getTestimonial);
adminRoutes.delete("/testimonial", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.deleteTestimonial);
// FAQ Category Routes
adminRoutes.post("/faq/category", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.createFaqCategory);
adminRoutes.get("/faq/categories", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getAllFaqCategories);
adminRoutes.get("/faq/category", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getFaqCategory);
adminRoutes.put("/faq/category", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.updateFaqCategory);
adminRoutes.delete("/faq/category", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.deleteFaqCategory);
// FAQ Routes
adminRoutes.post("/faq", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.createFaq);
adminRoutes.get("/faqs", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getAllFaqs);
adminRoutes.get("/faq", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getFaq);
adminRoutes.put("/faq", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.updateFaq);
adminRoutes.delete("/faq", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.deleteFaq);
// Contact Us Form
adminRoutes.get("/contact/us/forms", adminAuthMiddleware_1.default, adminController.getAllContacts);
adminRoutes.get("/contact/us/form", adminAuthMiddleware_1.default, adminController.getContactById);
adminRoutes.delete("/contact/us/form", adminAuthMiddleware_1.default, adminController.deleteContactById);
// Job
adminRoutes.post("/job/post", adminAuthMiddleware_1.default, (0, validations_1.postJobValidationRules)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_JOBS), adminController.postJob);
adminRoutes.put("/job/update", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_JOBS), adminController.updateJob);
adminRoutes.get("/jobs", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_JOBS), adminController.getJobs);
adminRoutes.get("/job", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_JOBS), adminController.getJobById);
adminRoutes.patch("/job/close", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_JOBS), adminController.closeJob);
adminRoutes.delete("/job/delete", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_JOBS), adminController.deleteJob);
adminRoutes.post("/job/repost", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_JOBS), adminController.repostJob);
adminRoutes.get("/job/applicants", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_JOBS), adminController.getJobApplicants);
adminRoutes.get("/job/view/applicant", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_JOBS), adminController.viewApplicant);
adminRoutes.get("/job/download/applicant/resume", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_JOBS), adminController.downloadApplicantResume);
// Withdrawals
adminRoutes.post("/withdrawal/update/status", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_WITHDRAWALS), adminController.updateWithdrawalStatus);
adminRoutes.get("/payout/reports", adminAuthMiddleware_1.default, adminController.getVendorPayoutReports);
adminRoutes.get("/payout/stats", adminAuthMiddleware_1.default, adminController.getOverallPayoutStats);
adminRoutes.get("/earnings/reports", adminAuthMiddleware_1.default, adminController.getVendorEarningsReport);
adminRoutes.get("/withdrawals", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_WITHDRAWALS), adminController.getWithdrawals);
adminRoutes.get("/withdrawal", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_WITHDRAWALS), adminController.getWithdrawalById);
// BANNER Routes
adminRoutes.post("/banner", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.createBanner);
adminRoutes.get("/banners", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getAllBanners);
adminRoutes.get("/banner", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_PAGES), adminController.getBanner);
adminRoutes.put("/banner", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.updateBanner);
adminRoutes.delete("/banner", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_PAGES), adminController.deleteBanner);
// Admin notifications
adminRoutes.get("/notifications", adminAuthMiddleware_1.default, (0, validations_1.paginationQueryParamsValidation)(), validations_1.validate, adminController_1.getAdminNotifications);
adminRoutes.patch("/notifications/:id/read", adminAuthMiddleware_1.default, adminController_1.markAdminNotificationAsRead);
adminRoutes.post("/product/charges", (0, validations_1.productChargeValidation)(), validations_1.validate, adminAuthMiddleware_1.default, adminController.createProductCharge);
adminRoutes.put("/product/charges/:id", (0, validations_1.productChargeValidation)(), validations_1.validate, adminAuthMiddleware_1.default, adminController.updateProductCharge);
adminRoutes.get("/product/charges", adminAuthMiddleware_1.default, adminController.getAllProductCharges);
adminRoutes.delete("/product/charges/:id", adminAuthMiddleware_1.default, adminController.deleteProductCharge);
adminRoutes.patch("/product/charges/:id/status/activate", adminAuthMiddleware_1.default, adminController.markProductChargeAsActive);
adminRoutes.patch("/product/charges/:id/status/deactivate", adminAuthMiddleware_1.default, adminController.markProductChargeAsInactive);
adminRoutes.post("/service/categories", adminAuthMiddleware_1.default, (0, validations_1.ServiceCategoryValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.createServiceCategory);
adminRoutes.put("/service/categories/:id", adminAuthMiddleware_1.default, (0, validations_1.ServiceIdValidation)(), (0, validations_1.ServiceCategoryValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.updateServiceCategory);
adminRoutes.get("/service/categories", adminAuthMiddleware_1.default, (0, validations_1.paginationQueryParamsValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_SERVICES), adminController.getAllServiceCategories);
adminRoutes.delete("/service/categories/:id", adminAuthMiddleware_1.default, (0, validations_1.ServiceIdValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.deleteServiceCategory);
adminRoutes.post("/service/subcategories", adminAuthMiddleware_1.default, (0, validations_1.ServiceSubCategoryValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.createServiceSubCategory);
adminRoutes.put("/service/subcategories/:id", adminAuthMiddleware_1.default, (0, validations_1.ServiceIdValidation)(), (0, validations_1.ServiceSubCategoryValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.updateServiceSubCategory);
adminRoutes.get("/service/subcategories/:id", adminAuthMiddleware_1.default, (0, validations_1.ServiceIdValidation)(), (0, validations_1.paginationQueryParamsValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_SERVICES), adminController.getAllServiceSubCategories);
adminRoutes.delete("/service/subcategories/:id", adminAuthMiddleware_1.default, (0, validations_1.ServiceIdValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.deleteServiceSubCategory);
adminRoutes.post("/service/attributes", adminAuthMiddleware_1.default, (0, validations_1.CreateServiceAttributeValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.createServiceAttribute);
adminRoutes.delete("/service/attributes/:id", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.deleteServiceAttribute);
adminRoutes.post("/service/attributes/:attributeId/options", adminAuthMiddleware_1.default, (0, validations_1.AddServiceAttributeOptionsValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.addAttributeOptions);
adminRoutes.get("/service/attributes", adminAuthMiddleware_1.default, (0, validations_1.paginationQueryParamsValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.VIEW_SERVICES), adminController.getAllServiceAttributes);
adminRoutes.delete("/service/attributes/options/:optionId", adminAuthMiddleware_1.default, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.deleteAttributeOption);
adminRoutes.post("/service/categories/:categoryId/attributes", adminAuthMiddleware_1.default, (0, validations_1.AddServiceCategoryToAttributeValidation)(), validations_1.validate, (0, checkPermissionMiddleware_1.default)(permissions_1.PERMISSIONS.MANAGE_SERVICES), adminController.addAttributeToServiceCategory);
adminRoutes.get("/service/categories/:categoryId/attributes", adminAuthMiddleware_1.default, (0, validations_1.paginationQueryParamsValidation)(), validations_1.validate, homeController.getAttributesForServiceCategory);
adminRoutes.delete("/service/categories/:categoryId/attributes", adminAuthMiddleware_1.default, (0, validations_1.RemoveServiceCategoryFromAttributeValidation)(), validations_1.validate, adminController.removeAttributeFromServiceCategory);
adminRoutes.post("/service/:serviceId/suspend", (0, validations_1.validateUUIDParam)("serviceId"), validations_1.validate, adminAuthMiddleware_1.default, adminController.suspendService);
adminRoutes.post("/service/:serviceId/activate", (0, validations_1.validateUUIDParam)("serviceId"), validations_1.validate, adminAuthMiddleware_1.default, adminController.activateService);
adminRoutes.get("/services", adminAuthMiddleware_1.default, (0, validations_1.paginationQueryParamsValidation)(), validations_1.validate, adminController.getAllServices);
adminRoutes.get("/services/:serviceId", adminAuthMiddleware_1.default, (0, validations_1.validateUUIDParam)("serviceId"), validations_1.validate, adminController.getServiceById);
adminRoutes.get("/aliexpress/categories", adminAuthMiddleware_1.default, adminController.getAliExpressCategories);
adminRoutes.get("/aliexpress/products", adminAuthMiddleware_1.default, adminController.getAliExpressProducts);
adminRoutes.get("/aliexpress/products/:productId/details", adminAuthMiddleware_1.default, adminController.getAliExpressProductDetails);
adminRoutes.post("/aliexpress/products/import", adminAuthMiddleware_1.default, (0, validations_1.addAliexpressProductValidation)(), validations_1.validate, adminController.addAliexpressProductToInventory);
adminRoutes.get("/aliexpress/credentials/status", adminAuthMiddleware_1.default, adminController.getAliExpressDropshipCredsStatus);
// Product offer routes
adminRoutes.get("/offers", adminAuthMiddleware_1.default, adminController.getAllOffers);
adminRoutes.put("/offers/:offerId", adminAuthMiddleware_1.default, adminController.respondToOffer);
exports.default = adminRoutes; // Export the router
//# sourceMappingURL=adminRoute.js.map