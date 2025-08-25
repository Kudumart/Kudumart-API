// src/routes/userRoute.ts
import { Router } from "express";
import * as vendorController from "../controllers/vendorController";
import authMiddleware from "../middlewares/authMiddleware";
import authorizeVendor from "../middlewares/authorizeVendor";
import {
	kycValidationRules,
	createStoreValidation,
	updateStoreValidation,
	addProductValidation,
	updateProductValidation,
	auctionProductValidation,
	updateAuctionProductValidation,
	createAdvertValidation,
	updateAdvertValidation,
	validate,
	ServiceValidation,
	ServiceIdValidation,
	validateUUIDParam,
	paginationQueryParamsValidation,
} from "../utils/validations";

const vendorRoutes = Router();

// User routes
vendorRoutes.post(
	"/kyc",
	authMiddleware,
	authorizeVendor,
	kycValidationRules(),
	validate,
	vendorController.submitOrUpdateKYC,
);
vendorRoutes.get("/kyc", authMiddleware, vendorController.getKYC);

// Store
vendorRoutes.get("/store", authMiddleware, vendorController.getStore);
vendorRoutes.get("/view/store", authMiddleware, vendorController.viewStore);
vendorRoutes.post(
	"/store",
	authMiddleware,
	authorizeVendor,
	createStoreValidation(),
	validate,
	vendorController.createStore,
);
vendorRoutes.put(
	"/store",
	authMiddleware,
	authorizeVendor,
	updateStoreValidation(),
	validate,
	vendorController.updateStore,
);
vendorRoutes.delete(
	"/store",
	authMiddleware,
	authorizeVendor,
	vendorController.deleteStore,
);

// Product
vendorRoutes.get(
	"/vendors/products",
	authMiddleware,
	vendorController.fetchVendorProducts,
);
vendorRoutes.post(
	"/products",
	authMiddleware,
	authorizeVendor,
	addProductValidation(),
	validate,
	vendorController.createProduct,
);
vendorRoutes.put(
	"/products",
	authMiddleware,
	authorizeVendor,
	updateProductValidation(),
	validate,
	vendorController.updateProduct,
);
vendorRoutes.delete(
	"/products",
	authMiddleware,
	authorizeVendor,
	vendorController.deleteProduct,
);
vendorRoutes.get(
	"/product",
	authMiddleware,
	authorizeVendor,
	vendorController.viewProduct,
);
vendorRoutes.patch(
	"/products/move-to-draft",
	authMiddleware,
	authorizeVendor,
	vendorController.moveToDraft,
);
vendorRoutes.patch(
	"/products/change-status",
	authMiddleware,
	authorizeVendor,
	vendorController.changeProductStatus,
);

// Auction Product
vendorRoutes.get(
	"/auction/products",
	authMiddleware,
	authorizeVendor,
	vendorController.fetchVendorAuctionProducts,
);
vendorRoutes.post(
	"/auction/products",
	authMiddleware,
	authorizeVendor,
	auctionProductValidation(),
	validate,
	vendorController.createAuctionProduct,
);
vendorRoutes.put(
	"/auction/products",
	authMiddleware,
	authorizeVendor,
	updateAuctionProductValidation(),
	validate,
	vendorController.updateAuctionProduct,
);
vendorRoutes.delete(
	"/auction/products",
	authMiddleware,
	authorizeVendor,
	vendorController.deleteAuctionProduct,
);
vendorRoutes.patch(
	"/auction/products",
	authMiddleware,
	authorizeVendor,
	vendorController.cancelAuctionProduct,
);
vendorRoutes.get(
	"/auction/product",
	authMiddleware,
	authorizeVendor,
	vendorController.viewAuctionProduct,
);
vendorRoutes.get(
	"/auction/product/bidders",
	authMiddleware,
	authorizeVendor,
	vendorController.getAllBidsByAuctionProductId,
);

// Subscription
vendorRoutes.get(
	"/subscription/plans",
	authMiddleware,
	authorizeVendor,
	vendorController.subscriptionPlans,
);
vendorRoutes.post(
	"/subscribe",
	authMiddleware,
	authorizeVendor,
	vendorController.subscribe,
);
vendorRoutes.post(
	"/subscribe/dollar",
	authMiddleware,
	authorizeVendor,
	vendorController.subscribeDollar,
);
vendorRoutes.delete(
	"/subscription/cancel",
	authMiddleware,
	authorizeVendor,
	vendorController.cancelSubscription,
);

