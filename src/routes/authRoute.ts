// src/routes/authroute.ts
import { Router } from "express";
import passport from "passport";
import * as authController from "../controllers/authController";
import * as homeController from "../controllers/homeController";
import {
	registrationValidationRules,
	verificationValidationRules,
	loginValidationRules,
	resendVerificationValidationRules,
	forgotPasswordValidationRules,
	resetPasswordValidationRules,
	validate,
	verificationTokenValidationRules,
	paginationQueryParamsValidation,
	ServiceIdValidation,
} from "../utils/validations"; // Import the service
import authMiddleware from "../middlewares/authMiddleware";

const authRoutes = Router();

// Auth routes
authRoutes.get("/", authController.index);
authRoutes.post(
	"/auth/register/vendor",
	registrationValidationRules(),
	validate,
	authController.vendorRegister,
);
authRoutes.post(
	"/auth/register/customer",
	registrationValidationRules(),
	validate,
	authController.customerRegister,
);
authRoutes.post(
	"/auth/verify/email",
	verificationValidationRules(),
	validate,
	authController.verifyEmail,
);
authRoutes.post(
	"/auth/verify/email-token",
	verificationTokenValidationRules(),
	validate,
	authController.verifyEmailWithToken,
);
authRoutes.post(
	"/auth/login",
	loginValidationRules(),
	validate,
	authController.login,
);
authRoutes.post(
	"/auth/resend/verification/email",
	resendVerificationValidationRules(),
	validate,
	authController.resendVerificationEmail,
);
authRoutes.post(
	"/auth/password/forgot",
	forgotPasswordValidationRules(),
	validate,
	authController.forgetPassword,
);
authRoutes.post(
	"/auth/password/code/check",
	verificationValidationRules(),
	validate,
	authController.codeCheck,
);
authRoutes.post(
	"/auth/password/reset",
	resetPasswordValidationRules(),
	validate,
	authController.resetPassword,
);

// Facebook Authentication
authRoutes.get(
	"/auth/facebook",
	passport.authenticate("facebook", { scope: ["email"] }),
);
authRoutes.get(
	"/auth/facebook/callback",
	passport.authenticate("facebook", { session: false }),
	authController.socialAuthCallback,
);

// Google Authentication
authRoutes.get("/auth/google", authController.googleAuth);
authRoutes.get(
	"/auth/google/callback",
	passport.authenticate("google", { session: false }),
	authController.socialAuthCallback,
);
authRoutes.post("/auth/google", authController.handleGoogleAuth);

// Admin
authRoutes.post(
	"/auth/admin/login",
	loginValidationRules(),
	validate,
	authController.adminLogin,
);

// Frontend
authRoutes.get("/categories", homeController.getAllCategories); // Fetch categories with subcategories
authRoutes.get(
	"/category/sub-categories",
	homeController.getCategorySubCategories,
); // Fetch categories with subcategories
authRoutes.get(
	"/categories/with/sub-categories",
	homeController.getCategoriesWithSubcategories,
); // Fetch categories with subcategories
authRoutes.get("/products", homeController.products);
authRoutes.get("/product", homeController.getProductById); // Fetch a single product by ID
authRoutes.get("/stores", homeController.getAllStores);
authRoutes.get("/store/products", homeController.getStoreProducts); // Fetch a single product by ID
authRoutes.get("/auction/products", homeController.getAuctionProducts);
authRoutes.get(
	"/auction/product",
	authMiddleware,
	homeController.getAuctionProductById,
); // Fetch a single product by ID

authRoutes.get("/adverts", homeController.getAdverts);
authRoutes.get("/advert", homeController.viewAdvert);

authRoutes.get("/testimonials", homeController.getAllTestimonials); // Get all testimonials

authRoutes.get(
	"/faq/categories/with/faqs",
	homeController.getFaqCategoryWithFaqs,
);

authRoutes.post("/submit/contact/form", homeController.submitContactForm); // Get all testimonials

authRoutes.get("/fetch/jobs", homeController.fetchJobs);
authRoutes.get("/view/job", homeController.viewJob);
authRoutes.post("/apply/job", homeController.applyJob);

authRoutes.get("/banners", homeController.getAllBanners); // Get all banners

authRoutes.post("/create-payment-intent", homeController.createPaymentIntent);

authRoutes.get(
	"/service/categories",
	paginationQueryParamsValidation(),
	validate,
	homeController.getAllServiceCategories,
);

authRoutes.get(
	"/service/subcategories/:id",
	ServiceIdValidation(),
	paginationQueryParamsValidation(),
	validate,
	homeController.getAllServiceSubCategories,
);

export default authRoutes; // Export the router
