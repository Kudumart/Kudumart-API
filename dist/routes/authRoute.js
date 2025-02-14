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
// src/routes/authroute.ts
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController = __importStar(require("../controllers/authController"));
const homeController = __importStar(require("../controllers/homeController"));
const validations_1 = require("../utils/validations"); // Import the service
const authRoutes = (0, express_1.Router)();
// Auth routes
authRoutes.get("/", authController.index);
authRoutes.post("/auth/register/vendor", (0, validations_1.registrationValidationRules)(), validations_1.validate, authController.vendorRegister);
authRoutes.post("/auth/register/customer", (0, validations_1.registrationValidationRules)(), validations_1.validate, authController.customerRegister);
authRoutes.post("/auth/verify/email", (0, validations_1.verificationValidationRules)(), validations_1.validate, authController.verifyEmail);
authRoutes.post("/auth/login", (0, validations_1.loginValidationRules)(), validations_1.validate, authController.login);
authRoutes.post("/auth/resend/verification/email", (0, validations_1.resendVerificationValidationRules)(), validations_1.validate, authController.resendVerificationEmail);
authRoutes.post("/auth/password/forgot", (0, validations_1.forgotPasswordValidationRules)(), validations_1.validate, authController.forgetPassword);
authRoutes.post("/auth/password/code/check", (0, validations_1.verificationValidationRules)(), validations_1.validate, authController.codeCheck);
authRoutes.post("/auth/password/reset", (0, validations_1.resetPasswordValidationRules)(), validations_1.validate, authController.resetPassword);
// Facebook Authentication
authRoutes.get('/auth/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
authRoutes.get('/auth/facebook/callback', passport_1.default.authenticate('facebook', { session: false }), authController.socialAuthCallback);
// Google Authentication
authRoutes.get('/auth/google', authController.googleAuth);
authRoutes.get('/auth/google/callback', passport_1.default.authenticate('google', { session: false }), authController.socialAuthCallback);
authRoutes.post('/auth/google', authController.handleGoogleAuth);
// Admin
authRoutes.post("/auth/admin/login", (0, validations_1.loginValidationRules)(), validations_1.validate, authController.adminLogin);
// Frontend
authRoutes.get('/categories', homeController.getAllCategories); // Fetch categories with subcategories
authRoutes.get('/category/sub-categories', homeController.getCategorySubCategories); // Fetch categories with subcategories
authRoutes.get('/categories/with/sub-categories', homeController.getCategoriesWithSubcategories); // Fetch categories with subcategories
authRoutes.get("/products", homeController.products);
authRoutes.get('/product', homeController.getProductById); // Fetch a single product by ID
authRoutes.get("/stores", homeController.getAllStores);
authRoutes.get('/store/products', homeController.getStoreProducts); // Fetch a single product by ID
authRoutes.get("/auction/products", homeController.getUpcomingAuctionProducts);
authRoutes.get('/auction/product', homeController.getAuctionProductById); // Fetch a single product by ID
authRoutes.get('/adverts', homeController.getAdverts);
authRoutes.get('/advert', homeController.viewAdvert);
authRoutes.get("/testimonials", homeController.getAllTestimonials); // Get all testimonials
authRoutes.get("/faq/categories/with/faqs", homeController.getFaqCategoryWithFaqs);
authRoutes.post("/submit/contact/form", homeController.submitContactForm); // Get all testimonials
authRoutes.get("/fetch/jobs", homeController.fetchJobs);
authRoutes.get("/view/job", homeController.viewJob);
authRoutes.post('/apply/job', homeController.applyJob);
exports.default = authRoutes; // Export the router
//# sourceMappingURL=authRoute.js.map