vendorRoutes.get(
	"/verifyCAC",
	authMiddleware,
	authorizeVendor,
	vendorController.verifyCAC,
);

vendorRoutes.get(
	"/currencies",
	authMiddleware,
	authorizeVendor,
	vendorController.getAllCurrencies,
);
vendorRoutes.get(
	"/categories",
	authMiddleware,
	authorizeVendor,
	vendorController.getAllSubCategories,
);

vendorRoutes.get(
	"/order/items",
	authMiddleware,
	vendorController.getVendorOrderItems,
);
vendorRoutes.get(
	"/order/item/details",
	authMiddleware,
	vendorController.getOrderItemsInfo,
);

// Adverts
vendorRoutes.get(
	"/active/products",
	authMiddleware,
	vendorController.activeProducts,
); // Create a new advert
vendorRoutes.post(
	"/adverts",
	createAdvertValidation(),
	validate,
	authMiddleware,
	vendorController.createAdvert,
); // Create a new advert
vendorRoutes.put(
	"/adverts",
	updateAdvertValidation(),
	validate,
	authMiddleware,
	vendorController.updateAdvert,
); // Update an existing advert
vendorRoutes.get("/adverts", authMiddleware, vendorController.getAdverts); // Get adverts
vendorRoutes.get("/advert", authMiddleware, vendorController.viewAdvert); // View a specific advert
vendorRoutes.delete("/adverts", authMiddleware, vendorController.deleteAdvert); // Delete an advert

// Bank Information
vendorRoutes.post(
	"/bank/informations",
	authMiddleware,
	vendorController.addBankInformation,
);
vendorRoutes.put(
	"/bank/informations",
	authMiddleware,
	vendorController.updateBankInformation,
);
vendorRoutes.get(
	"/bank/informations",
	authMiddleware,
	vendorController.getBankInformation,
);
vendorRoutes.get(
	"/bank/information",
	authMiddleware,
	vendorController.getSingleBankInformation,
);
vendorRoutes.delete(
	"/bank/information",
	authMiddleware,
	vendorController.deleteBankInformation,
);

// Withdrawals
vendorRoutes.post(
	"/withdrawal",
	authMiddleware,
	vendorController.requestWithdrawal,
);
vendorRoutes.put(
	"/withdrawal",
	authMiddleware,
	vendorController.updateWithdrawal,
);
vendorRoutes.get(
	"/withdrawals",
	authMiddleware,
	vendorController.getWithdrawals,
);
vendorRoutes.get(
	"/withdrawal",
	authMiddleware,
	vendorController.getWithdrawalById,
);

// Services
vendorRoutes.post(
	"/services",
	ServiceValidation(),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.createService,
);

vendorRoutes.put(
	"/services/:serviceId",
	ServiceValidation(),
	validateUUIDParam("serviceId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.updateService,
);

vendorRoutes.get(
	"/services/:serviceId",
	validateUUIDParam("serviceId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.getService,
);

vendorRoutes.get(
	"/services",
	paginationQueryParamsValidation(),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.getVendorServices,
);

vendorRoutes.delete(
	"/services/:serviceId",
	validateUUIDParam("serviceId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.deleteService,
);

vendorRoutes.patch(
	"/services/:serviceId/publish",
	validateUUIDParam("serviceId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.publishService,
);

vendorRoutes.patch(
	"/services/:serviceId/unpublish",
	validateUUIDParam("serviceId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.unpublishService,
);

vendorRoutes.get(
	"/service/bookings",
	paginationQueryParamsValidation(),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.getServiceBookings,
);

vendorRoutes.patch(
	"/service/bookings/:bookingId/confirm",
	validateUUIDParam("bookingId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.markServiceBookingAsConfirmed,
);

vendorRoutes.patch(
	"/service/bookings/:bookingId/cancel",
	validateUUIDParam("bookingId"),
	validate,
	authMiddleware,
	authorizeVendor,
	vendorController.markServiceBookingAsCancelled,
);

export default vendorRoutes;
