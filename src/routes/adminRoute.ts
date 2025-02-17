// src/routes/adminRoute.ts
import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware';
import { 
    adminUpdateProfileValidationRules, 
    updatePasswordValidationRules, 
    createSubAdminValidationRules, 
    updateSubAdminValidationRules, 
    createSubscriptionPlanValidationRules, 
    updateSubscriptionPlanValidationRules,
    validateKYCNotification,
    validatePaymentGateway,
    createStoreValidation,
    updateStoreValidation,
    addProductValidation,
    updateProductValidation,
    auctionProductValidation,
    createAdvertValidation,
    updateAdvertValidation,
    postJobValidationRules,
    validate,
    updateAuctionProductValidation } from '../utils/validations'; // Import the service
import checkPermission from '../middlewares/checkPermissionMiddleware';
import { updateAuctionProduct } from '../controllers/vendorController';

const adminRoutes = Router();

// User routes
adminRoutes.get("/logout", adminAuthMiddleware, adminController.logout);
adminRoutes.put('/profile/update', adminAuthMiddleware, adminUpdateProfileValidationRules(), validate, checkPermission('update-profile'), adminController.updateProfile);
adminRoutes.put('/profile/update/password', adminAuthMiddleware, updatePasswordValidationRules(), validate, checkPermission('update-password'), adminController.updatePassword);

// Sub Admin
adminRoutes.get('/sub-admins', adminAuthMiddleware, checkPermission('view-subadmin'), adminController.subAdmins);
adminRoutes.post('/sub-admin/create', adminAuthMiddleware, createSubAdminValidationRules(), validate, checkPermission('create-subadmin'), adminController.createSubAdmin);
adminRoutes.put('/sub-admin/update', adminAuthMiddleware, updateSubAdminValidationRules(), validate, checkPermission('update-subadmin'), adminController.updateSubAdmin);
adminRoutes.patch('/sub-admin/status', adminAuthMiddleware, checkPermission('activateanddeactivate-subadmin'), adminController.deactivateOrActivateSubAdmin);
adminRoutes.delete('/sub-admin/delete', adminAuthMiddleware, checkPermission('delete-subadmin'), adminController.deleteSubAdmin);
adminRoutes.post('/sub-admin/resend-login', adminAuthMiddleware, checkPermission('resendlogindetails-subadmin'), adminController.resendLoginDetailsSubAdmin);

// Role
adminRoutes.get('/roles', adminAuthMiddleware, checkPermission('view-role'), adminController.getRoles);
adminRoutes.post('/role/create', adminAuthMiddleware, checkPermission('create-role'), adminController.createRole);
adminRoutes.put('/role/update', adminAuthMiddleware, checkPermission('update-role'), adminController.updateRole);
adminRoutes.get('/role/view/permissions', adminAuthMiddleware, checkPermission('view-role-permissions'), adminController.viewRolePermissions);
adminRoutes.post('/role/assign/permission', adminAuthMiddleware, checkPermission('assign-role-permissions'), adminController.assignPermissionToRole);
adminRoutes.delete('/role/delete/permission', adminAuthMiddleware, checkPermission('delete-role-permissions'), adminController.deletePermissionFromRole);

// Permission
adminRoutes.get('/permissions', adminAuthMiddleware, checkPermission('view-permission'), adminController.getPermissions);
adminRoutes.post('/permission/create', adminAuthMiddleware, checkPermission('create-permission'), adminController.createPermission);
adminRoutes.put('/permission/update', adminAuthMiddleware, checkPermission('update-permission'), adminController.updatePermission);
adminRoutes.delete('/permission/delete', adminAuthMiddleware, checkPermission('delete-permission'), adminController.deletePermission);

