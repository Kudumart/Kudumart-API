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
    validate } from '../utils/validations'; // Import the service
import checkPermission from '../middlewares/checkPermissionMiddleware';

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

export default adminRoutes; // Export the router