// Subscription Plan
adminRoutes.get('/subscription/plans', adminAuthMiddleware, adminController.getAllSubscriptionPlans);
adminRoutes.post('/subscription/plan/create', adminAuthMiddleware, createSubscriptionPlanValidationRules(), validate, adminController.createSubscriptionPlan);
adminRoutes.put('/subscription/plan/update', adminAuthMiddleware, updateSubscriptionPlanValidationRules(), validate, adminController.updateSubscriptionPlan);
adminRoutes.delete('/subscription/plan/delete', adminAuthMiddleware, adminController.deleteSubscriptionPlan);

// Create a category
adminRoutes.post('/categories', adminAuthMiddleware, adminController.createCategory);
// Update a category
adminRoutes.put('/categories', adminAuthMiddleware, adminController.updateCategory);
// Delete a category
adminRoutes.delete('/categories', adminAuthMiddleware, adminController.deleteCategory);
// Fetch all categories
adminRoutes.get('/categories', adminAuthMiddleware, adminController.getAllCategories);
adminRoutes.get('/categories/sub/categories', adminAuthMiddleware, adminController.getCategoriesWithSubCategories);

adminRoutes.post('/sub/categories', adminAuthMiddleware, adminController.createSubCategory);
adminRoutes.put('/sub/categories', adminAuthMiddleware, adminController.updateSubCategory);
adminRoutes.delete('/sub/categories', adminAuthMiddleware, adminController.deleteSubCategory);
adminRoutes.get('/sub/categories', adminAuthMiddleware, adminController.getAllSubCategories);

// KYC
adminRoutes.get('/kyc', adminAuthMiddleware, adminController.getAllKYC);
adminRoutes.post('/kyc/approve-reject', adminAuthMiddleware, validateKYCNotification(), validate, adminController.approveOrRejectKYC);

// Payment Gateway
adminRoutes.post('/payment-gateway', adminAuthMiddleware, validatePaymentGateway(), validate, adminController.createPaymentGateway);
adminRoutes.put('/payment-gateway', adminAuthMiddleware, validatePaymentGateway(), validate, adminController.updatePaymentGateway);
adminRoutes.delete('/payment-gateway', adminAuthMiddleware, adminController.deletePaymentGateway);
adminRoutes.get('/payment-gateways', adminAuthMiddleware, adminController.getAllPaymentGateways);
adminRoutes.patch('/payment-gateways/status', adminAuthMiddleware, adminController.setPaymentGatewayActive);

// Currency
adminRoutes.post('/currency', adminAuthMiddleware, adminController.addCurrency);
adminRoutes.put('/currency', adminAuthMiddleware, adminController.updateCurrency);
adminRoutes.delete('/currency', adminAuthMiddleware, adminController.deleteCurrency);
adminRoutes.get('/currencies', adminAuthMiddleware, adminController.getAllCurrencies);

// users
adminRoutes.get('/customers', adminAuthMiddleware, adminController.getAllCustomers);
adminRoutes.get('/vendors', adminAuthMiddleware, adminController.getAllVendors);
adminRoutes.get('/user/details', adminAuthMiddleware, adminController.viewUser);
adminRoutes.patch('/toggle/user/status', adminAuthMiddleware, adminController.toggleUserStatus);

// Store
adminRoutes.get("/store", adminAuthMiddleware, adminController.getStore);
adminRoutes.post("/store", adminAuthMiddleware, createStoreValidation(), validate, adminController.createStore);
adminRoutes.put("/store", adminAuthMiddleware, updateStoreValidation(), validate, adminController.updateStore);
adminRoutes.delete("/store", adminAuthMiddleware, adminController.deleteStore);

// Product
adminRoutes.get("/products", adminAuthMiddleware, adminController.fetchProducts);
adminRoutes.post("/products", adminAuthMiddleware, addProductValidation(), validate, adminController.createProduct);
adminRoutes.put("/products", adminAuthMiddleware, updateProductValidation(), validate, adminController.updateProduct);
adminRoutes.delete("/products", adminAuthMiddleware, adminController.deleteProduct);
adminRoutes.get("/product", adminAuthMiddleware, adminController.viewProduct);
adminRoutes.patch("/products/move-to-draft", adminAuthMiddleware, adminController.moveToDraft);
adminRoutes.patch("/products/change-status", adminAuthMiddleware, adminController.changeProductStatus);

// Auction Product
adminRoutes.get("/auction/products", adminAuthMiddleware, adminController.fetchAuctionProducts);
adminRoutes.post("/auction/products", adminAuthMiddleware, auctionProductValidation(), validate, adminController.createAuctionProduct);
adminRoutes.put("/auction/products", adminAuthMiddleware, updateAuctionProductValidation(), validate, adminController.updateAuctionProduct);
adminRoutes.delete("/auction/products", adminAuthMiddleware, adminController.deleteAuctionProduct);
adminRoutes.patch("/auction/products", adminAuthMiddleware, adminController.cancelAuctionProduct);
adminRoutes.get("/auction/product", adminAuthMiddleware, adminController.viewAuctionProduct);

// Orders
adminRoutes.get("/order/items", adminAuthMiddleware, adminController.getOrderItems);
adminRoutes.get("/order/item/details", adminAuthMiddleware, adminController.getOrderItemsInfo);

//General Store | Product | Auction Products | Adverts
adminRoutes.get("/general/stores", adminAuthMiddleware, adminController.getGeneralStores);
adminRoutes.get("/general/store/view", adminAuthMiddleware, adminController.viewGeneralStore);
adminRoutes.get("/general/products", adminAuthMiddleware, adminController.getGeneralProducts);
adminRoutes.get("/general/product/view", adminAuthMiddleware, adminController.viewGeneralProduct);
adminRoutes.delete("/general/product/delete", adminAuthMiddleware, adminController.deleteGeneralProduct);
adminRoutes.put("/general/product/unpublished", adminAuthMiddleware, adminController.unpublishProduct);
adminRoutes.put("/general/product/publish", adminAuthMiddleware, adminController.publishProduct);
adminRoutes.get("/general/auction/products", adminAuthMiddleware, adminController.getGeneralAuctionProducts);
adminRoutes.get("/general/auction/product/view", adminAuthMiddleware, adminController.viewGeneralAuctionProduct);
adminRoutes.delete("/general/auction/product/delete", adminAuthMiddleware, adminController.deleteGeneralAuctionProduct);
adminRoutes.get("/general/orders", adminAuthMiddleware, adminController.getAllGeneralOrders);
adminRoutes.get("/general/order/items", adminAuthMiddleware, adminController.getAllGeneralOrderItems);
adminRoutes.get("/general/order/payment", adminAuthMiddleware, adminController.getGeneralPaymentDetails);
adminRoutes.get("/general/adverts", adminAuthMiddleware, adminController.getGeneralAdverts);
adminRoutes.get("/general/advert/view", adminAuthMiddleware, adminController.viewGeneralAdvert);

// Subscribers
adminRoutes.get("/subscribers", adminAuthMiddleware, adminController.getAllSubscribers);

// Transactions
adminRoutes.get("/transactions", adminAuthMiddleware, adminController.getTransactionsForAdmin);

// Adverts
adminRoutes.get("/active/products", adminAuthMiddleware, adminController.activeProducts); // Create a new advert
adminRoutes.post("/adverts", createAdvertValidation(), validate, adminAuthMiddleware, adminController.createAdvert); // Create a new advert
adminRoutes.put("/adverts", updateAdvertValidation(), validate, adminAuthMiddleware, adminController.updateAdvert); // Update an existing advert
adminRoutes.get("/adverts", adminAuthMiddleware, adminController.getAdverts); // Get adverts
adminRoutes.get("/advert", adminAuthMiddleware, adminController.viewAdvert); // View a specific advert
adminRoutes.delete("/adverts", adminAuthMiddleware, adminController.deleteAdvert); // Delete an advert
adminRoutes.post("/approved-reject/advert", adminAuthMiddleware, adminController.approveOrRejectAdvert);

// Testimonial
adminRoutes.post("/testimonial", adminAuthMiddleware, adminController.createTestimonial); // Create a new testimonial
adminRoutes.put("/testimonial", adminAuthMiddleware, adminController.updateTestimonial); // Update a testimonial
adminRoutes.get("/testimonials", adminAuthMiddleware, adminController.getAllTestimonials); // Get all testimonials
adminRoutes.get("/testimonial", adminAuthMiddleware, adminController.getTestimonial); // Get a single testimonial
adminRoutes.delete("/testimonial", adminAuthMiddleware, adminController.deleteTestimonial); // Delete a testimonial

// FAQ Category Routes
adminRoutes.post("/faq/category", adminAuthMiddleware, adminController.createFaqCategory);
adminRoutes.get("/faq/categories", adminAuthMiddleware, adminController.getAllFaqCategories);
adminRoutes.get("/faq/category", adminAuthMiddleware, adminController.getFaqCategory);
adminRoutes.put("/faq/category", adminAuthMiddleware, adminController.updateFaqCategory);
adminRoutes.delete("/faq/category", adminAuthMiddleware, adminController.deleteFaqCategory);

// FAQ Routes
adminRoutes.post("/faq", adminAuthMiddleware, adminController.createFaq);
adminRoutes.get("/faqs", adminAuthMiddleware, adminController.getAllFaqs);
adminRoutes.get("/faq",adminAuthMiddleware, adminController.getFaq);
adminRoutes.put("/faq", adminAuthMiddleware, adminController.updateFaq);
adminRoutes.delete("/faq", adminAuthMiddleware, adminController.deleteFaq);

// Contact Us Form
adminRoutes.get("/contact/us/forms", adminAuthMiddleware, adminController.getAllContacts);
adminRoutes.get("/contact/us/form",adminAuthMiddleware, adminController.getContactById);
adminRoutes.delete("/contact/us/form", adminAuthMiddleware, adminController.deleteContactById);

// Job
adminRoutes.post('/job/post', adminAuthMiddleware, postJobValidationRules(), validate, adminController.postJob);
adminRoutes.put('/job/update', adminAuthMiddleware, adminController.updateJob);
adminRoutes.get('/jobs', adminAuthMiddleware, adminController.getJobs);
adminRoutes.get('/job', adminAuthMiddleware, adminController.getJobById);
adminRoutes.patch('/job/close', adminAuthMiddleware, adminController.closeJob);
adminRoutes.delete('/job/delete', adminAuthMiddleware, adminController.deleteJob);

adminRoutes.post('/job/repost', adminAuthMiddleware, adminController.repostJob);
adminRoutes.get('/job/applicants', adminAuthMiddleware, adminController.getJobApplicants);
adminRoutes.get('/job/view/applicant', adminAuthMiddleware, adminController.viewApplicant);
adminRoutes.get('/job/download/applicant/resume', adminAuthMiddleware, adminController.downloadApplicantResume);

// Withdrawals
adminRoutes.post("/withdrawal/update/status", adminAuthMiddleware, adminController.updateWithdrawalStatus);
adminRoutes.get("/withdrawals", adminAuthMiddleware, adminController.getWithdrawals);
adminRoutes.get("/withdrawal", adminAuthMiddleware, adminController.getWithdrawalById);

// BANNER Routes
adminRoutes.post("/banner", adminAuthMiddleware, adminController.createBanner);
adminRoutes.get("/banners", adminAuthMiddleware, adminController.getAllBanners);
adminRoutes.get("/banner",adminAuthMiddleware, adminController.getBanner);
adminRoutes.put("/banner", adminAuthMiddleware, adminController.updateBanner);
adminRoutes.delete("/banner", adminAuthMiddleware, adminController.deleteBanner);

export default adminRoutes; // Export the router
