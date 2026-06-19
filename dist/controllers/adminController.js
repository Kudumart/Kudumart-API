"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeneralStores = exports.viewUser = exports.toggleUserStatus = exports.getAllVendors = exports.getAllCustomers = exports.deleteCurrency = exports.getAllCurrencies = exports.updateCurrency = exports.addCurrency = exports.setPaymentGatewayActive = exports.paymentGateway = exports.getAllPaymentGateways = exports.deletePaymentGateway = exports.updatePaymentGateway = exports.createPaymentGateway = exports.approveOrRejectKYC = exports.getAllKYC = exports.getAllSubCategories = exports.deleteSubCategory = exports.updateSubCategory = exports.createSubCategory = exports.getCategoriesWithSubCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.createSubscriptionPlan = exports.getAllSubscriptionPlans = exports.deletePermission = exports.updatePermission = exports.getMyPermissions = exports.getPermissions = exports.createPermission = exports.deletePermissionFromRole = exports.assignPermissionToRole = exports.viewRolePermissions = exports.updateRole = exports.getRoles = exports.createRole = exports.resendLoginDetailsSubAdmin = exports.deleteSubAdmin = exports.deactivateOrActivateSubAdmin = exports.updateSubAdmin = exports.createSubAdmin = exports.subAdmins = exports.updatePassword = exports.updateProfile = exports.logout = void 0;
exports.updateTestimonial = exports.createTestimonial = exports.updateOrderStatus = exports.getOrderItemsInfo = exports.getDropshipOrderTrackingInfo = exports.getDropshipedOrderItemDetails = exports.viewOrderItem = exports.getOrderItems = exports.approveOrRejectAdvert = exports.viewGeneralAdvert = exports.getGeneralAdverts = exports.deleteAdvert = exports.viewAdvert = exports.getAdverts = exports.updateAdvert = exports.createAdvert = exports.activeProducts = exports.getTransactionsForAdmin = exports.getAllBidsByAuctionProductId = exports.viewAuctionProduct = exports.fetchAuctionProducts = exports.cancelAuctionProduct = exports.deleteAuctionProduct = exports.updateAuctionProduct = exports.createAuctionProduct = exports.changeProductStatus = exports.moveToDraft = exports.viewProduct = exports.fetchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.deleteStore = exports.updateStore = exports.createStore = exports.getStore = exports.getAllSubscribers = exports.getGeneralPaymentDetails = exports.getAllGeneralOrderItems = exports.getAllGeneralOrders = exports.getAllBiddersByAuctionProductId = exports.deleteGeneralAuctionProduct = exports.viewGeneralAuctionProduct = exports.getGeneralAuctionProducts = exports.publishProduct = exports.unpublishProduct = exports.deleteGeneralProduct = exports.viewGeneralProduct = exports.getGeneralProducts = exports.viewGeneralStore = void 0;
exports.deleteServiceSubCategory = exports.getAllServiceSubCategories = exports.updateServiceSubCategory = exports.createServiceSubCategory = exports.deleteServiceCategory = exports.getAllServiceCategories = exports.updateServiceCategory = exports.createServiceCategory = exports.markProductChargeAsActive = exports.markProductChargeAsInactive = exports.deleteProductCharge = exports.getAllProductCharges = exports.updateProductCharge = exports.createProductCharge = exports.markAdminNotificationAsRead = exports.getAdminNotifications = exports.deleteBanner = exports.getBanner = exports.getAllBanners = exports.updateBanner = exports.createBanner = exports.getWithdrawalById = exports.getWithdrawals = exports.updateWithdrawalStatus = exports.downloadApplicantResume = exports.repostJob = exports.viewApplicant = exports.getJobApplicants = exports.deleteJob = exports.closeJob = exports.getJobById = exports.updateJob = exports.getJobs = exports.postJob = exports.deleteContactById = exports.getContactById = exports.getAllContacts = exports.deleteFaq = exports.updateFaq = exports.getFaq = exports.getAllFaqs = exports.createFaq = exports.deleteFaqCategory = exports.updateFaqCategory = exports.getFaqCategory = exports.getAllFaqCategories = exports.createFaqCategory = exports.deleteTestimonial = exports.getTestimonial = exports.getAllTestimonials = void 0;
exports.respondToOffer = exports.getAllOffers = exports.getOverallPayoutStats = exports.getVendorEarningsReport = exports.getVendorPayoutReports = exports.getAliExpressProducts = exports.getAliExpressCategories = exports.getServiceById = exports.getAllServices = exports.activateService = exports.suspendService = exports.removeAttributeFromServiceCategory = exports.addAttributeToServiceCategory = exports.deleteAttributeOption = exports.getAllServiceAttributes = exports.addAttributeOptions = exports.deleteServiceAttribute = exports.createServiceAttribute = void 0;
exports.getAliExpressProductDetails = getAliExpressProductDetails;
exports.addAliexpressProductToInventory = addAliexpressProductToInventory;
exports.getAliExpressDropshipCredsStatus = getAliExpressDropshipCredsStatus;
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const mail_service_1 = require("../services/mail.service");
const messages_1 = require("../utils/messages");
const jwt_service_1 = __importDefault(require("../services/jwt.service"));
const logger_1 = __importDefault(require("../middlewares/logger")); // Adjust the path to your logger.js
const helpers_1 = require("../utils/helpers");
const admin_1 = __importDefault(require("../models/admin"));
const role_1 = __importDefault(require("../models/role"));
const permission_1 = __importDefault(require("../models/permission"));
const rolepermission_1 = __importDefault(require("../models/rolepermission"));
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const category_1 = __importDefault(require("../models/category"));
const subcategory_1 = __importDefault(require("../models/subcategory"));
const user_1 = __importDefault(require("../models/user"));
const kyc_1 = __importDefault(require("../models/kyc"));
const paymentgateway_1 = __importDefault(require("../models/paymentgateway"));
const currency_1 = __importDefault(require("../models/currency"));
const product_1 = __importDefault(require("../models/product"));
const store_1 = __importDefault(require("../models/store"));
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const order_1 = __importDefault(require("../models/order"));
const orderitem_1 = __importDefault(require("../models/orderitem"));
const payment_1 = __importDefault(require("../models/payment"));
const bid_1 = __importDefault(require("../models/bid"));
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const sequelize_service_1 = __importDefault(require("../services/sequelize.service"));
const transaction_1 = __importDefault(require("../models/transaction"));
const advert_1 = __importDefault(require("../models/advert"));
const notification_1 = __importDefault(require("../models/notification"));
const cart_1 = __importDefault(require("../models/cart"));
const testimonial_1 = __importDefault(require("../models/testimonial"));
const faqcategory_1 = __importDefault(require("../models/faqcategory"));
const faq_1 = __importDefault(require("../models/faq"));
const contact_1 = __importDefault(require("../models/contact")); // Adjust the path as needed
const saveproduct_1 = __importDefault(require("../models/saveproduct"));
const reviewproduct_1 = __importDefault(require("../models/reviewproduct"));
const job_1 = __importDefault(require("../models/job"));
const applicant_1 = __importDefault(require("../models/applicant"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const withdrawal_1 = __importDefault(require("../models/withdrawal"));
const banner_1 = __importDefault(require("../models/banner"));
const crypto_1 = __importDefault(require("crypto"));
const adminnotification_1 = __importDefault(require("../models/adminnotification"));
const productcharge_1 = __importDefault(require("../models/productcharge"));
const dropShipping_service_1 = require("../services/dropShipping.service");
const serviceCategories_1 = __importDefault(require("../models/serviceCategories"));
const serviceSubCategories_1 = __importDefault(require("../models/serviceSubCategories"));
const attributeDefinitions_1 = __importDefault(require("../models/attributeDefinitions"));
const sequelize_2 = __importDefault(require("../config/sequelize"));
const attributeOptions_1 = __importDefault(require("../models/attributeOptions"));
const serviceCategoryToAttributeMap_1 = __importDefault(require("../models/serviceCategoryToAttributeMap"));
const services_1 = __importDefault(require("../models/services"));
const dropshipProducts_1 = __importDefault(require("../models/dropshipProducts"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const dropshippngCreds_1 = __importDefault(require("../models/dropshippngCreds"));
const productoffer_1 = __importDefault(require("../models/productoffer"));
const pushNotification_1 = require("../firebase/pushNotification");
const index_1 = require("../types/index");
// Define the upload directory
const uploadDir = path_1.default.join(__dirname, "../../uploads");
const dropShippingService = new dropShipping_service_1.DropShippingService();
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the token from the request
        const token = jwt_service_1.default.jwtGetToken(req);
        if (!token) {
            res.status(400).json({
                message: "Token not provided",
            });
            return;
        }
        // Blacklist the token to prevent further usage
        yield jwt_service_1.default.jwtBlacklistToken(token);
        res.status(200).json({
            message: "Logged out successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "Server error during logout.",
        });
    }
});
exports.logout = logout;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, photo } = req.body;
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
        // Fetch the admin by their ID
        const admin = yield admin_1.default.findByPk(adminId);
        if (!admin) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }
        // Check if email is being updated
        if (email && email !== admin.email) {
            // Check if the email already exists for another user
            const emailExists = yield admin_1.default.findOne({ where: { email } });
            if (emailExists) {
                res
                    .status(400)
                    .json({ message: "Email is already in use by another user." });
                return;
            }
        }
        // Update admin profile information
        admin.name = name ? (0, helpers_1.capitalizeFirstLetter)(name) : admin.name;
        admin.photo = photo || admin.photo;
        admin.email = email || admin.email;
        yield admin.save();
        res.status(200).json({
            message: "Profile updated successfully.",
            data: admin,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating admin profile:", error);
        res.status(500).json({
            message: "Server error during profile update.",
        });
    }
});
exports.updateProfile = updateProfile;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    // Validate that new passwords match
    if (newPassword !== confirmNewPassword) {
        res.status(400).json({ message: "New passwords do not match." });
        return;
    }
    // Validate new password strength (example: length and complexity)
    if (newPassword.length < 8) {
        res
            .status(400)
            .json({ message: "New password must be at least 8 characters long." });
        return;
    }
    try {
        // Find the admin
        const admin = yield admin_1.default.scope("auth").findByPk(adminId);
        if (!admin) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }
        // Check if the old password is correct
        const isMatch = yield admin.checkPassword(oldPassword);
        if (!isMatch) {
            res.status(400).json({ message: "Old password is incorrect." });
            return;
        }
        // Update the password in the database
        admin.password = newPassword;
        yield admin.save();
        // Send password reset notification email
        const message = messages_1.emailTemplates.adminPasswordResetNotification(admin);
        try {
            yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - Password Reset Notification`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
            // Continue with password update even if email fails
        }
        res.status(200).json({
            message: "Password updated successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Error updating password:", error);
        res.status(500).json({
            message: "Server error during password update.",
        });
    }
});
exports.updatePassword = updatePassword;
const subAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.query; // Get the search query parameters
        // Build the where condition dynamically based on the presence of name and email
        const whereCondition = {};
        if (name) {
            whereCondition.name = {
                [sequelize_1.Op.like]: `%${name}%`, // Use LIKE for case-insensitive match
            };
        }
        if (email) {
            whereCondition.email = {
                [sequelize_1.Op.like]: `%${email}%`, // Use LIKE for case-insensitive match
            };
        }
        // Fetch sub-admins along with their roles, applying the search conditions
        const subAdmins = yield admin_1.default.findAll({
            where: whereCondition,
            include: [
                {
                    model: role_1.default, // Include the Role model in the query
                    as: "role", // Use the alias defined in the association (if any)
                },
            ],
        });
        if (subAdmins.length === 0) {
            res.status(404).json({ message: "Sub-admins not found" });
            return;
        }
        res
            .status(200)
            .json({ message: "Sub-admins retrieved successfully", data: subAdmins });
    }
    catch (error) {
        logger_1.default.error("Error retrieving sub-admins:", error);
        res.status(500).json({ message: `Error retrieving sub-admins: ${error}` });
    }
});
exports.subAdmins = subAdmins;
const createSubAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, roleId } = req.body;
        // Check if the email already exists
        const existingSubAdmin = yield admin_1.default.findOne({ where: { email } });
        if (existingSubAdmin) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }
        // Generate a random password (you can change this to your desired method)
        const password = Math.random().toString(36).slice(-8);
        const checkRole = yield role_1.default.findByPk(roleId);
        if (!checkRole) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        // Create the sub-admin
        const newSubAdmin = yield admin_1.default.create({
            name,
            email,
            password: password,
            roleId,
            status: "active", // Default status
        });
        // Send mail
        let message = messages_1.emailTemplates.subAdminCreated(newSubAdmin, password);
        try {
            yield (0, mail_service_1.sendMail)(email, `${process.env.APP_NAME} - Your Sub-Admin Login Details`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        res.status(200).json({ message: "Sub Admin created successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: `Error creating sub-admin: ${error}` });
    }
});
exports.createSubAdmin = createSubAdmin;
const updateSubAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subAdminId, name, email, roleId } = req.body;
    try {
        // Find the sub-admin by their ID
        const subAdmin = yield admin_1.default.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }
        // Check if the email is already in use by another sub-admin
        if (email && email !== subAdmin.email) {
            // Only check if the email has changed
            const existingAdmin = yield admin_1.default.findOne({
                where: {
                    email,
                    id: { [sequelize_1.Op.ne]: subAdminId }, // Ensure it's not the same sub-admin
                },
            });
            if (existingAdmin) {
                res
                    .status(400)
                    .json({ message: "Email is already in use by another sub-admin." });
                return;
            }
        }
        // Update sub-admin details
        yield subAdmin.update({
            name,
            email,
            roleId,
        });
        res.status(200).json({ message: "Sub Admin updated successfully." });
    }
    catch (error) {
        // Log and send the error message in the response
        logger_1.default.error("Error updating sub-admin:", error);
        res.status(500).json({ message: `Error updating sub-admin: ${error}` });
    }
});
exports.updateSubAdmin = updateSubAdmin;
const deactivateOrActivateSubAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subAdminId } = req.body;
    try {
        // Find the sub-admin by ID
        const subAdmin = yield admin_1.default.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }
        // Toggle status: if active, set to inactive; if inactive, set to active
        const newStatus = subAdmin.status === "active" ? "inactive" : "active";
        subAdmin.status = newStatus;
        // Save the updated status
        yield subAdmin.save();
        res
            .status(200)
            .json({ message: `Sub-admin status updated to ${newStatus}.` });
    }
    catch (error) {
        // Log the error and send the response
        logger_1.default.error("Error updating sub-admin status:", error);
        res
            .status(500)
            .json({ message: `Error updating sub-admin status: ${error}` });
    }
});
exports.deactivateOrActivateSubAdmin = deactivateOrActivateSubAdmin;
const deleteSubAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subAdminId = req.query.subAdminId;
    try {
        const subAdmin = yield admin_1.default.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }
        const relatedTables = [{ name: "stores", model: store_1.default, field: "vendorId" }];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: subAdmin.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete sub-admin because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield subAdmin.destroy();
        res.status(200).json({ message: "Sub-admin deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: "Error deleting sub-admin: ${error.message}" });
    }
});
exports.deleteSubAdmin = deleteSubAdmin;
const resendLoginDetailsSubAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subAdminId } = req.body;
    try {
        const subAdmin = yield admin_1.default.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }
        // Generate a new password (or reuse the existing one)
        const password = Math.random().toString(36).slice(-8);
        // Update the password in the database
        subAdmin.password = password;
        yield subAdmin.save();
        // Send mail
        let message = messages_1.emailTemplates.subAdminCreated(subAdmin, password);
        try {
            yield (0, mail_service_1.sendMail)(subAdmin.email, `${process.env.APP_NAME} - Your New Login Details`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        res.status(200).json({ message: "Login details resent successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: "Error resending login details: ${error.message}" });
    }
});
exports.resendLoginDetailsSubAdmin = resendLoginDetailsSubAdmin;
// Roles
// Create a new Role
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }
        // Check if a role with the same name already exists
        const existingRole = yield role_1.default.findOne({ where: { name } });
        if (existingRole) {
            res.status(409).json({ message: "Role with this name already exists." });
            return;
        }
        // Create the new role
        const role = yield role_1.default.create({ name });
        res.status(200).json({ message: "Role created successfully" });
    }
    catch (error) {
        logger_1.default.error("Error creating role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createRole = createRole;
// Get all Roles
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield role_1.default.findAll();
        res.status(200).json({ data: roles });
    }
    catch (error) {
        logger_1.default.error("Error fetching roles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getRoles = getRoles;
// Update an existing Role
const updateRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleId, name } = req.body;
    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }
        const role = yield role_1.default.findByPk(roleId);
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        // Check if another role with the same name exists
        const existingRole = yield role_1.default.findOne({
            where: { name, id: { [sequelize_1.Op.ne]: roleId } }, // Exclude the current role ID
        });
        if (existingRole) {
            res
                .status(409)
                .json({ message: "Another role with this name already exists." });
            return;
        }
        // Update the role name
        role.name = name;
        yield role.save();
        res.status(200).json({ message: "Role updated successfully", role });
    }
    catch (error) {
        logger_1.default.error("Error updating role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateRole = updateRole;
// View a Role's Permissions
const viewRolePermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roleId = req.query.roleId;
    try {
        const role = yield role_1.default.findByPk(roleId, {
            include: [{ model: permission_1.default, as: "permissions" }],
        });
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        res.status(200).json({ data: role });
    }
    catch (error) {
        logger_1.default.error("Error fetching role permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.viewRolePermissions = viewRolePermissions;
// Assign a New Permission to a Role
const assignPermissionToRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleId, permissionId } = req.body;
    try {
        // Ensure role and permission exist
        const role = yield role_1.default.findByPk(roleId);
        const permission = yield permission_1.default.findByPk(permissionId);
        if (!role || !permission) {
            res.status(404).json({ message: "Role or Permission not found" });
            return;
        }
        // Check if the permission is already assigned to the role
        const existingRolePermission = yield rolepermission_1.default.findOne({
            where: { roleId, permissionId },
        });
        if (existingRolePermission) {
            res
                .status(409)
                .json({ message: "Permission is already assigned to this role" });
            return;
        }
        // Assign permission to role
        yield rolepermission_1.default.create({ roleId, permissionId });
        res
            .status(200)
            .json({ message: "Permission assigned to role successfully" });
    }
    catch (error) {
        logger_1.default.error("Error assigning permission to role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.assignPermissionToRole = assignPermissionToRole;
// Delete a Permission from a Role
const deletePermissionFromRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleId, permissionId } = req.query;
    try {
        const role = yield role_1.default.findOne({
            where: { id: roleId },
        });
        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }
        const rolePermission = yield rolepermission_1.default.findOne({
            where: { roleId, permissionId },
        });
        if (!rolePermission) {
            res.status(404).json({ message: "Permission not found for the role" });
            return;
        }
        yield rolePermission.destroy();
        res
            .status(200)
            .json({ message: "Permission removed from role successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting permission from role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deletePermissionFromRole = deletePermissionFromRole;
// Permission
// Create a new Permission
const createPermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }
        // Check if permission name already exists
        const existingPermission = yield permission_1.default.findOne({ where: { name } });
        if (existingPermission) {
            res.status(409).json({ message: "Permission name already exists." });
            return;
        }
        // Create new permission if it doesn't exist
        const permission = yield permission_1.default.create({ name });
        res.status(201).json({
            message: "Permission created successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error creating permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createPermission = createPermission;
// Get all Permissions
const getPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissions = yield permission_1.default.findAll();
        res.status(200).json({ data: permissions });
    }
    catch (error) {
        logger_1.default.error("Error fetching permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPermissions = getPermissions;
const getMyPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const roleId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.roleId;
    if (!roleId) {
        res.status(404).json({ message: "No role assigned to this account." });
        return;
    }
    try {
        const rolePermissions = yield rolepermission_1.default.findAll({
            where: { roleId },
            include: [{ model: permission_1.default, as: "permission" }],
        });
        const permissions = rolePermissions.map((rp) => rp.permission).filter(Boolean);
        res.status(200).json({ data: permissions });
    }
    catch (error) {
        logger_1.default.error("Error fetching admin permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMyPermissions = getMyPermissions;
// Update an existing Permission
const updatePermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { permissionId, name } = req.body;
    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }
        const permission = yield permission_1.default.findByPk(permissionId);
        if (!permission) {
            res.status(404).json({ message: "Permission not found" });
            return;
        }
        // Check if the new name exists in another permission
        const existingPermission = yield permission_1.default.findOne({
            where: {
                name,
                id: { [sequelize_1.Op.ne]: permissionId }, // Exclude current permission
            },
        });
        if (existingPermission) {
            res.status(409).json({ message: "Permission name already exists." });
            return;
        }
        permission.name = name;
        yield permission.save();
        res.status(200).json({ message: "Permission updated successfully" });
    }
    catch (error) {
        logger_1.default.error("Error updating permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updatePermission = updatePermission;
// Delete a Permission and cascade delete from role_permissions
const deletePermission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const permissionId = req.query.permissionId;
        // Find the permission
        const permission = yield permission_1.default.findByPk(permissionId);
        if (!permission) {
            res.status(404).json({ message: "Permission not found" });
            return;
        }
        // Delete the permission and associated role_permissions
        yield permission.destroy();
        yield rolepermission_1.default.destroy({ where: { permissionId } });
        res.status(200).json({
            message: "Permission and associated role permissions deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error("Error deleting permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deletePermission = deletePermission;
// Subscription Plan
const getAllSubscriptionPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.query; // Get the name from query parameters
        const queryOptions = {
            include: [
                {
                    model: currency_1.default, // Include the Currency model
                    as: "currency", // Ensure this matches the alias in the association
                },
            ],
        }; // Initialize query options
        // If a name is provided, add a condition to the query
        if (name) {
            queryOptions.where = {
                name: {
                    [sequelize_1.Op.like]: `%${name}%`, // Use a partial match for name
                },
            };
        }
        const plans = yield subscriptionplan_1.default.findAll(queryOptions); // Use query options
        res.status(200).json({ data: plans });
    }
    catch (error) {
        logger_1.default.error("Error fetching subscription plans:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllSubscriptionPlans = getAllSubscriptionPlans;
const createSubscriptionPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currencyId, name, duration, price, productLimit, allowsAuction, auctionProductLimit, allowsServiceAds, serviceAdsLimit, maxAds, adsDurationDays, } = req.body;
    try {
        // Check if the subscription plan name already exists
        const existingPlan = yield subscriptionplan_1.default.findOne({ where: { name } });
        if (existingPlan) {
            res
                .status(400)
                .json({ message: "A plan with this name already exists." });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }
        // Create the subscription plan
        yield subscriptionplan_1.default.create({
            name,
            duration,
            price,
            productLimit,
            allowsAuction,
            auctionProductLimit,
            allowsServiceAds,
            serviceAdsLimit,
            maxAds,
            adsDurationDays,
            currencyId: currency.id,
        });
        res.status(200).json({
            message: "Subscription plan created successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Error creating subscription plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createSubscriptionPlan = createSubscriptionPlan;
const updateSubscriptionPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { planId, currencyId, name, duration, price, productLimit, allowsAuction, auctionProductLimit, maxAds, adsDurationDays, } = req.body;
    try {
        // Fetch the subscription plan to update
        const plan = yield subscriptionplan_1.default.findByPk(planId);
        if (!plan) {
            res.status(404).json({ message: "Subscription plan not found." });
            return;
        }
        // Prevent name change for Free Plan
        if (plan.name === "Free Plan" && name !== "Free Plan") {
            res
                .status(400)
                .json({ message: "The Free Plan name cannot be changed." });
            return;
        }
        // Check if the new name already exists (ignoring the current plan)
        const existingPlan = yield subscriptionplan_1.default.findOne({
            where: { name, id: { [sequelize_1.Op.ne]: planId } },
        });
        if (existingPlan) {
            res
                .status(400)
                .json({ message: "A different plan with this name already exists." });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }
        // Update fields
        plan.name = name;
        plan.duration = duration;
        plan.price = price;
        plan.productLimit = productLimit;
        plan.allowsAuction = allowsAuction;
        plan.auctionProductLimit = auctionProductLimit;
        plan.maxAds = maxAds;
        plan.adsDurationDays = adsDurationDays;
        plan.currencyId = currency.id;
        yield plan.save();
        res.status(200).json({ message: "Subscription plan updated successfully" });
    }
    catch (error) {
        logger_1.default.error("Error updating subscription plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateSubscriptionPlan = updateSubscriptionPlan;
const deleteSubscriptionPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const planId = req.query.planId;
    try {
        // Fetch the subscription plan
        const plan = yield subscriptionplan_1.default.findByPk(planId);
        if (!plan) {
            res.status(404).json({ message: "Subscription plan not found." });
            return;
        }
        // Prevent deletion of the Free Plan
        if (plan.name === "Free Plan") {
            res.status(400).json({ message: "The Free Plan cannot be deleted." });
            return;
        }
        const relatedTables = [
            {
                name: "vendor_subscriptions",
                model: vendorsubscription_1.default,
                field: "subscriptionPlanId",
            },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: plan.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete subscription plan because related records exist in ${table.name}`,
                });
                return;
            }
        }
        // Attempt to delete the plan
        yield plan.destroy();
        res
            .status(200)
            .json({ message: "Subscription plan deleted successfully." });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete subscription plan because it is currently assigned to one or more vendors. Please reassign or delete these associations before proceeding.",
            });
        }
        else {
            logger_1.default.error("Error deleting subscription plan:", error);
            res.status(500).json({ message: "Error deleting subscription plan" });
        }
    }
});
exports.deleteSubscriptionPlan = deleteSubscriptionPlan;
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    try {
        const categories = yield category_1.default.findAll({
            where: name ? { name: { [sequelize_1.Op.like]: `%${name}%` } } : {}, // Search by name if provided
            attributes: {
                include: [
                    [
                        // Count the total number of subcategories without including them in the result
                        sequelize_1.Sequelize.literal(`(SELECT COUNT(*) FROM sub_categories WHERE sub_categories.categoryId = Category.id)`),
                        "subCategoryCount",
                    ],
                ],
            },
        });
        res.status(200).json({ data: categories });
    }
    catch (error) {
        logger_1.default.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
});
exports.getAllCategories = getAllCategories;
// category
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image } = req.body;
    // Validate name and image fields
    if (!name || typeof name !== "string") {
        res
            .status(400)
            .json({ message: "Category name is required and must be a string" });
        return;
    }
    if (!image || typeof image !== "string") {
        res
            .status(400)
            .json({ message: "Image URL is required and must be a string" });
        return;
    }
    try {
        // Check if the category name already exists
        const existingCategory = yield category_1.default.findOne({ where: { name } });
        if (existingCategory) {
            res.status(400).json({ message: "Category name already exists" });
            return;
        }
        // Create the new category
        const category = yield category_1.default.create({ name, image });
        res.status(200).json({ message: "Category created successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Error creating category" });
    }
});
exports.createCategory = createCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, name, image } = req.body;
    // Validate categoryId
    if (!categoryId) {
        res.status(400).json({ message: "Category ID is required" });
        return;
    }
    // Validate name
    if (!name || typeof name !== "string") {
        res.status(400).json({ message: "Valid category name is required" });
        return;
    }
    // Validate image
    if (!image || typeof image !== "string") {
        res.status(400).json({ message: "Valid image URL is required" });
        return;
    }
    try {
        const checkCategory = yield category_1.default.findByPk(categoryId);
        if (!checkCategory) {
            res.status(404).json({
                message: "Category not found",
            });
            return;
        }
        // Check if another category with the same name exists, excluding the current category
        const existingCategory = yield category_1.default.findOne({
            where: { name, id: { [sequelize_1.Op.ne]: categoryId } },
        });
        if (existingCategory) {
            res.status(400).json({ message: "Category name already in use" });
            return; // Ensure the function returns after sending a response
        }
        // Fetch category by ID to update
        const category = yield category_1.default.findByPk(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return; // Ensure the function returns after sending a response
        }
        // Update the category
        yield category.update({ name, image });
        // Send the success response
        res.status(200).json({ message: "Category updated successfully" });
    }
    catch (error) {
        logger_1.default.error(error); // Use logger.error instead of logger for debugging
        res.status(500).json({ message: "Error updating category" });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.query.categoryId;
    try {
        const category = yield category_1.default.findByPk(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }
        const relatedTables = [
            { name: "sub_categories", model: subcategory_1.default, field: "categoryId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: category.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete category because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield category.destroy();
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete category because it has associated sub-categories. Delete or reassign sub-categories before deleting this category.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({ message: "Error deleting category" });
        }
    }
});
exports.deleteCategory = deleteCategory;
const getCategoriesWithSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_1.default.findAll({
            include: [
                {
                    model: subcategory_1.default,
                    as: "subCategories", // alias used in the association
                },
            ],
            attributes: ["id", "name", "image"], // select specific fields in Category
            order: [["name", "ASC"]], // sort categories alphabetically, for example
        });
        res.status(200).json({ data: categories });
    }
    catch (error) {
        logger_1.default.error("Error fetching categories with subcategories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getCategoriesWithSubCategories = getCategoriesWithSubCategories;
// sub_category
const createSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, name, image } = req.body;
    if (!categoryId || !name) {
        res.status(400).json({ message: "Category ID and name are required" });
        return;
    }
    if (!image || typeof image !== "string") {
        res
            .status(400)
            .json({ message: "Image URL is required and must be a string" });
        return;
    }
    try {
        const checkCategory = yield category_1.default.findByPk(categoryId);
        if (!checkCategory) {
            res.status(404).json({
                message: "Category not found",
            });
            return;
        }
        // Check if a sub_category with the same name already exists within the same category
        const existingSubCategory = yield subcategory_1.default.findOne({
            where: { name, categoryId },
        });
        if (existingSubCategory) {
            res.status(400).json({
                message: "Sub-category name already exists within this category",
            });
            return;
        }
        // Create new sub_category
        const newSubCategory = yield subcategory_1.default.create({
            categoryId,
            name,
            image,
        });
        res.status(200).json({
            message: "Sub-category created successfully",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Error creating sub-category" });
    }
});
exports.createSubCategory = createSubCategory;
const updateSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subCategoryId, categoryId, name, image } = req.body;
    if (!categoryId) {
        res.status(400).json({ message: "Category ID is required" });
        return;
    }
    if (!subCategoryId || !name) {
        res.status(400).json({ message: "Sub-category ID and name are required" });
        return;
    }
    if (!image || typeof image !== "string") {
        res
            .status(400)
            .json({ message: "Image URL is required and must be a string" });
        return;
    }
    try {
        const checkCategory = yield category_1.default.findByPk(categoryId);
        if (!checkCategory) {
            res.status(404).json({
                message: "Category not found",
            });
            return;
        }
        // Fetch sub_category by ID to update
        const subCategory = yield subcategory_1.default.findByPk(subCategoryId);
        if (!subCategory) {
            res.status(404).json({ message: "Sub-category not found" });
            return;
        }
        // Check if another sub_category with the same name exists within the same category
        const existingSubCategory = yield subcategory_1.default.findOne({
            where: { name, categoryId, id: { [sequelize_1.Op.ne]: subCategoryId } },
        });
        if (existingSubCategory) {
            res.status(400).json({
                message: "Sub-category name already exists within this category",
            });
            return;
        }
        // Update the sub_category
        yield subCategory.update({ name, image });
        res.status(200).json({ message: "Sub-category updated successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Error updating sub-category" });
    }
});
exports.updateSubCategory = updateSubCategory;
const deleteSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subCategoryId = req.query.subCategoryId;
    if (!subCategoryId) {
        res.status(400).json({ message: "Sub-category ID is required" });
        return;
    }
    try {
        const subCategory = yield subcategory_1.default.findByPk(subCategoryId);
        if (!subCategory) {
            res.status(404).json({ message: "Sub-category not found" });
            return;
        }
        const relatedTables = [
            { name: "products", model: product_1.default, field: "categoryId" },
            { name: "auction_products", model: auctionproduct_1.default, field: "categoryId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: subCategory.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete product because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield subCategory.destroy();
        res.status(200).json({ message: "Sub-category deleted successfully" });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete sub-category because it has associated products. Delete or reassign products before deleting this sub-category.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({ message: "Error deleting sub-category" });
        }
    }
});
exports.deleteSubCategory = deleteSubCategory;
const getAllSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    try {
        // Query with name filter if provided
        const whereClause = name ? { name: { [sequelize_1.Op.like]: `%${name}%` } } : {};
        const subCategories = yield subcategory_1.default.findAll({ where: whereClause });
        res.status(200).json({ data: subCategories });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Error fetching sub-categories" });
    }
});
exports.getAllSubCategories = getAllSubCategories;
// KYC
const getAllKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, firstName, lastName } = req.query;
    try {
        // Build query filters
        const userFilter = {};
        if (email)
            userFilter.email = { [sequelize_1.Op.like]: `%${email}%` };
        if (firstName)
            userFilter.firstName = { [sequelize_1.Op.like]: `%${firstName}%` };
        if (lastName)
            userFilter.lastName = { [sequelize_1.Op.like]: `%${lastName}%` };
        // Fetch all KYC records with User relationship
        const kycRecords = yield kyc_1.default.findAll({
            include: [
                {
                    model: user_1.default,
                    as: "user",
                    where: userFilter,
                },
            ],
        });
        res.status(200).json({ data: kycRecords });
    }
    catch (error) {
        logger_1.default.error("Error retrieving KYC records:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});
exports.getAllKYC = getAllKYC;
const approveOrRejectKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { kycId, isVerified, note } = req.body; // Approve flag and note from request body
    try {
        // Find the KYC record by ID
        const kycRecord = yield kyc_1.default.findByPk(kycId, {
            include: [
                {
                    model: user_1.default,
                    as: "user",
                },
            ],
        });
        if (!kycRecord) {
            res.status(404).json({ message: "KYC record not found" });
            return;
        }
        // Safely access the user property
        const user = kycRecord.user; // This should now work if the relationship is correctly defined
        // Check if user exists
        if (!user) {
            res.status(404).json({ message: "User not found for the KYC record." });
            return;
        }
        // Approve or reject with a note
        kycRecord.isVerified = isVerified;
        kycRecord.adminNote = isVerified
            ? "Approved by admin"
            : note || "Rejected without a note";
        // Save the updated record
        yield kycRecord.save();
        // Prepare email notification
        const isApproved = isVerified;
        const message = messages_1.emailTemplates.kycStatusUpdate(user, isApproved, kycRecord.adminNote);
        // Send email notification
        try {
            yield (0, mail_service_1.sendMail)(user.email, `${process.env.APP_NAME} - Your KYC Status Update`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
            // Optionally handle this scenario (e.g., revert KYC status)
        }
        // Send response
        res.status(200).json({
            message: isApproved
                ? "KYC approved successfully"
                : "KYC rejected with note",
        });
    }
    catch (error) {
        logger_1.default.error("Error approving/rejecting KYC:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
});
exports.approveOrRejectKYC = approveOrRejectKYC;
// Payment Gateway
const createPaymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, publicKey, secretKey } = req.body;
    // Allow only Paystack and Stripe
    const allowedGateways = ["paystack", "stripe"];
    if (!allowedGateways.includes(name.toLowerCase())) {
        res.status(400).json({
            message: "Invalid payment gateway. Only 'Paystack' and 'Stripe' are allowed.",
        });
        return;
    }
    try {
        // Check if any payment gateway is active
        const activeGateway = yield paymentgateway_1.default.findOne({
            where: { isActive: true },
        });
        // If there's no active gateway, set the new one as active, else set it as inactive
        const newIsActive = activeGateway ? false : true;
        const paymentGateway = yield paymentgateway_1.default.create({
            name,
            publicKey,
            secretKey,
            isActive: newIsActive,
        });
        res.status(200).json({
            message: "Payment Gateway created successfully",
            data: paymentGateway,
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message ||
                "An error occurred while creating the payment gateway.",
        });
    }
});
exports.createPaymentGateway = createPaymentGateway;
const updatePaymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, publicKey, secretKey } = req.body;
    // Allow only Paystack and Stripe
    const allowedGateways = ["paystack", "stripe"];
    if (!allowedGateways.includes(name.toLowerCase())) {
        res.status(400).json({
            message: "Invalid payment gateway. Only 'Paystack' and 'Stripe' are allowed.",
        });
        return;
    }
    try {
        const paymentGateway = yield paymentgateway_1.default.findByPk(id);
        if (!paymentGateway) {
            res.status(404).json({ message: "Payment Gateway not found" });
            return;
        }
        yield paymentGateway.update({
            name,
            publicKey,
            secretKey,
        });
        res.status(200).json({
            message: "Payment Gateway updated successfully",
            data: paymentGateway,
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message ||
                "An error occurred while updating the payment gateway.",
        });
    }
});
exports.updatePaymentGateway = updatePaymentGateway;
const deletePaymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const paymentGateway = yield paymentgateway_1.default.findByPk(id);
        if (!paymentGateway) {
            res.status(404).json({ message: "Payment Gateway not found" });
            return;
        }
        if (paymentGateway.isActive) {
            // If the gateway to be deleted is active, check for another active one
            const anotherActiveGateway = yield paymentgateway_1.default.findOne({
                where: { id: { [sequelize_1.Op.ne]: id } },
            });
            if (anotherActiveGateway) {
                // If another active gateway exists, set it to active and delete this one
                yield anotherActiveGateway.update({ isActive: true });
                yield paymentGateway.destroy();
                res.status(200).json({
                    message: "Payment Gateway deleted successfully and another one activated.",
                });
            }
            else {
                // If no other active gateway, delete this one
                yield paymentGateway.destroy();
                res.status(200).json({
                    message: "Last active payment gateway deleted.",
                });
            }
        }
        else {
            // If the gateway is not active, just delete it
            yield paymentGateway.destroy();
            res.status(200).json({
                message: "Payment Gateway deleted successfully.",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            message: error.message ||
                "An error occurred while deleting the payment gateway.",
        });
    }
});
exports.deletePaymentGateway = deletePaymentGateway;
const getAllPaymentGateways = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gateways = yield paymentgateway_1.default.findAll();
        res.status(200).json({
            message: "Payment Gateways retrieved successfully",
            data: gateways,
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message || "An error occurred while fetching payment gateways.",
        });
    }
});
exports.getAllPaymentGateways = getAllPaymentGateways;
const paymentGateway = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const paymentGateway = yield paymentgateway_1.default.findByPk(id);
        if (!paymentGateway) {
            res.status(404).json({ message: "Payment Gateway not found" });
            return;
        }
        res.status(200).json({
            message: "Payment gateway retrieved successfully",
            data: paymentGateway,
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message || "An error occurred while fetching payment gateway.",
        });
    }
});
exports.paymentGateway = paymentGateway;
const setPaymentGatewayActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const paymentGateway = yield paymentgateway_1.default.findByPk(id);
        if (!paymentGateway) {
            res.status(404).json({ message: "Payment Gateway not found" });
            return;
        }
        // Check if the payment gateway is already active
        if (paymentGateway.isActive) {
            res.status(200).json({ message: "Payment Gateway is already active." });
            return;
        }
        // Deactivate only other active gateways with the same name
        yield paymentgateway_1.default.update({ isActive: false }, { where: { isActive: true, name: paymentGateway.name } });
        // Set the specified gateway as active
        yield paymentGateway.update({ isActive: true });
        res.status(200).json({
            message: "Payment Gateway successfully set to active.",
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message ||
                "An error occurred while updating the payment gateway.",
        });
    }
});
exports.setPaymentGatewayActive = setPaymentGatewayActive;
// Currency
const addCurrency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, symbol } = req.body;
    const allowedSymbols = ["$", "#", "₦"];
    if (!name || typeof name !== "string") {
        res.status(400).json({ message: "Name is required and must be a string." });
        return;
    }
    if (!symbol || typeof symbol !== "string") {
        res
            .status(400)
            .json({ message: "Symbol is required and must be a string." });
        return;
    }
    // Validate if symbol is in allowed list
    if (!allowedSymbols.includes(symbol)) {
        res.status(400).json({
            message: `Currency symbol must be one of: ${allowedSymbols.join(", ")}`,
        });
        return;
    }
    try {
        const existingCurrency = yield currency_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("name")), name.toLowerCase()),
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("symbol")), symbol.toLowerCase()),
                ],
            },
        });
        if (existingCurrency) {
            res.status(400).json({
                message: "Currency with the same name or symbol already exists.",
            });
            return;
        }
        const currency = yield currency_1.default.create({ name, symbol });
        res.status(200).json({ message: "Currency added successfully", currency });
    }
    catch (error) {
        logger_1.default.error("Error adding currency:", error);
        res.status(500).json({ message: "Failed to add currency" });
    }
});
exports.addCurrency = addCurrency;
const updateCurrency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { currencyId, name, symbol } = req.body;
    const allowedSymbols = ["$", "#", "₦"]; // Allowed symbols
    // Validate inputs
    if (!currencyId) {
        res.status(400).json({ message: "Currency ID is required." });
        return;
    }
    if (name && typeof name !== "string") {
        res.status(400).json({ message: "Name must be a string." });
        return;
    }
    if (symbol && typeof symbol !== "string") {
        res.status(400).json({ message: "Symbol must be a string." });
        return;
    }
    // Ensure symbol is within allowed values
    if (symbol && !allowedSymbols.includes(symbol)) {
        res.status(400).json({
            message: `Currency symbol must be one of: ${allowedSymbols.join(", ")}`,
        });
        return;
    }
    try {
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }
        // Check for uniqueness of name and symbol, excluding the current record
        const existingCurrency = yield currency_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("name")), name.toLowerCase()),
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("symbol")), symbol.toLowerCase()),
                ],
                id: { [sequelize_1.Op.ne]: currencyId }, // Exclude the current currency
            },
        });
        if (existingCurrency) {
            res.status(400).json({
                message: "Currency with the same name or symbol already exists.",
            });
            return;
        }
        // Update the currency fields
        yield currency.update({ name, symbol });
        res
            .status(200)
            .json({ message: "Currency updated successfully", currency });
    }
    catch (error) {
        logger_1.default.error("Error updating currency:", error);
        res.status(500).json({ message: "Failed to update currency" });
    }
});
exports.updateCurrency = updateCurrency;
const getAllCurrencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currencies = yield currency_1.default.findAll();
        res.status(200).json({ data: currencies });
    }
    catch (error) {
        logger_1.default.error("Error fetching currencies:", error);
        res.status(500).json({ message: "Failed to fetch currencies" });
    }
});
exports.getAllCurrencies = getAllCurrencies;
const deleteCurrency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const currencyId = req.query.currencyId;
    try {
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }
        const relatedTables = [
            { name: "store", model: store_1.default, field: "currencyId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: currency.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete currency because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield currency.destroy();
        res.status(200).json({ message: "Currency deleted successfully" });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete currency because it is currently assigned to one or more stores. Please reassign or delete these associations before proceeding.",
            });
        }
        else {
            logger_1.default.error("Error deleting currency:", error);
            res.status(500).json({ message: "Failed to delete currency" });
        }
    }
});
exports.deleteCurrency = deleteCurrency;
const getAllCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, search = "" } = req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const searchCondition = {
            [sequelize_1.Op.or]: [
                { firstName: { [sequelize_1.Op.like]: `%${search}%` } },
                { lastName: { [sequelize_1.Op.like]: `%${search}%` } },
                { email: { [sequelize_1.Op.like]: `%${search}%` } },
                { phoneNumber: { [sequelize_1.Op.like]: `%${search}%` } },
            ],
        };
        const { rows: customers, count: totalCustomers } = yield user_1.default.findAndCountAll({
            where: Object.assign({ accountType: "Customer" }, searchCondition),
            limit: Number(limit),
            offset,
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            message: "Customers fetched successfully",
            data: customers,
            meta: {
                totalCustomers,
                currentPage: Number(page),
                totalPages: Math.ceil(totalCustomers / Number(limit)),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching customers:", error);
        res.status(500).json({ message: "Failed to fetch customers", error });
    }
});
exports.getAllCustomers = getAllCustomers;
const getAllVendors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, search = "" } = req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const searchCondition = {
            [sequelize_1.Op.or]: [
                { firstName: { [sequelize_1.Op.like]: `%${search}%` } },
                { lastName: { [sequelize_1.Op.like]: `%${search}%` } },
                { email: { [sequelize_1.Op.like]: `%${search}%` } },
                { phoneNumber: { [sequelize_1.Op.like]: `%${search}%` } },
                { trackingId: { [sequelize_1.Op.like]: `%${search}%` } },
            ],
        };
        const { rows: vendors, count: totalVendors } = yield user_1.default.findAndCountAll({
            where: Object.assign({ accountType: "Vendor" }, searchCondition),
            limit: Number(limit),
            offset,
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            message: "Vendors fetched successfully",
            data: vendors,
            meta: {
                totalVendors,
                currentPage: Number(page),
                totalPages: Math.ceil(totalVendors / Number(limit)),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Failed to fetch vendors" });
    }
});
exports.getAllVendors = getAllVendors;
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    try {
        // Fetch the user
        const user = yield user_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Toggle the status
        user.status = user.status === "active" ? "inactive" : "active";
        yield user.save();
        const statusMessage = user.status === "active" ? "activated" : "deactivated";
        res.status(200).json({
            message: `User successfully ${statusMessage}.`,
        });
    }
    catch (error) {
        logger_1.default.error("Error toggling user status:", error);
        res.status(500).json({ message: "Failed to toggle user status." });
    }
});
exports.toggleUserStatus = toggleUserStatus;
const viewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    try {
        // Fetch the user
        const user = yield user_1.default.findByPk(userId, {
            include: [
                {
                    model: kyc_1.default,
                    as: "kyc",
                },
            ],
            attributes: { exclude: ["password"] }, // Exclude sensitive fields like password
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res
            .status(200)
            .json({ message: "User retrieved successfully.", data: user });
    }
    catch (error) {
        logger_1.default.error("Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user.", error });
    }
});
exports.viewUser = viewUser;
const getGeneralStores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 items per page
        const offset = (page - 1) * limit; // Calculate offset
        // Fetch stores with pagination and associated data
        const { rows: stores, count: totalStores } = yield store_1.default.findAndCountAll({
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: currency_1.default,
                    as: "currency",
                },
                {
                    model: product_1.default,
                    as: "products",
                    attributes: [], // Exclude detailed product attributes
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionproducts",
                    attributes: [], // Exclude detailed auction product attributes
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM auction_products AS auctionproduct
                            WHERE auctionproduct.storeId = Store.id
                        )`),
                        "totalAuctionProducts",
                    ],
                ],
            },
            offset, // Apply offset for pagination
            limit, // Apply limit for pagination
            order: [["createdAt", "DESC"]], // Order stores by creation date, newest first
        });
        // Check if any stores were found
        if (!stores || stores.length === 0) {
            res.status(404).json({
                message: "No stores found.",
                data: [],
                pagination: {
                    total: totalStores,
                    page,
                    pages: Math.ceil(totalStores / limit),
                },
            });
            return;
        }
        // Return stores with pagination metadata
        res.status(200).json({
            message: "Stores retrieved successfully.",
            data: stores,
            pagination: {
                total: totalStores,
                page,
                pages: Math.ceil(totalStores / limit),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving stores:", error);
        res
            .status(500)
            .json({ message: "Failed to retrieve stores", error: error.message });
    }
});
exports.getGeneralStores = getGeneralStores;
const viewGeneralStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get productId from route params instead of query
    const { storeId } = req.query;
    try {
        const store = yield store_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: storeId }, { name: storeId }],
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: currency_1.default,
                    as: "currency",
                    attributes: ["symbol"],
                },
                {
                    model: product_1.default,
                    as: "products",
                    attributes: [], // Exclude detailed product attributes
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionproducts",
                    attributes: [], // Exclude detailed auction product attributes
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM auction_products AS auctionproduct
                            WHERE auctionproduct.storeId = Store.id
                        )`),
                        "totalAuctionProducts",
                    ],
                ],
            },
        });
        if (!store) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        // Respond with the found store
        res.status(200).json({
            data: store,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch store" });
    }
});
exports.viewGeneralStore = viewGeneralStore;
const getGeneralProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, sku, status, condition, categoryName, page, limit } = req.query;
    try {
        // Get pagination parameters
        const pageNumber = parseInt(page, 10) || 1; // Default to page 1 if not provided
        const limitNumber = parseInt(limit, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * limitNumber;
        // Fetch products with filters, pagination, and associated data
        const { rows: products, count: totalProducts } = yield product_1.default.findAndCountAll(Object.assign(Object.assign({ include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: store_1.default,
                    as: "store",
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })), { offset, limit: limitNumber, order: [["createdAt", "DESC"]] }));
        // Check if products were found
        if (!products || products.length === 0) {
            res.status(404).json({
                message: "No products found.",
                data: [],
                pagination: {
                    total: totalProducts,
                    page: pageNumber,
                    pages: Math.ceil(totalProducts / limitNumber),
                },
            });
            return;
        }
        // Return products with pagination metadata
        res.status(200).json({
            message: "Products retrieved successfully.",
            data: products,
            pagination: {
                total: totalProducts,
                page: pageNumber,
                pages: Math.ceil(totalProducts / limitNumber),
            },
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: "Failed to fetch products", error: error.message });
    }
});
exports.getGeneralProducts = getGeneralProducts;
const viewGeneralProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get productId from route params instead of query
    const { productId } = req.query;
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Respond with the found product
        res.status(200).json({
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.viewGeneralProduct = viewGeneralProduct;
const deleteGeneralProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.query;
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        const relatedTables = [
            { name: "save_products", model: saveproduct_1.default, field: "productId" },
            { name: "review_products", model: reviewproduct_1.default, field: "productId" },
            { name: "carts", model: cart_1.default, field: "productId" },
        ];
        if (product.type === "dropship") {
            yield dropshipProducts_1.default.destroy({ where: { productId: product.id } });
        }
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: product.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete product because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});
exports.deleteGeneralProduct = deleteGeneralProduct;
const unpublishProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.query.productId;
    try {
        // Find the product by ID
        const product = yield product_1.default.findByPk(productId, {
            include: [{ model: user_1.default, as: "vendor" }],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if the product is already unpublished
        if (product.status === "inactive") {
            res.status(400).json({ message: "Product is already unpublished" });
            return;
        }
        // Update product status to inactive
        product.status = "inactive";
        yield product.save();
        // Remove the product from all carts
        yield cart_1.default.destroy({ where: { productId } });
        // Notify the vendor
        const notificationTitle = "Product Unpublished";
        const notificationMessage = `Your product "${product.name}" has been unpublished by an admin. Please review your listing.`;
        const notificationType = "product_unpublished";
        yield notification_1.default.create({
            userId: product.vendorId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
        });
        res.status(200).json({ message: "Product unpublished successfully" });
    }
    catch (error) {
        logger_1.default.error("Error unpublishing product:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.unpublishProduct = unpublishProduct;
const publishProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = req.query.productId;
    try {
        // Find the product by ID
        const product = yield product_1.default.findByPk(productId, {
            include: [{ model: user_1.default, as: "vendor" }],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if the product is already active
        if (product.status === "active") {
            res.status(400).json({ message: "Product is already published" });
            return;
        }
        // Update product status to active
        product.status = "active";
        yield product.save();
        // Notify the vendor
        const notificationTitle = "Product Published";
        const notificationMessage = `Your product "${product.name}" has been published and is now visible to customers.`;
        const notificationType = "product_published";
        yield notification_1.default.create({
            userId: product.vendorId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
        });
        res.status(200).json({ message: "Product published successfully" });
    }
    catch (error) {
        logger_1.default.error("Error publishing product:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.publishProduct = publishProduct;
const getGeneralAuctionProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, sku, status, condition, categoryName, page, limit } = req.query;
    try {
        // Get pagination parameters
        const pageNumber = parseInt(page, 10) || 1; // Default to page 1 if not provided
        const limitNumber = parseInt(limit, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * limitNumber;
        // Fetch auction products with filters, pagination, and associated data
        const { rows: auctionProducts, count: totalAuctionProducts } = yield auctionproduct_1.default.findAndCountAll(Object.assign(Object.assign({ include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: store_1.default,
                    as: "store",
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })), { offset, limit: limitNumber, order: [["createdAt", "DESC"]] }));
        // Check if auction products were found
        if (!auctionProducts || auctionProducts.length === 0) {
            res.status(404).json({
                message: "No auction products found for this vendor.",
                data: [],
                pagination: {
                    total: totalAuctionProducts,
                    page: pageNumber,
                    pages: Math.ceil(totalAuctionProducts / limitNumber),
                },
            });
            return;
        }
        // Return auction products with pagination metadata
        res.status(200).json({
            message: "Auction products fetched successfully.",
            data: auctionProducts,
            pagination: {
                total: totalAuctionProducts,
                page: pageNumber,
                pages: Math.ceil(totalAuctionProducts / limitNumber),
            },
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching auction products.",
        });
    }
});
exports.getGeneralAuctionProducts = getGeneralAuctionProducts;
const viewGeneralAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get auctionProductId from route params instead of query
    const { auctionProductId } = req.query;
    try {
        const product = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Auction Product not found." });
            return;
        }
        // Respond with the found product
        res.status(200).json({
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.viewGeneralAuctionProduct = viewGeneralAuctionProduct;
const deleteGeneralAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionProductId } = req.query;
    try {
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auctionStatus is 'upcoming' and no bids exist
        if (auctionProduct.auctionStatus !== "upcoming") {
            res
                .status(400)
                .json({ message: "Only upcoming auction products can be deleted." });
            return;
        }
        const bidCount = yield bid_1.default.count({
            where: { auctionProductId },
        });
        if (bidCount > 0) {
            res.status(400).json({
                message: "Auction product already has bids, cannot be deleted.",
            });
            return;
        }
        const relatedTables = [{ name: "bids", model: bid_1.default, field: "auctionProductId" }];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: auctionProduct.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete auction product because related records exist in ${table.name}`,
                });
                return;
            }
        }
        // Delete the auction product
        yield auctionProduct.destroy();
        res.status(200).json({ message: "Auction product deleted successfully." });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({
                message: error.message ||
                    "An error occurred while deleting the auction product.",
            });
        }
    }
});
exports.deleteGeneralAuctionProduct = deleteGeneralAuctionProduct;
const getAllBiddersByAuctionProductId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { auctionProductId } = req.query; // Get auctionProductId from request params
        if (!auctionProductId) {
            res.status(400).json({ message: "Auction Product ID is required." });
            return;
        }
        // Fetch all bids for the given auctionProductId
        const bids = yield bid_1.default.findAll({
            where: { auctionProductId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionProduct",
                },
            ],
            order: [["createdAt", "DESC"]], // Order bids from newest to oldest
        });
        res.status(200).json({
            message: "Bids retrieved successfully.",
            data: bids,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving bids:", error);
        res.status(500).json({
            message: error.message || "An error occurred while retrieving bids.",
        });
    }
});
exports.getAllBiddersByAuctionProductId = getAllBiddersByAuctionProductId;
const getAllGeneralOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingNumber, page, limit } = req.query; // Only track by tracking number, no pagination
    try {
        // Fetch orders with the count of order items, and apply search by tracking number
        const orders = yield order_1.default.findAll({
            where: Object.assign({}, (trackingNumber && {
                trackingNumber: { [sequelize_1.Op.like]: `%${trackingNumber}%` }, // Search by tracking number
            })),
            attributes: {
                include: [
                    [
                        sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("orderItems.id")),
                        "orderItemsCount", // Alias for the count of order items
                    ],
                ],
            },
            include: [
                {
                    model: orderitem_1.default,
                    as: "orderItems",
                    attributes: [], // Do not include actual order items
                },
            ],
            group: ["Order.id"], // Group by order to ensure correct counting
            order: [["createdAt", "DESC"]], // Order by createdAt
        });
        if (!orders || orders.length === 0) {
            res.status(404).json({ message: "No orders found for this user" });
            return;
        }
        // Return the response with orders data
        res.status(200).json({
            message: "Orders retrieved successfully",
            data: orders,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllGeneralOrders = getAllGeneralOrders;
const getAllGeneralOrderItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, page = 1, limit = 10 } = req.query;
    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Ensure `orderId` is provided
        if (!orderId) {
            res.status(400).json({ message: "Order ID is required" });
            return;
        }
        // Query for order items with pagination
        const { rows: orderItems, count } = yield orderitem_1.default.findAndCountAll({
            where: { orderId },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
            ],
            limit: limitNumber,
            offset,
            order: [["createdAt", "DESC"]],
        });
        // Handle the case where no order items are found
        if (!orderItems || orderItems.length === 0) {
            res.status(404).json({
                message: "No items found for this order",
                data: [],
                pagination: {
                    total: 0,
                    page: pageNumber,
                    pages: 0,
                },
            });
            return;
        }
        // Calculate total pages
        const totalPages = Math.ceil(count / limitNumber);
        // Return paginated results
        res.status(200).json({
            message: "Order items retrieved successfully",
            data: orderItems,
            pagination: {
                total: count, // Total number of order items
                page: pageNumber,
                pages: totalPages,
                limit: limitNumber,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching order items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllGeneralOrderItems = getAllGeneralOrderItems;
const getGeneralPaymentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId, page = 1, limit = 10 } = req.query;
    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Ensure `orderId` is provided
        if (!orderId) {
            res.status(400).json({ message: "Order ID is required" });
            return;
        }
        // Fetch payments for the given orderId with pagination
        const { count, rows: payments } = yield payment_1.default.findAndCountAll({
            where: { orderId },
            limit: limitNumber,
            offset,
            order: [["createdAt", "DESC"]], // Order by latest payments
        });
        // Handle case where no payments are found
        if (!payments || payments.length === 0) {
            res.status(404).json({
                message: "No payments found for this order",
                data: [],
                pagination: {
                    total: 0,
                    page: pageNumber,
                    pages: 0,
                },
            });
            return;
        }
        // Calculate total pages
        const totalPages = Math.ceil(count / limitNumber);
        // Return paginated results
        res.status(200).json({
            message: "Payments retrieved successfully",
            data: payments,
            pagination: {
                total: count, // Total number of payments
                page: pageNumber,
                pages: totalPages,
                limit: limitNumber,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching payment details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getGeneralPaymentDetails = getGeneralPaymentDetails;
const getAllSubscribers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, subscriptionPlanId, isActive } = req.query; // Destructure query params for page, limit, etc.
    try {
        // Pagination and filtering
        const offset = (Number(page) - 1) * Number(limit);
        // Construct filter criteria
        const filters = {};
        if (subscriptionPlanId) {
            filters.subscriptionPlanId = subscriptionPlanId;
        }
        if (isActive !== undefined) {
            filters.isActive = isActive === "true";
        }
        // Fetch vendor subscriptions with pagination and filters
        const subscribers = yield vendorsubscription_1.default.findAndCountAll({
            where: filters, // Apply filters (if any)
            limit: Number(limit), // Limit results per page
            offset, // Offset for pagination
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Specify which subscription plan fields to include
                },
                {
                    model: subscriptionplan_1.default,
                    as: "subscriptionPlans",
                    attributes: ["id", "name", "price", "duration"], // Specify which subscription plan fields to include
                },
            ],
            order: [["createdAt", "DESC"]], // Optional: Order by creation date
        });
        // If no subscribers found
        if (!subscribers || subscribers.count === 0) {
            res.status(404).json({ message: "No subscribers found" });
            return;
        }
        // Return the paginated subscribers with subscription plan details
        res.status(200).json({
            message: "Subscribers retrieved successfully",
            data: subscribers.rows,
            pagination: {
                total: subscribers.count, // Total number of order items
                page: Number(page),
                pages: Math.ceil(subscribers.count / Number(limit)),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        // Handle any unexpected errors
        logger_1.default.error("Error retrieving subscribers:", error);
        res.status(500).json({ message: "Failed to retrieve subscribers" });
    }
});
exports.getAllSubscribers = getAllSubscribers;
const getStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const stores = yield store_1.default.findAll({
            where: { vendorId: adminId },
            include: [
                {
                    model: currency_1.default,
                    as: "currency",
                },
                {
                    model: product_1.default,
                    as: "products",
                    attributes: [], // Don't include individual product details
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionproducts",
                    attributes: [], // Don't include individual product details
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM auction_products AS auctionproduct
                            WHERE auctionproduct.storeId = Store.id
                        )`),
                        "totalAuctionProducts",
                    ],
                ],
            },
        });
        // Check if any stores were found
        if (stores.length === 0) {
            res
                .status(404)
                .json({ message: "No stores found for this admin.", data: [] });
            return;
        }
        res.status(200).json({ data: stores });
    }
    catch (error) {
        logger_1.default.error("Error retrieving stores:", error);
        res.status(500).json({ message: "Failed to retrieve stores", error });
    }
});
exports.getStore = getStore;
const createStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { currencyId, name, location, logo, businessHours, deliveryOptions, tipsOnFinding, } = req.body;
    if (!currencyId) {
        res.status(400).json({ message: "Currency ID is required." });
        return;
    }
    try {
        // Check if a store with the same name exists for this vendorId
        const existingStore = yield store_1.default.findOne({
            where: { vendorId: adminId, name },
        });
        if (existingStore) {
            res.status(400).json({
                message: "A store with this name already exists for the vendor.",
            });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }
        // Create the store
        const store = yield store_1.default.create({
            vendorId: adminId,
            currencyId: currency.id,
            name,
            location,
            businessHours,
            deliveryOptions,
            logo,
            tipsOnFinding,
        });
        res
            .status(200)
            .json({ message: "Store created successfully", data: store });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create store", error });
    }
});
exports.createStore = createStore;
const updateStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { storeId, currencyId, name, location, businessHours, deliveryOptions, tipsOnFinding, logo, } = req.body;
    try {
        const store = yield store_1.default.findOne({ where: { id: storeId } });
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }
        // Check for unique name for this vendorId if name is being updated
        if (name && store.name !== name) {
            const existingStore = yield store_1.default.findOne({
                where: { vendorId: adminId, name, id: { [sequelize_1.Op.ne]: storeId } },
            });
            if (existingStore) {
                res.status(400).json({
                    message: "A store with this name already exists for the vendor.",
                });
                return;
            }
        }
        // Update store fields
        yield store.update({
            currencyId,
            name,
            location,
            businessHours,
            deliveryOptions,
            tipsOnFinding,
            logo,
        });
        res
            .status(200)
            .json({ message: "Store updated successfully", data: store });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to update store", error });
    }
});
exports.updateStore = updateStore;
const deleteStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const storeId = req.query.storeId;
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const store = yield store_1.default.findOne({ where: { id: storeId }, transaction });
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        const relatedTables = [
            { name: "auction_products", model: auctionproduct_1.default, field: "storeId" },
            { name: "products", model: product_1.default, field: "storeId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: store.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete store because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield store.destroy({ transaction });
        yield transaction.commit();
        res
            .status(200)
            .json({ message: "Store and all associations deleted successfully" });
    }
    catch (error) {
        yield transaction.rollback();
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete store because it has associated records. Ensure all dependencies are handled before deleting the store.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({ message: "Failed to delete store", error });
        }
    }
});
exports.deleteStore = deleteStore;
// Product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const _b = req.body, { storeId, categoryId, name } = _b, otherData = __rest(_b, ["storeId", "categoryId", "name"]);
    try {
        // Check for duplicates
        const existingProduct = yield product_1.default.findOne({
            where: { vendorId: adminId, name },
        });
        if (existingProduct) {
            res.status(400).json({
                message: "Product with this vendorId and name already exists.",
            });
            return;
        }
        // Check if vendorId, storeId, and categoryId exist
        const vendorExists = yield admin_1.default.findByPk(adminId);
        const storeExists = yield store_1.default.findByPk(storeId);
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!vendorExists) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }
        if (!storeExists) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        // Generate a unique SKU (could also implement a more complex logic if needed)
        let sku;
        let isUnique = false;
        while (!isUnique) {
            sku = `KDM-${(0, uuid_1.v4)()}`; // Generate a unique SKU
            const skuExists = yield product_1.default.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }
        // Create the product
        const product = yield product_1.default.create(Object.assign({ vendorId: adminId, storeId,
            categoryId,
            name,
            sku }, otherData));
        res
            .status(200)
            .json({ message: "Product created successfully", data: product });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create product" });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _b = req.body, { productId } = _b, updateData = __rest(_b, ["productId"]);
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        yield product.update(updateData);
        res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to update product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.query;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        const relatedTables = [
            { name: "save_products", model: saveproduct_1.default, field: "productId" },
            { name: "review_products", model: reviewproduct_1.default, field: "productId" },
            { name: "carts", model: cart_1.default, field: "productId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: product.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete product because related records exist in ${table.name}`,
                });
                return;
            }
        }
        yield product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});
exports.deleteProduct = deleteProduct;
const fetchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { name, sku, status, condition, categoryName } = req.query;
    try {
        const products = yield product_1.default.findAll(Object.assign({ where: { vendorId: adminId }, include: [
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: store_1.default,
                    as: "store",
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })));
        res.status(200).json({
            data: products,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});
exports.fetchProducts = fetchProducts;
const viewProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get productId from route params instead of query
    const { productId } = req.query;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
            include: [
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Respond with the found product
        res.status(200).json({
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.viewProduct = viewProduct;
const moveToDraft = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.query; // Get productId from request query
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        // Validate productId type
        if (typeof productId !== "string") {
            res.status(400).json({ message: "Invalid productId." });
            return;
        }
        // Find the product by either ID or SKU, ensuring it belongs to the authenticated vendor
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
        });
        // If no product is found, return a 404 response
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Update the product's status to 'draft'
        product.status = "draft";
        yield product.save();
        // Remove the product from all carts
        yield cart_1.default.destroy({ where: { productId } });
        // Respond with the updated product
        res.status(200).json({
            message: "Product moved to draft.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to move product to draft." });
    }
});
exports.moveToDraft = moveToDraft;
const changeProductStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId, status } = req.body; // Get productId and status from request body
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    // Validate status
    if (!["active", "inactive", "draft"].includes(status)) {
        res.status(400).json({ message: "Invalid status." });
        return;
    }
    try {
        // Find the product by ID or SKU
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
        });
        // Check if the product exists
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Update the product status
        product.status = status;
        yield product.save();
        // Respond with the updated product details
        res.status(200).json({
            message: "Product status updated successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to update product status." });
    }
});
exports.changeProductStatus = changeProductStatus;
// Auction Product
const createAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { storeId, categoryId, name, condition, description, specification, price, bidIncrement, maxBidsPerUser, participantsInterestFee, startDate, endDate, image, additionalImages, } = req.body;
    try {
        // Check if adminId, storeId, and categoryId exist
        const vendorExists = yield admin_1.default.findByPk(adminId);
        const storeExists = yield store_1.default.findByPk(storeId);
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!vendorExists) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }
        if (!storeExists) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        // Generate a unique SKU
        let sku;
        let isUnique = false;
        while (!isUnique) {
            sku = `KDM-${(0, uuid_1.v4)()}`; // Generate a unique SKU
            const skuExists = yield product_1.default.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }
        // Create the auction product
        const auctionProduct = yield auctionproduct_1.default.create({
            vendorId: adminId,
            storeId,
            categoryId,
            name,
            sku,
            condition,
            description,
            specification,
            price,
            bidIncrement,
            maxBidsPerUser,
            participantsInterestFee,
            startDate,
            endDate,
            image,
            additionalImages,
        });
        res.status(201).json({
            message: "Auction product created successfully.",
            data: auctionProduct,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message ||
                "An error occurred while creating the auction product.",
        });
    }
});
exports.createAuctionProduct = createAuctionProduct;
const updateAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { auctionProductId, storeId, categoryId, name, condition, description, specification, price, bidIncrement, maxBidsPerUser, participantsInterestFee, startDate, endDate, image, additionalImages, } = req.body;
    try {
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId: adminId,
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auction product is "upcoming" and has no bids
        if (auctionProduct.auctionStatus !== "upcoming") {
            res.status(400).json({
                message: "Auction product status must be 'upcoming' to update.",
            });
            return;
        }
        // Check if there are any bids placed for the auction product
        const bidExists = yield bid_1.default.findOne({ where: { auctionProductId } });
        if (bidExists) {
            res.status(400).json({
                message: "Auction product already has bids and cannot be updated.",
            });
            return;
        }
        // Check if vendorId matches the auction product's vendorId
        if (auctionProduct.vendorId !== adminId) {
            res
                .status(403)
                .json({ message: "You can only update your own auction products." });
            return;
        }
        // Check if vendor, store, and category exist
        const vendorExists = yield admin_1.default.findByPk(adminId);
        const storeExists = yield store_1.default.findByPk(storeId);
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!vendorExists) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }
        if (!storeExists) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        // Update the auction product
        auctionProduct.storeId = storeId || auctionProduct.storeId;
        auctionProduct.categoryId = categoryId || auctionProduct.categoryId;
        auctionProduct.name = name || auctionProduct.name;
        auctionProduct.condition = condition || auctionProduct.condition;
        auctionProduct.description = description || auctionProduct.description;
        auctionProduct.specification =
            specification || auctionProduct.specification;
        auctionProduct.price = price || auctionProduct.price;
        auctionProduct.bidIncrement = bidIncrement || auctionProduct.bidIncrement;
        auctionProduct.maxBidsPerUser =
            maxBidsPerUser || auctionProduct.maxBidsPerUser;
        auctionProduct.participantsInterestFee =
            participantsInterestFee || auctionProduct.participantsInterestFee;
        auctionProduct.startDate = startDate || auctionProduct.startDate;
        auctionProduct.endDate = endDate || auctionProduct.endDate;
        auctionProduct.image = image || auctionProduct.image;
        auctionProduct.additionalImages =
            additionalImages || auctionProduct.additionalImages;
        // Save the updated auction product
        yield auctionProduct.save();
        res.status(200).json({
            message: "Auction product updated successfully.",
            auctionProduct,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message ||
                "An error occurred while updating the auction product.",
        });
    }
});
exports.updateAuctionProduct = updateAuctionProduct;
const deleteAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { auctionProductId } = req.query;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId: adminId,
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auctionStatus is 'upcoming' and no bids exist
        if (auctionProduct.auctionStatus !== "upcoming") {
            res
                .status(400)
                .json({ message: "Only upcoming auction products can be deleted." });
            return;
        }
        const bidCount = yield bid_1.default.count({
            where: { auctionProductId },
        });
        if (bidCount > 0) {
            res.status(400).json({
                message: "Auction product already has bids, cannot be deleted.",
            });
            return;
        }
        const relatedTables = [{ name: "bids", model: bid_1.default, field: "auctionProductId" }];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: auctionProduct.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete auction product because related records exist in ${table.name}`,
                });
                return;
            }
        }
        // Delete the auction product
        yield auctionProduct.destroy();
        res.status(200).json({ message: "Auction product deleted successfully." });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({
                message: error.message ||
                    "An error occurred while deleting the auction product.",
            });
        }
    }
});
exports.deleteAuctionProduct = deleteAuctionProduct;
const cancelAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { auctionProductId } = req.query;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId: adminId,
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auctionStatus is 'upcoming' and no bids exist
        if (auctionProduct.auctionStatus !== "upcoming") {
            res
                .status(400)
                .json({ message: "Only upcoming auction products can be cancelled." });
            return;
        }
        // Check if vendorId matches the auction product's vendorId
        if (auctionProduct.vendorId !== adminId) {
            res
                .status(403)
                .json({ message: "You can only cancel your own auction products." });
            return;
        }
        // Change the auction product auctionStatus to 'cancelled'
        auctionProduct.auctionStatus = "cancelled";
        yield auctionProduct.save();
        res.status(200).json({
            message: "Auction product has been cancelled successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message ||
                "An error occurred while cancelling the auction product.",
        });
    }
});
exports.cancelAuctionProduct = cancelAuctionProduct;
const fetchAuctionProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { name, sku, status, condition, categoryName } = req.query;
    try {
        // Fetch all auction products for the vendor
        const auctionProducts = yield auctionproduct_1.default.findAll(Object.assign({ where: {
                vendorId: adminId,
            }, include: [
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: store_1.default,
                    as: "store",
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })));
        if (auctionProducts.length === 0) {
            res.status(404).json({
                message: "No auction products found for this vendor.",
                data: [],
            });
            return;
        }
        res.status(200).json({
            message: "Auction products fetched successfully.",
            data: auctionProducts,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message || "An error occurred while fetching auction products.",
        });
    }
});
exports.fetchAuctionProducts = fetchAuctionProducts;
const viewAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get auctionProductId from route params instead of query
    const { auctionProductId } = req.query;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const product = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId: adminId,
            },
            include: [
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Auction Product not found." });
            return;
        }
        // Respond with the found product
        res.status(200).json({
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.viewAuctionProduct = viewAuctionProduct;
const getAllBidsByAuctionProductId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { auctionProductId } = req.query; // Get auctionProductId from request params
        if (!auctionProductId) {
            res.status(400).json({ message: "Auction Product ID is required." });
            return;
        }
        // Fetch all bids for the given auctionProductId
        const bids = yield bid_1.default.findAll({
            where: { auctionProductId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionProduct",
                },
            ],
            order: [["createdAt", "DESC"]], // Order bids from newest to oldest
        });
        res.status(200).json({
            message: "Bids retrieved successfully.",
            data: bids,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving bids:", error);
        res.status(500).json({
            message: error.message || "An error occurred while retrieving bids.",
        });
    }
});
exports.getAllBidsByAuctionProductId = getAllBidsByAuctionProductId;
const getTransactionsForAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionType, refId, status, userName, page, limit } = req.query;
    try {
        // Get pagination parameters
        const pageNumber = parseInt(page, 10) || 1; // Default to page 1 if not provided
        const limitNumber = parseInt(limit, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * limitNumber;
        // Fetch transactions with filters, pagination, and associated data
        const { rows: transactions, count: totalTransactions } = yield transaction_1.default.findAndCountAll({
            include: [
                Object.assign({ model: user_1.default, as: "user", attributes: ["id", "firstName", "lastName", "email"] }, (userName && {
                    where: {
                        [sequelize_1.Op.or]: [
                            { firstName: { [sequelize_1.Op.like]: `%${userName}%` } },
                            { lastName: { [sequelize_1.Op.like]: `%${userName}%` } },
                            { email: { [sequelize_1.Op.like]: `%${userName}%` } },
                        ],
                    },
                })),
            ],
            where: Object.assign(Object.assign(Object.assign({}, (transactionType && {
                transactionType: { [sequelize_1.Op.like]: `%${transactionType}%` },
            })), (refId && { refId: { [sequelize_1.Op.like]: `%${refId}%` } })), (status && { status })),
            offset, // Apply offset for pagination
            limit: limitNumber, // Apply limit for pagination
            order: [["createdAt", "DESC"]], // Order by creation date (newest first)
        });
        // Check if transactions were found
        if (!transactions || transactions.length === 0) {
            res.status(404).json({
                message: "No transactions found.",
                data: [],
                pagination: {
                    total: totalTransactions,
                    page: pageNumber,
                    pages: Math.ceil(totalTransactions / limitNumber),
                },
            });
            return;
        }
        // Return transactions with pagination metadata
        res.status(200).json({
            message: "Transactions retrieved successfully.",
            data: transactions,
            pagination: {
                total: totalTransactions,
                page: pageNumber,
                pages: Math.ceil(totalTransactions / limitNumber),
            },
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res
            .status(500)
            .json({ message: "Failed to fetch transactions", error: error.message });
    }
});
exports.getTransactionsForAdmin = getTransactionsForAdmin;
// Adverts
const activeProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { name } = req.query;
    try {
        const products = yield product_1.default.findAll(Object.assign({ where: { vendorId: adminId, status: "active" } }, (name && {
            where: Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })),
        })));
        res.status(200).json({
            data: products,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch active products" });
    }
});
exports.activeProducts = activeProducts;
const createAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { categoryId, productId, title, description, media_url, showOnHomepage, link, } = req.body;
    try {
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res.status(404).json({ message: "Product not found." });
                return;
            }
        }
        const newAdvert = yield advert_1.default.create({
            userId: adminId,
            categoryId,
            productId,
            title,
            description,
            media_url,
            status: "approved",
            showOnHomepage,
            link,
        });
        res.status(201).json({
            message: "Advert created successfully",
            data: newAdvert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create advert" });
    }
});
exports.createAdvert = createAdvert;
const updateAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { advertId, categoryId, productId, title, description, media_url, showOnHomepage, link, } = req.body;
    try {
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res.status(404).json({ message: "Product not found." });
                return;
            }
        }
        const advert = yield advert_1.default.findByPk(advertId);
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        advert.categoryId = categoryId || advert.categoryId;
        advert.productId = productId || advert.productId;
        advert.title = title || advert.title;
        advert.description = description || advert.description;
        advert.media_url = media_url || advert.media_url;
        advert.showOnHomepage = showOnHomepage || advert.showOnHomepage;
        advert.link = link || advert.link;
        yield advert.save();
        res.status(200).json({
            message: "Advert updated successfully",
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to update advert" });
    }
});
exports.updateAdvert = updateAdvert;
const getAdverts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { search, page = 1, limit = 10 } = req.query;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Build the where condition for the search query (using Op.or for title and status)
        const whereConditions = { userId: adminId };
        if (search) {
            whereConditions[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search}%` } },
                { status: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        // Fetch adverts with pagination, filters, and associated data
        const { count, rows: adverts } = yield advert_1.default.findAndCountAll({
            where: whereConditions,
            include: [
                { model: product_1.default, as: "product", attributes: ["id", "name"] },
                { model: subcategory_1.default, as: "sub_category" },
            ],
            limit: limitNumber,
            offset,
            order: [["createdAt", "DESC"]], // Order by latest adverts
        });
        // Handle case where no adverts are found
        if (!adverts || adverts.length === 0) {
            res.status(404).json({
                message: "No adverts found",
                data: [],
                pagination: {
                    total: 0,
                    page: pageNumber,
                    pages: 0,
                },
            });
            return;
        }
        // Calculate total pages
        const totalPages = Math.ceil(count / limitNumber);
        // Return paginated results
        res.status(200).json({
            message: "Adverts fetched successfully",
            data: adverts,
            pagination: {
                total: count, // Total number of adverts
                page: pageNumber,
                pages: totalPages,
                limit: limitNumber,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAdverts = getAdverts;
const viewAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const advertId = req.query.advertId;
    try {
        const advert = yield advert_1.default.findByPk(advertId, {
            include: [
                { model: product_1.default, as: "product" },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        res.status(200).json({
            message: "Advert fetched successfully",
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch advert" });
    }
});
exports.viewAdvert = viewAdvert;
const deleteAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const advertId = req.query.advertId;
    try {
        const advert = yield advert_1.default.findByPk(advertId);
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        yield advert.destroy();
        res.status(200).json({
            message: "Advert deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete advert" });
    }
});
exports.deleteAdvert = deleteAdvert;
const getGeneralAdverts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, page = 1, limit = 10 } = req.query;
    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Build the where condition for the search query (using Op.or for title and status)
        const whereConditions = {};
        if (search) {
            whereConditions[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search}%` } },
                { status: { [sequelize_1.Op.like]: `%${search}%` } },
                { showOnHomepage: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        // Fetch adverts with pagination, filters, and associated data
        const { count, rows: adverts } = yield advert_1.default.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                { model: product_1.default, as: "product", attributes: ["id", "name"] },
                { model: subcategory_1.default, as: "sub_category" },
            ],
            limit: limitNumber,
            offset,
            order: [["createdAt", "DESC"]], // Order by latest adverts
        });
        // Handle case where no adverts are found
        if (!adverts || adverts.length === 0) {
            res.status(404).json({
                message: "No adverts found",
                data: [],
                pagination: {
                    total: 0,
                    page: pageNumber,
                    pages: 0,
                },
            });
            return;
        }
        // Calculate total pages
        const totalPages = Math.ceil(count / limitNumber);
        // Return paginated results
        res.status(200).json({
            message: "Adverts fetched successfully",
            data: adverts,
            pagination: {
                total: count, // Total number of adverts
                page: pageNumber,
                pages: totalPages,
                limit: limitNumber,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getGeneralAdverts = getGeneralAdverts;
const viewGeneralAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const advertId = req.query.advertId;
    try {
        const advert = yield advert_1.default.findByPk(advertId, {
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                { model: product_1.default, as: "product" },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        res.status(200).json({
            message: "Advert fetched successfully",
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch advert" });
    }
});
exports.viewGeneralAdvert = viewGeneralAdvert;
const approveOrRejectAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { advertId, status, adminNote } = req.body;
    // Validate required fields
    if (!advertId || !status) {
        res.status(400).json({ message: "Advert ID and status are required." });
        return;
    }
    // Validate status value
    if (!["approved", "rejected"].includes(status)) {
        res.status(400).json({
            message: "Invalid status. Only 'approved' or 'rejected' allowed.",
        });
        return;
    }
    // If rejected, ensure adminNote is provided
    if (status === "rejected" && !adminNote) {
        res
            .status(400)
            .json({ message: "Admin note is required when rejecting an advert." });
        return;
    }
    try {
        // Find the advert
        const advert = yield advert_1.default.findByPk(advertId);
        if (!advert) {
            res.status(404).json({ message: "Advert not found." });
            return;
        }
        // Update the advert status
        advert.status = status;
        if (status === "rejected") {
            advert.adminNote = adminNote;
        }
        // Save the changes
        yield advert.save();
        // Send notification
        yield notification_1.default.create({
            userId: advert.userId, // Notify the advert owner
            title: `Your advert has been ${status}`,
            message: status === "approved"
                ? "Your advert has been approved and is now live."
                : `Your advert was rejected. Reason: ${adminNote}`,
            type: "advert_status",
            isRead: false,
        });
        res.status(200).json({
            message: `Advert ${status} successfully.`,
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating advert status:", error);
        res.status(500).json({ message: "Failed to update advert status." });
    }
});
exports.approveOrRejectAdvert = approveOrRejectAdvert;
// Orders
const getOrderItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        // Fetch OrderItems related to the vendor
        const orderItems = yield orderitem_1.default.findAll({
            where: { vendorId: adminId },
            include: [
                {
                    model: order_1.default,
                    as: "order",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "email",
                                "phoneNumber",
                            ], // Include user details
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]], // Sort by most recent
        });
        if (!orderItems || orderItems.length === 0) {
            res
                .status(404)
                .json({ message: "No order items found for this vendor." });
            return;
        }
        res.status(200).json({
            message: "Order items retrieved successfully",
            data: orderItems,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message || "Failed to retrieve order items." });
    }
});
exports.getOrderItems = getOrderItems;
const viewOrderItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderItemId } = req.query;
    try {
        // Query for a single order item and required associations
        const orderItem = yield orderitem_1.default.findOne({
            where: { id: orderItemId },
            include: [
                {
                    model: order_1.default,
                    as: "order",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "email",
                                "phoneNumber",
                            ], // Include user details
                        },
                    ],
                },
            ],
        });
        // If order item is not found
        if (!orderItem) {
            res.status(404).json({ message: "Order item not found" });
            return;
        }
        // Convert Sequelize model to plain object and add computed field
        const formattedOrderItem = Object.assign(Object.assign({}, orderItem.get()), { totalPrice: orderItem.quantity * orderItem.price });
        res.status(200).json({
            message: "Order item retrieved successfully",
            data: formattedOrderItem,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching order item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.viewOrderItem = viewOrderItem;
const getDropshipedOrderItemDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { orderItemId } = req.query;
    if (!orderItemId) {
        res.status(400).json({ message: "Order item ID is required." });
        return;
    }
    try {
        // Fetch the order item along with its order and user details
        const orderItem = yield orderitem_1.default.findOne({
            where: { id: orderItemId },
            include: [
                {
                    model: order_1.default,
                    as: "order",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "email",
                                "phoneNumber",
                            ], // Include user details
                        },
                    ],
                },
            ],
        });
        if (!orderItem) {
            res.status(404).json({ message: "Order item not found." });
            return;
        }
        if (!orderItem.dropshipProductId) {
            res.status(400).json({ message: "This order item is not dropshipped." });
            return;
        }
        if (!orderItem.dropshipOrderItemIds || orderItem.dropshipOrderItemIds.length === 0) {
            res.status(404).json({ message: "No dropshipped order item IDs found." });
            return;
        }
        //@ts-ignore
        const dropshipOrderItemDetails = yield Promise
            .all(orderItem.dropshipOrderItemIds.map((dropshipOrderItemId) => 
        //@ts-ignore
        dropShippingService.getOrderDetails(adminId, dropshipOrderItemId)));
        if (!dropshipOrderItemDetails || dropshipOrderItemDetails.length === 0 || dropshipOrderItemDetails.every(detail => !detail)) {
            res.status(404).json({ message: "No dropshipped order item details found." });
            return;
        }
        res.status(200).json({
            message: "Dropshipped order item details retrieved successfully.",
            data: dropshipOrderItemDetails,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving dropshipped order item details:", error);
        res
            .status(500)
            .json({ message: "Failed to retrieve dropshipped order item details." });
    }
});
exports.getDropshipedOrderItemDetails = getDropshipedOrderItemDetails;
const getDropshipOrderTrackingInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { orderItemId } = req.query;
    if (!orderItemId) {
        res.status(400).json({ message: "Dropship order item ID is required." });
        return;
    }
    const orderItem = yield orderitem_1.default.findOne({
        where: { id: orderItemId },
    });
    if (!orderItem) {
        res.status(404).json({ message: "Order item not found." });
        return;
    }
    try {
        const trackingInfo = yield Promise.all(orderItem.dropshipOrderItemIds.map((dropshipOrderItemId) => dropShippingService.trackOrder(adminId, 
        //@ts-ignore
        dropshipOrderItemId)));
        if (!trackingInfo || trackingInfo.length === 0 || trackingInfo.every(info => !info)) {
            res.status(404).json({ message: "No tracking information found." });
            return;
        }
        res.status(200).json({
            message: "Dropshipped order item tracking info retrieved successfully.",
            data: trackingInfo,
        });
    }
    catch (error) {
        logger_1.default.error("Error tracking dropshipped order item:", error);
        res
            .status(500)
            .json({ message: "Failed to track dropshipped order item." });
    }
});
exports.getDropshipOrderTrackingInfo = getDropshipOrderTrackingInfo;
const getOrderItemsInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.query.orderId;
    try {
        // Fetch Order related to the vendor
        const order = yield order_1.default.findOne({
            where: { id: orderId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Include user details
                },
            ],
            order: [["createdAt", "DESC"]], // Sort by most recent
        });
        res.status(200).json({
            message: "Order details retrieved successfully",
            data: order,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message || "Failed to retrieve order details." });
    }
});
exports.getOrderItemsInfo = getOrderItemsInfo;
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { status, orderItemId } = req.body;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    if (!adminId) {
        res.status(400).json({ message: "Admin must be authenticated" });
        return;
    }
    // Define allowed statuses
    const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ];
    if (!allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid order status provided." });
        return;
    }
    // Start transaction
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        // Find the order item
        const order = yield orderitem_1.default.findOne({
            where: { id: orderItemId },
            transaction,
        });
        if (!order) {
            yield transaction.rollback();
            res.status(404).json({ message: "Order item not found." });
            return;
        }
        const mainOrder = yield order_1.default.findOne({ where: { id: order.orderId } });
        if (!mainOrder) {
            yield transaction.rollback();
            res.status(404).json({ message: "Buyer information not found." });
            return;
        }
        const buyer = yield user_1.default.findByPk(mainOrder.userId, { transaction });
        if (!buyer) {
            yield transaction.rollback();
            res.status(404).json({ message: "Buyer not found." });
            return;
        }
        // If the order is already delivered or cancelled, stop further processing
        if (order.status === "delivered" || order.status === "cancelled") {
            yield transaction.rollback();
            res.status(400).json({
                message: `Order is already ${order.status}. No further updates are allowed.`,
            });
            return;
        }
        let productData = order.product;
        // If product data is stored as a string, parse it
        if (typeof order.product === "string") {
            productData = JSON.parse(order.product);
        }
        // Extract vendorId safely
        const vendorId = (_b = productData === null || productData === void 0 ? void 0 : productData.vendorId) !== null && _b !== void 0 ? _b : null;
        const currencySymbol = (_e = (_d = (_c = productData === null || productData === void 0 ? void 0 : productData.store) === null || _c === void 0 ? void 0 : _c.currency) === null || _d === void 0 ? void 0 : _d.symbol) !== null && _e !== void 0 ? _e : null;
        if (!vendorId) {
            yield transaction.rollback();
            res.status(400).json({ message: "Vendor ID not found in product data." });
            return;
        }
        if (!currencySymbol) {
            yield transaction.rollback();
            res.status(400).json({ message: "Currency not found in product data." });
            return;
        }
        // Update the order status
        order.status = status;
        // If status is shipped, generate delivery code and email customer
        const deliveryCode = crypto_1.default.randomBytes(6).toString("hex").toUpperCase();
        if (status === "shipped") {
            mainOrder.deliveryCode = deliveryCode;
            yield mainOrder.save({ transaction });
            // Send email to customer
            const customer = yield user_1.default.findByPk(mainOrder.userId, { transaction });
            if (customer) {
                const html = `
            <h3>Hi ${customer.firstName},</h3>
            <p>Your order <strong>#${mainOrder.id}</strong> has been shipped.</p>
            <p>Please be available to collect it. Use the code below to confirm delivery:</p>
            <h2 style="color: blue;">${deliveryCode}</h2>
            <p>Thanks for shopping with us!</p>
          `;
                try {
                    yield (0, mail_service_1.sendMail)(customer.email, "Your order has been shipped!", html);
                }
                catch (emailError) {
                    logger_1.default.error("Error sending shipping email:", emailError);
                }
            }
        }
        yield order.save({ transaction });
        // Check if vendorId exists in the User or Admin table
        const vendor = yield user_1.default.findByPk(vendorId, { transaction });
        const admin = yield admin_1.default.findByPk(vendorId, { transaction });
        if (!vendor && !admin) {
            yield transaction.rollback();
            res.status(404).json({ message: "Product owner not found." });
            return;
        }
        // If the order is delivered, add funds to the vendor's wallet and deduct from pending
        if ((status === "delivered" && (currencySymbol === "#" || currencySymbol === "₦") && vendor)) {
            const totalIncome = Number(order.price) * Number(order.quantity);
            vendor.wallet = Number(vendor.wallet) + totalIncome;
            vendor.pendingWallet = Math.max(0, Number(vendor.pendingWallet) - totalIncome);
            yield vendor.save({ transaction });
            // Update transaction status
            yield transaction_1.default.update({ status: "completed" }, { where: { refId: order.id, transactionType: "sale" }, transaction });
        }
        // If the order is delivered and the currency is USD, add funds to the vendor's wallet
        if (status === "delivered" && currencySymbol === "$" && vendor) {
            const totalIncome = Number(order.price) * Number(order.quantity);
            vendor.dollarWallet = Number(vendor.dollarWallet) + totalIncome;
            vendor.pendingDollarWallet = Math.max(0, Number(vendor.pendingDollarWallet) - totalIncome);
            yield vendor.save({ transaction });
            // Update transaction status
            yield transaction_1.default.update({ status: "completed" }, { where: { refId: order.id, transactionType: "sale" }, transaction });
        }
        // If the order is cancelled, deduct from pending wallet
        if (status === "cancelled" && vendor) {
            const totalIncome = Number(order.price) * Number(order.quantity);
            if (currencySymbol === "#" || currencySymbol === "₦") {
                vendor.pendingWallet = Math.max(0, Number(vendor.pendingWallet) - totalIncome);
            }
            else if (currencySymbol === "$") {
                vendor.pendingDollarWallet = Math.max(0, Number(vendor.pendingDollarWallet) - totalIncome);
            }
            yield vendor.save({ transaction });
            // Update transaction status
            yield transaction_1.default.update({ status: "failed" }, { where: { refId: order.id, transactionType: "sale" }, transaction });
        }
        // Send a notification to the buyer
        yield notification_1.default.create({
            userId: mainOrder.userId,
            title: "Order Status Updated",
            message: `Your product has been marked as '${status}'.`,
            type: "order_status_update",
        }, { transaction });
        // Send a notification to the vendor/admin (who owns the product)
        yield notification_1.default.create({
            userId: adminId,
            title: "Order Status Updated",
            message: `The status of the product '${productData === null || productData === void 0 ? void 0 : productData.name}' purchased from you has been updated to '${status}'.`,
            type: "order_status_update",
        }, { transaction });
        // Commit transaction
        yield transaction.commit();
        // Send mail (outside of transaction)
        const message = messages_1.emailTemplates.orderStatusUpdateNotification(buyer, status, productData === null || productData === void 0 ? void 0 : productData.name, deliveryCode);
        try {
            yield (0, mail_service_1.sendMail)(buyer.email, `${process.env.APP_NAME} - Order Status Update`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError);
        }
        res.status(200).json({
            message: `Order status updated to '${status}' successfully.`,
            data: order,
        });
    }
    catch (error) {
        yield transaction.rollback();
        logger_1.default.error("Error updating order status:", error);
        res
            .status(500)
            .json({ message: "An error occurred while updating the order status." });
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Create a testimonial
const createTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, position, photo, message } = req.body;
    try {
        if (!name || !message) {
            res.status(400).json({ message: "Name and message are required" });
            return;
        }
        const newTestimonial = yield testimonial_1.default.create({
            name,
            position,
            photo,
            message,
        });
        res.status(200).json({
            message: "Testimonial created successfully",
            data: newTestimonial,
        });
    }
    catch (error) {
        logger_1.default.error(`Error creating testimonial: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the testimonial. Please try again later.",
        });
    }
});
exports.createTestimonial = createTestimonial;
// Update a testimonial
const updateTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, position, photo, message } = req.body;
    try {
        const testimonial = yield testimonial_1.default.findByPk(id);
        if (!testimonial) {
            res.status(404).json({ message: "Testimonial not found" });
            return;
        }
        yield testimonial.update({ name, position, photo, message });
        res
            .status(200)
            .json({ message: "Testimonial updated successfully", data: testimonial });
    }
    catch (error) {
        logger_1.default.error(`Error updating testimonial ID ${id}: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while updating the testimonial. Please try again later.",
        });
    }
});
exports.updateTestimonial = updateTestimonial;
// Get all testimonials
const getAllTestimonials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonials = yield testimonial_1.default.findAll();
        res.status(200).json({ data: testimonials });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving testimonials: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving testimonials. Please try again later.",
        });
    }
});
exports.getAllTestimonials = getAllTestimonials;
// Get a single testimonial
const getTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const testimonial = yield testimonial_1.default.findByPk(id);
        if (!testimonial) {
            res.status(404).json({ message: "Testimonial not found" });
            return;
        }
        res.status(200).json({ data: testimonial });
    }
    catch (error) {
        logger_1.default.error(`Error fetching testimonial ID ${id}: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while fetching the testimonial. Please try again later.",
        });
    }
});
exports.getTestimonial = getTestimonial;
// Delete a testimonial
const deleteTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const testimonial = yield testimonial_1.default.findByPk(id);
        if (!testimonial) {
            res.status(404).json({ message: "Testimonial not found" });
            return;
        }
        yield testimonial.destroy();
        res.status(200).json({ message: "Testimonial deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error deleting testimonial ID ${id}: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the testimonial. Please try again later.",
        });
    }
});
exports.deleteTestimonial = deleteTestimonial;
// Create FAQ Category
const createFaqCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    try {
        if (!name) {
            res.status(400).json({ message: "Category name is required" });
            return;
        }
        const newCategory = yield faqcategory_1.default.create({ name });
        res.status(200).json({
            message: "FAQ category created successfully",
            data: newCategory,
        });
    }
    catch (error) {
        logger_1.default.error(`Error creating FAQ category: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the FAQ category.",
        });
    }
});
exports.createFaqCategory = createFaqCategory;
// Get all FAQ Categories with FAQ count
const getAllFaqCategories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield faqcategory_1.default.findAll({
            include: [
                {
                    model: faq_1.default,
                    as: "faqs",
                    attributes: [],
                },
            ],
            attributes: [
                "id",
                "name",
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("faqs.id")), "faqCount"],
            ],
            group: ["FaqCategory.id"],
        });
        res.status(200).json({ data: categories });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving FAQ categories: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while retrieving FAQ categories." });
    }
});
exports.getAllFaqCategories = getAllFaqCategories;
// Get a single FAQ Category with its FAQs
const getFaqCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const category = yield faqcategory_1.default.findByPk(id, {
            include: [
                {
                    model: faq_1.default,
                    as: "faqs",
                    attributes: ["id", "question", "answer"], // Select only required fields
                },
            ],
        });
        if (!category) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }
        res.status(200).json({ data: category });
    }
    catch (error) {
        logger_1.default.error(`Error fetching FAQ category ID ${id}: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while fetching the FAQ category." });
    }
});
exports.getFaqCategory = getFaqCategory;
// Update FAQ Category
const updateFaqCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name } = req.body;
    try {
        const category = yield faqcategory_1.default.findByPk(id);
        if (!category) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }
        yield category.update({ name });
        res
            .status(200)
            .json({ message: "FAQ category updated successfully", data: category });
    }
    catch (error) {
        logger_1.default.error(`Error updating FAQ category ID ${id}: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while updating the FAQ category." });
    }
});
exports.updateFaqCategory = updateFaqCategory;
// Delete FAQ Category
const deleteFaqCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const category = yield faqcategory_1.default.findByPk(id);
        if (!category) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }
        // Deletion
        yield faq_1.default.destroy({ where: { faqCategoryId: id } });
        yield category.destroy();
        res.status(200).json({ message: "FAQ category deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error deleting FAQ category ID ${id}: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while deleting the FAQ category." });
    }
});
exports.deleteFaqCategory = deleteFaqCategory;
// Create an FAQ
const createFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, question, answer } = req.body;
    try {
        if (!categoryId || !question || !answer) {
            res
                .status(400)
                .json({ message: "Category ID, question, and answer are required" });
            return;
        }
        const categoryExists = yield faqcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }
        const newFaq = yield faq_1.default.create({
            faqCategoryId: categoryId,
            question,
            answer,
        });
        res.status(200).json({ message: "FAQ created successfully", data: newFaq });
    }
    catch (error) {
        logger_1.default.error(`Error creating FAQ: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the FAQ.",
        });
    }
});
exports.createFaq = createFaq;
// Get all FAQs
const getAllFaqs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqs = yield faq_1.default.findAll({
            include: [{ model: faqcategory_1.default, as: "faqCategory" }],
        });
        res.status(200).json({ data: faqs });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving FAQs: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while retrieving FAQs." });
    }
});
exports.getAllFaqs = getAllFaqs;
// Get a single FAQ
const getFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const faq = yield faq_1.default.findByPk(id, {
            include: [{ model: faqcategory_1.default, as: "faqCategory" }],
        });
        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }
        res.status(200).json({ data: faq });
    }
    catch (error) {
        logger_1.default.error(`Error fetching FAQ ID ${id}: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while fetching the FAQ." });
    }
});
exports.getFaq = getFaq;
// Update an FAQ
const updateFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, categoryId, question, answer } = req.body;
    try {
        const faq = yield faq_1.default.findByPk(id);
        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }
        yield faq.update({
            faqCategoryId: categoryId,
            question,
            answer,
        });
        res.status(200).json({ message: "FAQ updated successfully", data: faq });
    }
    catch (error) {
        logger_1.default.error(`Error updating FAQ ID ${id}: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while updating the FAQ." });
    }
});
exports.updateFaq = updateFaq;
// Delete an FAQ
const deleteFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const faq = yield faq_1.default.findByPk(id);
        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }
        yield faq.destroy();
        res.status(200).json({ message: "FAQ deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error deleting FAQ ID ${id}: ${error.message}`);
        res
            .status(500)
            .json({ message: "An error occurred while deleting the FAQ." });
    }
});
exports.deleteFaq = deleteFaq;
// Contact Us Form
const getAllContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = req.query; // Capture the search parameter from the query string
    try {
        // Construct the search query object
        const searchConditions = {};
        if (search) {
            const searchTerm = `%${search}%`; // Add wildcards for partial matching
            // Add conditions for each searchable field (name, phoneNumber, email, message)
            searchConditions[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: searchTerm } },
                { phoneNumber: { [sequelize_1.Op.like]: searchTerm } },
                { email: { [sequelize_1.Op.like]: searchTerm } },
                { message: { [sequelize_1.Op.like]: searchTerm } },
            ];
        }
        // Fetch all contact entries from the database, applying the search conditions if provided
        const contacts = yield contact_1.default.findAll({
            where: searchConditions,
        });
        // If no contacts are found
        if (contacts.length === 0) {
            res.status(404).json({ message: "No contact entries found." });
            return;
        }
        // Return the contact entries
        res.status(200).json({ data: contacts });
    }
    catch (error) {
        logger_1.default.error("Error fetching contacts:", error);
        res.status(500).json({
            message: "An error occurred while fetching contact entries.",
        });
    }
});
exports.getAllContacts = getAllContacts;
const getContactById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id; // Assuming contact ID is passed as a URL parameter
    try {
        // Fetch the contact entry by ID
        const contact = yield contact_1.default.findByPk(id);
        // If the contact is not found
        if (!contact) {
            res.status(404).json({ message: "Contact entry not found." });
            return;
        }
        // Return the contact entry
        res.status(200).json({ data: contact });
    }
    catch (error) {
        logger_1.default.error("Error fetching contact:", error);
        res.status(500).json({
            message: "An error occurred while fetching the contact entry.",
        });
    }
});
exports.getContactById = getContactById;
const deleteContactById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id; // Assuming contact ID is passed as a URL parameter
    try {
        // Find and delete the contact entry by ID
        const contact = yield contact_1.default.findByPk(id);
        // If the contact is not found
        if (!contact) {
            res.status(404).json({ message: "Contact entry not found." });
            return;
        }
        yield contact.destroy();
        // Return success message
        res.status(200).json({ message: "Contact entry deleted successfully." });
    }
    catch (error) {
        logger_1.default.error("Error deleting contact:", error);
        res.status(500).json({
            message: "An error occurred while deleting the contact entry.",
        });
    }
});
exports.deleteContactById = deleteContactById;
// JOB
const postJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, workplaceType, jobType, location, description } = req.body;
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
        // Create the job
        const newJob = yield job_1.default.create({
            creatorId: adminId,
            title,
            slug: `${title.toLowerCase().replace(/ /g, "-")}-${(0, uuid_1.v4)()}`,
            workplaceType,
            location,
            jobType,
            description,
            status: "active",
        });
        res.status(200).json({
            message: "Job posted successfully.",
            data: newJob, // Optional: format with a resource transformer if needed
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "An error occurred while posting the job.",
        });
    }
});
exports.postJob = postJob;
const getJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, title } = req.query; // Expecting 'Draft', 'Active', or 'Closed' for status, and a string for title
        const jobs = yield job_1.default.findAll({
            where: Object.assign(Object.assign({}, (status && { status: { [sequelize_1.Op.eq]: status } })), (title && { title: { [sequelize_1.Op.like]: `%${title}%` } })),
            attributes: {
                include: [
                    [
                        sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("applicants.id")),
                        "applicantCount",
                    ],
                ],
            },
            include: [
                {
                    model: applicant_1.default,
                    as: "applicants",
                    attributes: [], // We don't need applicant details, just the count
                },
            ],
            group: ["Job.id"], // Group by job ID to avoid duplicate rows
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            message: "Jobs retrieved successfully.",
            data: jobs,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "An error occurred while retrieving jobs.",
        });
    }
});
exports.getJobs = getJobs;
const updateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobId, title, workplaceType, jobType, location, description } = req.body;
        if (!jobId) {
            res.status(400).json({ message: "Job ID is required." });
            return;
        }
        // Find the job
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({ message: "Job not found." });
            return;
        }
        // Update job with new values or keep the old ones
        yield job.update({
            title: title !== null && title !== void 0 ? title : job.title,
            workplaceType: workplaceType !== null && workplaceType !== void 0 ? workplaceType : job.workplaceType,
            jobType: jobType !== null && jobType !== void 0 ? jobType : job.jobType,
            location: location !== null && location !== void 0 ? location : job.location,
            description: description !== null && description !== void 0 ? description : job.description,
        });
        res.status(200).json({
            message: "Job updated successfully.",
            data: job,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "An error occurred while updating the job.",
        });
    }
});
exports.updateJob = updateJob;
const getJobById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.query.jobId;
        if (!jobId) {
            res.status(400).json({ message: "Job ID is required." });
            return;
        }
        // Find the job by ID
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({ message: "Job not found." });
            return;
        }
        res.status(200).json({
            message: "Job retrieved successfully.",
            data: job,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "An error occurred while retrieving the job.",
        });
    }
});
exports.getJobById = getJobById;
// CLOSE Job
const closeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.query.jobId;
        // Find the job
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({
                message: "Job not found in our database.",
            });
            return;
        }
        // Update the job status to 'Closed'
        job.status = "closed";
        job.updatedAt = new Date();
        yield job.save();
        res.status(200).json({
            message: "Job closed successfully.",
            data: job, // Replace with a JobResource equivalent if necessary
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({
            message: "An error occurred while closing the job.",
        });
    }
});
exports.closeJob = closeJob;
// DELETE Job
const deleteJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.query.jobId;
        // Find the job
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({
                message: "Job not found in our database.",
            });
            return;
        }
        if (job.status !== "draft") {
            res.status(400).json({
                message: "Only draft jobs can be deleted.",
            });
            return;
        }
        // Start transaction to ensure both deletions happen together
        const transaction = yield sequelize_service_1.default.connection.transaction();
        try {
            // Delete all applicants related to this job
            yield applicant_1.default.destroy({ where: { jobId }, transaction });
            // Delete the job
            yield job.destroy({ transaction });
            yield transaction.commit(); // Commit changes
            res.status(200).json({
                message: "Job and related applicants deleted successfully.",
            });
        }
        catch (error) {
            yield transaction.rollback(); // Revert changes if an error occurs
            throw error;
        }
    }
    catch (error) {
        logger_1.default.error("Error deleting job:", error);
        res.status(500).json({
            message: "An error occurred while deleting the job.",
        });
    }
});
exports.deleteJob = deleteJob;
const getJobApplicants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.query.jobId;
        const job = yield job_1.default.findOne({ where: { id: jobId } });
        if (!job) {
            res.status(403).json({
                message: "Job not found.",
            });
            return;
        }
        const applicants = yield applicant_1.default.findAll({
            where: { jobId },
        });
        res.status(200).json({
            message: "All applicants retrieved successfully.",
            data: applicants,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.getJobApplicants = getJobApplicants;
const viewApplicant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicantId = req.query.applicantId;
        const applicant = yield applicant_1.default.findByPk(applicantId, {
            include: [
                {
                    model: job_1.default,
                    as: "job",
                },
            ],
        });
        if (!applicant) {
            res.status(404).json({
                message: "Not found in our database.",
            });
            return;
        }
        const job = yield job_1.default.findByPk(applicant.jobId);
        if (!job) {
            res.status(404).json({
                message: "Job not found.",
            });
            return;
        }
        res.status(200).json({
            message: "Applicant retrieved successfully.",
            data: applicant,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.viewApplicant = viewApplicant;
const repostJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { jobId } = req.body;
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({
                message: "Job not found in our database.",
            });
            return;
        }
        if (!job.title) {
            throw new Error("Job title cannot be null.");
        }
        const repost = yield job_1.default.create({
            creatorId: adminId,
            title: job.title,
            slug: `${job.title.toLowerCase().replace(/\s+/g, "-")}-${Math.floor(Math.random() * 10000)}`,
            company: job.company,
            logo: job.logo,
            workplaceType: job.workplaceType,
            location: job.location,
            jobType: job.jobType,
            description: job.description,
            status: "active",
        });
        res.status(200).json({
            message: "Job reposted successfully.",
            data: repost,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.repostJob = repostJob;
const downloadApplicantResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicantId = req.query.applicantId;
        const applicant = yield applicant_1.default.findByPk(applicantId);
        if (!applicant || !applicant.resume) {
            res.status(404).json({
                message: "File damaged or not found.",
            });
            return;
        }
        const filename = applicant.resume;
        if (!filename) {
            res.status(400).json({ message: "Filename is required" });
            return;
        }
        const storedFilename = applicant.resume; // The file stored in DB
        const applicantName = applicant.name.replace(/\s+/g, "_"); // Convert name to safe format (replace spaces)
        if (!storedFilename) {
            res.status(400).json({ message: "Filename is required" });
            return;
        }
        const cleanFilename = path_1.default.basename(filename);
        const filePath = path_1.default.join(uploadDir, cleanFilename);
        // Check if the file exists
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        // Rename file when sending for download
        const newFilename = `${applicantName}_Resume.pdf`;
        res.download(filePath, newFilename, (err) => {
            if (err) {
                logger_1.default.error("Error downloading file:", err);
                res.status(500).json({ message: "Error downloading file" });
            }
        });
    }
    catch (error) {
        logger_1.default.error("Error in downloadFile:", error);
        res
            .status(500)
            .json({ message: "An error occurred while downloading the file" });
    }
});
exports.downloadApplicantResume = downloadApplicantResume;
// Update withdrawal status (Admin action)
const updateWithdrawalStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const { id, status, paymentReceipt, note } = req.body; // Ensure 'note' is provided for rejection
        // Find withdrawal request
        const withdrawal = yield withdrawal_1.default.findByPk(id, { transaction });
        if (!withdrawal) {
            yield transaction.rollback();
            res.status(404).json({ message: "Withdrawal not found" });
            return;
        }
        // Find the vendor
        const vendor = yield user_1.default.findByPk(withdrawal.vendorId, { transaction });
        if (!vendor) {
            yield transaction.rollback();
            res.status(404).json({ message: "Vendor not found" });
            return;
        }
        // If already approved, return a message with no further action
        if (withdrawal.status === "approved") {
            yield transaction.commit();
            res.status(200).json({
                message: "Withdrawal has already been approved. No further action is required.",
            });
            return;
        }
        // If status is "rejected", ensure a note is provided
        if (status === "rejected" && !note) {
            yield transaction.rollback();
            res.status(400).json({ message: "Rejection note is required" });
            return;
        }
        // If rejected, refund money to the appropriate wallet
        if (status === "rejected") {
            const refundAmount = Number(withdrawal.amount); // Ensure it's a number
            if (withdrawal.currency === "USD") {
                vendor.dollarWallet = Number((_a = vendor.dollarWallet) !== null && _a !== void 0 ? _a : 0) + refundAmount;
            }
            else {
                vendor.wallet = Number((_b = vendor.wallet) !== null && _b !== void 0 ? _b : 0) + refundAmount;
            }
            yield vendor.save({ transaction });
        }
        // Update withdrawal status
        withdrawal.status = status;
        withdrawal.paymentReceipt = paymentReceipt || withdrawal.paymentReceipt; // Update if provided
        withdrawal.note = note || withdrawal.note; // Store rejection note
        yield withdrawal.save({ transaction });
        // Update the corresponding Transaction record
        const existingTransaction = yield transaction_1.default.findOne({
            where: { refId: withdrawal.id, transactionType: "withdrawal" },
            transaction,
        });
        if (existingTransaction) {
            existingTransaction.status = status === "approved" ? "completed" : "failed";
            if (status === "rejected") {
                existingTransaction.metadata = Object.assign(Object.assign({}, (existingTransaction.metadata || {})), { reason: note });
            }
            yield existingTransaction.save({ transaction });
        }
        // Notify Vendor
        yield notification_1.default.create({
            userId: vendor.id,
            title: `Withdrawal ${status === "approved" ? "Approved" : "Rejected"}`,
            type: "withdrawal_status",
            message: status === "approved"
                ? `Your withdrawal request of ${withdrawal.currency} ${withdrawal.amount} has been approved.`
                : `Your withdrawal request of ${withdrawal.currency} ${withdrawal.amount} was rejected. Reason: ${note}.`,
        }, { transaction });
        yield transaction.commit(); // Commit transaction
        res.status(200).json({ message: `Withdrawal ${status}`, withdrawal });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback on error
        logger_1.default.error("Error updating withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateWithdrawalStatus = updateWithdrawalStatus;
const getWithdrawals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query; // Optional filter by status
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const withdrawals = yield withdrawal_1.default.findAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
            order: [["createdAt", "DESC"]], // Latest withdrawals first
        });
        res
            .status(200)
            .json({ message: "Withdrawals fetched successfully", data: withdrawals });
    }
    catch (error) {
        logger_1.default.error("Error fetching withdrawals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWithdrawals = getWithdrawals;
const getWithdrawalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.query.id;
        // Find withdrawal with associated Vendor details
        const withdrawal = yield withdrawal_1.default.findOne({
            where: { id }, // Correct placement of the ID filter
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
        });
        if (!withdrawal) {
            res.status(404).json({ message: "Withdrawal not found" });
            return;
        }
        res
            .status(200)
            .json({ message: "Withdrawal retrieved successfully", data: withdrawal });
    }
    catch (error) {
        logger_1.default.error("Error retrieving withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWithdrawalById = getWithdrawalById;
// Create a Banner
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { image } = req.body;
    try {
        if (!image) {
            res.status(400).json({ message: "Image is required" });
            return;
        }
        const newBanner = yield banner_1.default.create({ image });
        res.status(200).json({
            message: "Banner created successfully",
            data: newBanner,
        });
    }
    catch (error) {
        logger_1.default.error(`Error creating banner: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the banner. Please try again later.",
        });
    }
});
exports.createBanner = createBanner;
// Update a banner
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, image } = req.body;
    try {
        const banner = yield banner_1.default.findByPk(id);
        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }
        yield banner.update({ image });
        res
            .status(200)
            .json({ message: "Banner updated successfully", data: banner });
    }
    catch (error) {
        logger_1.default.error(`Error updating banner ID ${id}: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while updating the banner. Please try again later.",
        });
    }
});
exports.updateBanner = updateBanner;
// Get all banners
const getAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield banner_1.default.findAll();
        res.status(200).json({ data: banners });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving banners: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving banners. Please try again later.",
        });
    }
});
exports.getAllBanners = getAllBanners;
// Get a single banner
const getBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const banner = yield banner_1.default.findByPk(id);
        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }
        res.status(200).json({ data: banner });
    }
    catch (error) {
        logger_1.default.error(`Error fetching banner ID ${id}: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while fetching the banner. Please try again later.",
        });
    }
});
exports.getBanner = getBanner;
// Delete a banner
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const banner = yield banner_1.default.findByPk(id);
        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }
        yield banner.destroy();
        res.status(200).json({ message: "Banner deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error deleting banner ID ${id}: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the banner. Please try again later.",
        });
    }
});
exports.deleteBanner = deleteBanner;
// Get all admin notifications
const getAdminNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page } = req.query;
        const offset = (Number(page || 1) - 1) * Number(limit || 10);
        const notifications = yield adminnotification_1.default.findAll({
            limit: Number(limit) || 10, // Default to 10 if not provided
            offset: offset || 0, // Default to 0 if page or limit is invalid
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ data: notifications, pagination: { limit, page } });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});
exports.getAdminNotifications = getAdminNotifications;
// Mark a notification as read
const markAdminNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const notification = yield adminnotification_1.default.findByPk(id);
        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        notification.read = true;
        yield notification.save();
        res.status(200).json({ message: "Notification marked as read" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update notification" });
    }
});
exports.markAdminNotificationAsRead = markAdminNotificationAsRead;
const createProductCharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, charge_amount, charge_percentage, charge_currency, calculation_type, minimum_product_amount, maximum_product_amount, } = req.body;
    try {
        if (!name || !description || !charge_currency || !calculation_type) {
            res.status(400).json({
                message: "Name, description, currency, and calculation type are required.",
            });
            return;
        }
        if (calculation_type !== "fixed" && calculation_type !== "percentage") {
            res.status(400).json({
                message: "Calculation type must be either 'fixed' or 'percentage'.",
            });
            return;
        }
        if (calculation_type === "fixed" && !charge_amount) {
            res.status(400).json({
                message: "Charge amount is required for fixed calculation type.",
            });
            return;
        }
        if (calculation_type === "percentage" && !charge_percentage) {
            res.status(400).json({
                message: "Charge percentage is required for percentage calculation type.",
            });
            return;
        }
        const chargeOverlap = yield productcharge_1.default.findOne({
            where: {
                charge_currency,
                minimum_product_amount: { [sequelize_1.Op.lte]: maximum_product_amount },
                maximum_product_amount: { [sequelize_1.Op.gte]: minimum_product_amount },
            },
        });
        if (chargeOverlap) {
            res.status(400).json({
                message: "The minimum and maximum product amounts overlap with an existing charge.",
            });
            return;
        }
        const newCharge = yield productcharge_1.default.create({
            name,
            description,
            charge_amount: calculation_type === "fixed" ? charge_amount : null,
            charge_currency,
            charge_percentage: calculation_type === "percentage" ? charge_percentage : null,
            calculation_type,
            minimum_product_amount: minimum_product_amount || 0,
            maximum_product_amount: maximum_product_amount || 0,
        });
        res.status(200).json({
            message: "Product charge created successfully",
            data: newCharge,
        });
    }
    catch (error) {
        logger_1.default.error(`Error creating product charge: ${error.message}`);
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "A product charge with this name already exists.",
            });
            return;
        }
        res.status(500).json({
            message: "An unexpected error occurred while creating the product charge.",
        });
    }
});
exports.createProductCharge = createProductCharge;
const updateProductCharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productChargeId = req.params.id;
    const { name, description, charge_amount, charge_percentage, charge_currency, calculation_type, minimum_product_amount, maximum_product_amount, } = req.body;
    if (calculation_type !== "fixed" && calculation_type !== "percentage") {
        res.status(400).json({
            message: "Calculation type must be either 'fixed' or 'percentage'.",
        });
        return;
    }
    if (calculation_type === "fixed" && !charge_amount) {
        res.status(400).json({
            message: "Charge amount is required for fixed calculation type.",
        });
        return;
    }
    if (calculation_type === "percentage" && !charge_percentage) {
        res.status(400).json({
            message: "Charge percentage is required for percentage calculation type.",
        });
        return;
    }
    try {
        const charge = yield productcharge_1.default.findByPk(productChargeId);
        if (!charge) {
            res.status(404).json({ message: "Product charge not found" });
            return;
        }
        const chargeOverlap = yield productcharge_1.default.findOne({
            where: {
                id: { [sequelize_1.Op.ne]: productChargeId },
                charge_currency,
                minimum_product_amount: { [sequelize_1.Op.lte]: maximum_product_amount },
                maximum_product_amount: { [sequelize_1.Op.gte]: minimum_product_amount },
            },
        });
        if (chargeOverlap) {
            res.status(400).json({
                message: "The minimum and maximum product amounts overlap with an existing charge.",
            });
            return;
        }
        yield charge.update({
            name,
            description,
            charge_amount: calculation_type === "fixed" ? charge_amount : null,
            charge_currency,
            charge_percentage: calculation_type === "percentage" ? charge_percentage : null,
            calculation_type,
            minimum_product_amount: minimum_product_amount || 0,
            maximum_product_amount: maximum_product_amount || 0,
        }, {
            where: { id: productChargeId },
        });
        res.status(200).json({
            message: "Product charge updated successfully",
            data: charge,
        });
    }
    catch (error) {
        logger_1.default.error(`Error updating product charge: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while updating the product charge. Please try again later.",
        });
    }
});
exports.updateProductCharge = updateProductCharge;
const getAllProductCharges = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const charges = yield productcharge_1.default.findAll({});
        res.status(200).json({ data: charges });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving product charges: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving product charges. Please try again later.",
        });
    }
});
exports.getAllProductCharges = getAllProductCharges;
const deleteProductCharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productChargeId = req.params.id;
    try {
        const charge = yield productcharge_1.default.findByPk(productChargeId);
        if (!charge) {
            res.status(404).json({ message: "Product charge not found" });
            return;
        }
        yield charge.destroy();
        res.status(200).json({
            message: "Product charge deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting product charge: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the product charge. Please try again later.",
        });
    }
});
exports.deleteProductCharge = deleteProductCharge;
const markProductChargeAsInactive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productChargeId = req.params.id;
    try {
        const charge = yield productcharge_1.default.findByPk(productChargeId);
        if (!charge) {
            res.status(404).json({ message: "Product charge not found" });
            return;
        }
        if (!charge.is_active) {
            res.status(400).json({ message: "Product charge is already inactive" });
            return;
        }
        yield charge.update({
            is_active: false,
        }, {
            where: { id: productChargeId },
        });
        res.status(200).json({
            message: "Product charge marked as inactive successfully",
            data: charge,
        });
    }
    catch (error) {
        console.error(error);
        logger_1.default.error(`Error marking product charge as inactive: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while marking the product charge as inactive. Please try again later.",
        });
    }
});
exports.markProductChargeAsInactive = markProductChargeAsInactive;
const markProductChargeAsActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productChargeId = req.params.id;
    try {
        const charge = yield productcharge_1.default.findByPk(productChargeId);
        if (!charge) {
            res.status(404).json({ message: "Product charge not found" });
            return;
        }
        if (charge.is_active) {
            res.status(400).json({
                message: "Product charge is already active",
            });
            return;
        }
        yield charge.update({ is_active: true }, {
            where: { id: productChargeId },
        });
        res.status(200).json({
            message: "Product charge marked as active successfully",
            data: charge,
        });
    }
    catch (error) {
        logger_1.default.error(`Error marking product charge as active: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while marking the product charge as active. Please try again later.",
        });
    }
});
exports.markProductChargeAsActive = markProductChargeAsActive;
const createServiceCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image } = req.body;
    try {
        if (!name) {
            res.status(400).json({ message: "Name is required" });
            return;
        }
        const newService = yield serviceCategories_1.default.create({ name, image });
        res.status(200).json({
            message: "Service category created successfully",
            data: newService,
        });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "A service category with this name already exists.",
            });
            return;
        }
        logger_1.default.error(`Error creating service: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the service.",
        });
    }
});
exports.createServiceCategory = createServiceCategory;
const updateServiceCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, image } = req.body;
    try {
        if (!id) {
            res.status(400).json({ message: "Service category ID is required" });
            return;
        }
        if (!name) {
            res.status(400).json({ message: "Name is required" });
            return;
        }
        const service = yield serviceCategories_1.default.findByPk(id);
        if (!service) {
            res.status(404).json({ message: "Service category not found" });
            return;
        }
        yield service.update({ name, image }, {
            where: { id },
        });
        res.status(200).json({
            message: "Service category updated successfully",
            data: service,
        });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "A service category with this name already exists.",
            });
            return;
        }
        logger_1.default.error(`Error updating service category: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while updating the service category. Please try again later.",
        });
    }
});
exports.updateServiceCategory = updateServiceCategory;
const getAllServiceCategories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = _req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const services = yield serviceCategories_1.default.findAll({
            limit: Number(limit) || 10,
            offset: offset || 0,
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ data: services });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving service categories: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving service categories. Please try again later.",
        });
    }
});
exports.getAllServiceCategories = getAllServiceCategories;
const deleteServiceCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id; // Get the service category ID from the request parameters
    try {
        if (!id) {
            res.status(400).json({ message: "Service category ID is required" });
            return;
        }
        const service = yield serviceCategories_1.default.findByPk(id);
        if (!service) {
            res.status(404).json({ message: "Service category not found" });
            return;
        }
        yield service.destroy();
        res.status(200).json({
            message: "Service category deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting service category: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the service category. Please try again later.",
        });
    }
});
exports.deleteServiceCategory = deleteServiceCategory;
const createServiceSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image, categoryId: serviceCategoryId } = req.body;
    try {
        if (!name || !serviceCategoryId) {
            res.status(400).json({
                message: "Name and category ID are required.",
            });
            return;
        }
        const newSubCategory = yield serviceSubCategories_1.default.create({
            name,
            image,
            serviceCategoryId,
        });
        res.status(200).json({
            message: "Service sub-category created successfully",
            data: newSubCategory,
        });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "A service sub-category with this name already exists.",
            });
            return;
        }
        if (error.name === "SequelizeForeignKeyConstraintError") {
            res.status(400).json({
                message: "The service category ID provided does not exist.",
            });
            return;
        }
        logger_1.default.error(`Error creating service sub-category: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the service sub-category.",
        });
    }
});
exports.createServiceSubCategory = createServiceSubCategory;
const updateServiceSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, image, categoryId: serviceCategoryId } = req.body;
    try {
        if (!id) {
            res.status(400).json({ message: "Service sub-category ID is required" });
            return;
        }
        if (!name || !serviceCategoryId) {
            res.status(400).json({
                message: "Name and category ID are required.",
            });
            return;
        }
        const subCategory = yield serviceSubCategories_1.default.findByPk(id);
        if (!subCategory) {
            res.status(404).json({ message: "Service sub-category not found" });
            return;
        }
        yield subCategory.update({ name, image, serviceCategoryId }, {
            where: { id },
        });
        res.status(200).json({
            message: "Service sub-category updated successfully",
            data: subCategory,
        });
    }
    catch (error) {
        logger_1.default.error(`Error updating service sub-category: ${error.message}`);
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "A service sub-category with this name already exists.",
            });
            return;
        }
        if (error.name === "SequelizeForeignKeyConstraintError") {
            res.status(400).json({
                message: "The service category ID provided does not exist.",
            });
            return;
        }
        res.status(500).json({
            message: "An error occurred while updating the service sub-category. Please try again later.",
        });
    }
});
exports.updateServiceSubCategory = updateServiceSubCategory;
const getAllServiceSubCategories = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: serviceCategoryId } = _req.params;
    const { page, limit } = _req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const subCategories = yield serviceSubCategories_1.default.findAll({
            limit: Number(limit) || 10,
            offset: offset || 0,
            order: [["createdAt", "DESC"]],
            where: {
                serviceCategoryId,
            },
        });
        res.status(200).json({ data: subCategories });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving service sub-categories: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving service sub-categories. Please try again later.",
        });
    }
});
exports.getAllServiceSubCategories = getAllServiceSubCategories;
const deleteServiceSubCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        if (!id) {
            res.status(400).json({ message: "Service sub-category ID is required" });
            return;
        }
        const subCategory = yield serviceSubCategories_1.default.findByPk(id);
        if (!subCategory) {
            res.status(404).json({ message: "Service sub-category not found" });
            return;
        }
        yield subCategory.destroy();
        res.status(200).json({
            message: "Service sub-category deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting service sub-category: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the service sub-category. Please try again later.",
        });
    }
});
exports.deleteServiceSubCategory = deleteServiceSubCategory;
const createServiceAttribute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { attributes, } = req.body;
    try {
        if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
            res.status(400).json({
                message: "Attributes must be a non-empty array.",
            });
            return;
        }
        const optionValuesMap = new Map();
        const serviceAttributeDefinitions = [];
        for (const attr of attributes) {
            const { name, input_type, value } = attr;
            if (!name) {
                res.status(400).json({
                    message: "Each attribute must include name.",
                });
                return;
            }
            if ((input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.MULTI_SELECT || input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.SINGLE_SELECT) && (!value || !Array.isArray(value) || value.length === 0)) {
                res.status(400).json({
                    message: `Attribute ${name} of type ${input_type} must include non-empty value array.`,
                });
                return;
            }
            if (!input_type ||
                !helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT.includes(input_type)) {
                res.status(400).json({
                    message: `Input type must be one of the following: ${helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT.join(", ")}`,
                });
                return;
            }
            switch (input_type) {
                case helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.INT_INPUT:
                    serviceAttributeDefinitions.push({
                        name,
                        input_type,
                        data_type: helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.INT,
                    });
                    break;
                case helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.STR_INPUT:
                    serviceAttributeDefinitions.push({
                        name,
                        input_type,
                        data_type: helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.STR,
                    });
                    break;
                case helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.BOOL_INPUT:
                    serviceAttributeDefinitions.push({
                        name,
                        input_type,
                        data_type: helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.BOOL,
                    });
                    break;
                case helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.MULTI_SELECT:
                    if (!Array.isArray(value) || value.length === 0) {
                        res.status(400).json({
                            message: `Value for attribute ${name} must be a non-empty array.`,
                        });
                        return;
                    }
                    optionValuesMap.set(name, value);
                    serviceAttributeDefinitions.push({
                        name,
                        input_type,
                        data_type: helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.STR_ARRAY,
                    });
                    break;
                case helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.SINGLE_SELECT:
                    if (!Array.isArray(value) || value.length === 0) {
                        res.status(400).json({
                            message: `Value for attribute ${name} must be a non-empty array.`,
                        });
                        return;
                    }
                    optionValuesMap.set(name, value);
                    serviceAttributeDefinitions.push({
                        name,
                        input_type,
                        data_type: helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.STR_ARRAY,
                    });
                    break;
                default:
                    res.status(400).json({
                        message: `Unsupported input type: ${input_type} for attribute ${name}.`,
                    });
                    return;
            }
        }
        let newAttribute;
        try {
            yield sequelize_2.default.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
                newAttribute = yield attributeDefinitions_1.default.bulkCreate(serviceAttributeDefinitions, {
                    validate: true,
                    individualHooks: true,
                    transaction: t,
                });
                for (let i = 0; i < serviceAttributeDefinitions.length; i++) {
                    const definition = serviceAttributeDefinitions[i];
                    const createdDefinition = newAttribute[i];
                    if (definition.data_type ===
                        helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.STR_ARRAY) {
                        const options = optionValuesMap.get(definition.name) || [];
                        const optionRecords = options.map((opt) => ({
                            attribute_id: createdDefinition.id,
                            option_value: opt,
                        }));
                        if (optionRecords.length > 0) {
                            yield attributeOptions_1.default.bulkCreate(optionRecords, {
                                transaction: t,
                            });
                        }
                    }
                }
            }));
        }
        catch (error) {
            if (error.name === "SequelizeUniqueConstraintError") {
                res.status(400).json({
                    message: "A service attribute with this name already exists.",
                });
                return;
            }
            if (error.name === "SequelizeForeignKeyConstraintError") {
                res.status(400).json({
                    message: "The service category ID provided does not exist.",
                });
                return;
            }
            throw error;
        }
        res.status(200).json({
            message: "Service attribute created successfully",
            data: newAttribute,
        });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "A service attribute with this name already exists.",
            });
            return;
        }
        if (error.name === "SequelizeForeignKeyConstraintError") {
            res.status(400).json({
                message: "The service sub-category ID provided does not exist.",
            });
            return;
        }
        logger_1.default.error(`Error creating service attribute: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while creating the service attribute.",
        });
    }
});
exports.createServiceAttribute = createServiceAttribute;
const deleteServiceAttribute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        if (!id) {
            res.status(400).json({ message: "Service attribute ID is required" });
            return;
        }
        if (typeof Number(id) !== 'number') {
            res.status(400).json({ message: "Service attribute ID must be a number" });
            return;
        }
        const attribute = yield attributeDefinitions_1.default.findByPk(id);
        if (!attribute) {
            res.status(404).json({ message: "Service attribute not found" });
            return;
        }
        yield attribute.destroy();
        res.status(200).json({
            message: "Service attribute deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting service attribute: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the service attribute. Please try again later.",
        });
    }
});
exports.deleteServiceAttribute = deleteServiceAttribute;
const addAttributeOptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attributeId = req.params.attributeId;
    const { options } = req.body;
    try {
        if (!attributeId) {
            res.status(400).json({ message: "Attribute ID is required." });
            return;
        }
        if (!options || !Array.isArray(options) || options.length === 0) {
            res.status(400).json({
                message: "Options must be a non-empty array.",
            });
            return;
        }
        const attribute = yield attributeDefinitions_1.default.findByPk(attributeId);
        if (!attribute) {
            res.status(404).json({ message: "Attribute not found." });
            return;
        }
        if (attribute.data_type !== helpers_1.ALLOWED_SERVICE_ATTRIBUTE_DATA_OBJ.STR_ARRAY ||
            (attribute.input_type !== helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.SINGLE_SELECT &&
                attribute.input_type !== helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.MULTI_SELECT)) {
            res.status(400).json({
                message: "Options can only be added to attributes with 'single_select' or 'multi_select' input types.",
            });
            return;
        }
        const optionRecords = options.map((opt) => ({
            attribute_id: attribute.id,
            option_value: opt,
        }));
        const newOptions = yield attributeOptions_1.default.bulkCreate(optionRecords, {
            validate: true,
            individualHooks: true,
            ignoreDuplicates: true,
        });
        res.status(200).json({
            message: "Options added successfully",
            data: newOptions,
        });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "One or more options already exist for this attribute.",
            });
            return;
        }
        logger_1.default.error(`Error adding attribute options: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while adding attribute options.",
        });
    }
});
exports.addAttributeOptions = addAttributeOptions;
const getAllServiceAttributes = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = _req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const attributes = yield attributeDefinitions_1.default.findAll({
            limit: Number(limit) || 10,
            offset: offset || 0,
            order: [["id", "ASC"]],
            include: [
                {
                    model: attributeOptions_1.default,
                    as: "options",
                    attributes: ["id", "option_value"],
                },
            ],
        });
        res.status(200).json({ data: attributes });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving service attributes: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving service attributes. Please try again later.",
        });
    }
});
exports.getAllServiceAttributes = getAllServiceAttributes;
const deleteAttributeOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const optionId = req.params.optionId;
    try {
        if (!optionId) {
            res.status(400).json({ message: "Option ID is required." });
            return;
        }
        const option = yield attributeOptions_1.default.findByPk(optionId);
        if (!option) {
            res.status(404).json({ message: "Option not found." });
            return;
        }
        if (typeof Number(optionId) !== 'number') {
            res.status(400).json({ message: "Option ID must be a number" });
            return;
        }
        yield option.destroy();
        res.status(200).json({
            message: "Option deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error deleting attribute option: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while deleting the attribute option. Please try again later.",
        });
    }
});
exports.deleteAttributeOption = deleteAttributeOption;
const addAttributeToServiceCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.params.categoryId;
    const { attributeIds } = req.body;
    try {
        if (!categoryId) {
            res.status(400).json({ message: "Service category ID is required." });
            return;
        }
        if (!attributeIds ||
            !Array.isArray(attributeIds) ||
            attributeIds.length === 0) {
            res.status(400).json({
                message: "Attribute IDs must be a non-empty array.",
            });
            return;
        }
        const serviceCategory = yield serviceCategories_1.default.findByPk(categoryId);
        if (!serviceCategory) {
            res.status(404).json({ message: "Service category not found." });
            return;
        }
        const attributes = yield attributeDefinitions_1.default.findAll({
            where: {
                id: {
                    [sequelize_1.Op.in]: attributeIds,
                },
            }
        });
        if (attributes.length !== attributeIds.length) {
            res.status(400).json({
                message: "One or more attribute IDs are invalid and do not exist.",
            });
            return;
        }
        const attributeToServiceCategoryRecords = attributeIds.map((attrId) => ({
            service_category_id: categoryId,
            attribute_id: attrId,
        }));
        yield serviceCategoryToAttributeMap_1.default.bulkCreate(attributeToServiceCategoryRecords, {
            validate: true,
            individualHooks: true,
            ignoreDuplicates: true,
        });
        res.status(200).json({
            message: "Attributes added to service category successfully",
        });
    }
    catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            res.status(400).json({
                message: "One or more attribute IDs are invalid and do not exist.",
            });
            return;
        }
        if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).json({
                message: "One or more attributes are already associated with this service category.",
            });
            return;
        }
        logger_1.default.error(`Error adding attributes to service category: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while adding attributes to the service category.",
        });
    }
});
exports.addAttributeToServiceCategory = addAttributeToServiceCategory;
const removeAttributeFromServiceCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = req.params.categoryId;
    const { attributeIds } = req.body;
    if (!categoryId) {
        res.status(400).json({ message: "Service category ID is required." });
        return;
    }
    try {
        const serviceCategory = yield serviceCategories_1.default.findByPk(Number(categoryId));
        if (!serviceCategory) {
            res.status(404).json({ message: "Service category not found." });
            return;
        }
        const deleteCount = yield serviceCategoryToAttributeMap_1.default.destroy({
            where: {
                service_category_id: categoryId,
                attribute_id: {
                    [sequelize_1.Op.in]: attributeIds,
                },
            },
        });
        if (deleteCount === 0) {
            res.status(404).json({
                message: "No matching attribute mappings found for deletion.",
            });
            return;
        }
        res.status(200).json({
            message: "Attributes removed from service category successfully",
        });
    }
    catch (error) {
        logger_1.default.error(`Error removing attributes from service category: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while removing attributes from the service category.",
        });
    }
});
exports.removeAttributeFromServiceCategory = removeAttributeFromServiceCategory;
const suspendService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    try {
        if (!serviceId) {
            res.status(400).json({ message: "Service ID is required." });
            return;
        }
        const service = yield services_1.default.findByPk(serviceId);
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        if (service.status === 'suspended') {
            res.status(400).json({ message: "Service is already suspended." });
            return;
        }
        service.status = 'suspended';
        yield service.save();
        res.status(200).json({
            message: "Service suspended successfully",
            data: service,
        });
    }
    catch (error) {
        logger_1.default.error(`Error suspending service: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while suspending the service.",
        });
    }
});
exports.suspendService = suspendService;
const activateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    try {
        if (!serviceId) {
            res.status(400).json({ message: "Service ID is required." });
            return;
        }
        const service = yield services_1.default.findByPk(serviceId);
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        if (service.status === 'active') {
            res.status(400).json({ message: "Service is already active." });
            return;
        }
        service.status = 'active';
        yield service.save();
        res.status(200).json({
            message: "Service activated successfully",
            data: service,
        });
    }
    catch (error) {
        logger_1.default.error(`Error activating service: ${error.message}`);
        res.status(500).json({
            message: "An unexpected error occurred while activating the service.",
        });
    }
});
exports.activateService = activateService;
const getAllServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, status, categoryId, subCategoryId } = req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const whereClause = {};
        if (status && (status === 'active' || status === 'suspended')) {
            whereClause.status = status;
        }
        if (categoryId) {
            whereClause.serviceCategoryId = categoryId;
        }
        if (subCategoryId) {
            whereClause.serviceSubCategoryId = subCategoryId;
        }
        const services = yield services_1.default.findAll({
            where: whereClause,
            limit: Number(limit) || 10,
            offset: offset || 0,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: serviceCategories_1.default,
                    as: "category",
                    attributes: ["id", "name"],
                },
                {
                    model: serviceSubCategories_1.default,
                    as: "subCategory",
                    attributes: ["id", "name"],
                },
                {
                    model: user_1.default,
                    as: "provider",
                }
            ],
        });
        res.status(200).json({ data: services });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving services: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving services. Please try again later.",
        });
    }
});
exports.getAllServices = getAllServices;
const getServiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    try {
        if (!serviceId) {
            res.status(400).json({ message: "Service ID is required" });
            return;
        }
        // Fetch the service by ID (admin can view any status)
        const service = yield services_1.default.findOne({
            where: { id: serviceId },
            include: [
                {
                    model: user_1.default,
                    as: "provider",
                    include: [
                        {
                            model: kyc_1.default,
                            as: "kyc",
                            attributes: ["isVerified"],
                        },
                    ],
                },
                {
                    model: serviceCategories_1.default,
                    as: "category",
                    attributes: ["id", "name"],
                },
                {
                    model: serviceSubCategories_1.default,
                    as: "subCategory",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!service) {
            res.status(404).json({ message: "Service not found" });
            return;
        }
        // Add isVerified to provider if exists
        if (service.provider) {
            const kyc = yield kyc_1.default.findOne({
                where: { vendorId: service.provider.id },
            });
            service.provider.setDataValue("isVerified", kyc ? kyc.isVerified : false);
        }
        res.status(200).json({ data: service });
    }
    catch (error) {
        logger_1.default.error("Error fetching service:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching the service.",
        });
    }
});
exports.getServiceById = getServiceById;
const getAliExpressCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorId = req.adminId;
    try {
        const categories = yield dropShippingService.getProductCategories(vendorId);
        if (categories.length === 0) {
            res.status(404).json({ message: "No categories found" });
            return;
        }
        res.status(200).json({ data: categories });
    }
    catch (error) {
        // logger.error(
        // 	`Error retrieving dropshipping product categories: ${error.message}`,
        // );
        res.status(500).json({
            message: "An error occurred while retrieving dropshipping product categories.",
        });
    }
});
exports.getAliExpressCategories = getAliExpressCategories;
const getAliExpressProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendorId = req.adminId;
        const keywords = req.query.keywords;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const categoryId = req.query.categoryId;
        const currency = req.query.currency;
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize, 10) : 20;
        const shippingCountry = req.query.shippingCountry;
        if (!categoryId) {
            res.status(400).json({ message: "Category ID is required" });
            return;
        }
        if (currency && currency !== 'USD' && currency !== "NGN") {
            res.status(400).json({ message: "Currency must be either 'USD' or 'NGN'" });
            return;
        }
        if (keywords && keywords.trim().length === 0) {
            res.status(400).json({ message: "Keywords cannot be empty" });
            return;
        }
        if (!shippingCountry) {
            res.status(400).json({ message: "Shipping country is required" });
            return;
        }
        const products = yield dropShippingService.getProducts({
            keywords,
            pageNo: page,
            pageSize,
            categoryId,
            shipToCountry: shippingCountry,
            currency: currency,
            vendorId,
        });
        res.status(200).json({ data: products });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving dropshipping products: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving dropshipping products.",
        });
    }
});
exports.getAliExpressProducts = getAliExpressProducts;
function getAliExpressProductDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const vendorId = req.adminId;
            const productId = req.params.productId;
            const shipToCountry = req.query.shippingCountry;
            const currency = req.query.currency;
            if (!productId) {
                res.status(400).json({ message: "Product ID is required" });
                return;
            }
            if (!shipToCountry) {
                res.status(400).json({ message: "Shipping country is required" });
                return;
            }
            if (currency && currency !== 'USD' && currency !== "NGN") {
                res.status(400).json({ message: "Currency must be either 'USD' or 'NGN'" });
                return;
            }
            const productDetails = yield dropShippingService.getProductById(vendorId, Number(productId), shipToCountry, currency);
            if (!productDetails) {
                res.status(404).json({ message: "Product not found" });
                return;
            }
            res.status(200).json({ data: productDetails });
        }
        catch (error) {
            logger_1.default.error(`Error retrieving dropshipping product details: ${error.message}`);
            res.status(500).json({
                message: "An error occurred while retrieving dropshipping product details.",
            });
        }
    });
}
function addAliexpressProductToInventory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const transaction = yield sequelize_service_1.default.connection.transaction();
        try {
            const { productId, shippingCountry, currency, storeId, categoryId, priceIncrementPercent } = req.body;
            // @ts-ignore
            const vendorId = req.adminId;
            if (!productId) {
                res.status(400).json({ message: "Product ID is required" });
                yield transaction.rollback();
                return;
            }
            if (!shippingCountry) {
                res.status(400).json({ message: "Shipping country is required" });
                yield transaction.rollback();
                return;
            }
            if (shippingCountry.trim() === "") {
                res.status(400).json({ message: "Shipping country cannot be empty" });
                yield transaction.rollback();
                return;
            }
            if (shippingCountry !== "US" && shippingCountry !== "NG" && shippingCountry !== "UK") {
                res.status(400).json({ message: "Shipping country must be either 'US', 'NG' or 'UK'" });
                yield transaction.rollback();
                return;
            }
            if (currency && currency !== 'USD' && currency !== "NGN") {
                res.status(400).json({ message: "Currency must be either 'USD' or 'NGN'" });
                yield transaction.rollback();
                return;
            }
            if (!storeId) {
                res.status(400).json({ message: "Store ID is required" });
                yield transaction.rollback();
                return;
            }
            const store = yield store_1.default.findByPk(storeId, {
                include: [
                    {
                        model: currency_1.default,
                        as: "currency",
                    },
                ],
            });
            if (!store) {
                res.status(404).json({ message: "Store not found" });
                yield transaction.rollback();
                return;
            }
            if (!store.currency) {
                res.status(400).json({ message: "Store does not have a currency set" });
                yield transaction.rollback();
                return;
            }
            if (store.currency.name.toLowerCase() === "dollar" && currency !== 'USD' || store.currency.name.toLowerCase() === "naira" && currency !== 'NGN') {
                res.status(400).json({ message: `Currency mismatch: Store currency is ${store.currency.name}, but received ${currency}` });
                yield transaction.rollback();
                return;
            }
            const productDetails = yield dropShippingService.getProductById(vendorId, Number(productId), shippingCountry, currency);
            if (!productDetails) {
                res.status(404).json({ message: "Product not found" });
                yield transaction.rollback();
                return;
            }
            const lowestPricedVariant = productDetails.ae_item_sku_info_dtos.reduce((prev, curr) => {
                return (prev.offer_sale_price < curr.offer_sale_price) ? prev : curr;
            });
            const productImages = productDetails.ae_multimedia_info_dto.image_urls.split(';');
            //@ts-ignore
            const productVideoUrl = (_c = (_b = (_a = productDetails === null || productDetails === void 0 ? void 0 : productDetails.ae_multimedia_info_dto.ae_video_dtos) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.media_url) !== null && _c !== void 0 ? _c : "";
            const productPrice = new decimal_js_1.default(lowestPricedVariant.offer_sale_price).plus(new decimal_js_1.default(lowestPricedVariant.offer_sale_price)
                .mul(new decimal_js_1.default(priceIncrementPercent))
                .div(new decimal_js_1.default(100))).toFixed(2);
            const variantIncrementedPrices = productDetails.ae_item_sku_info_dtos.map(variant => {
                const incrementedPrice = new decimal_js_1.default(variant.offer_sale_price).plus(new decimal_js_1.default(variant.offer_sale_price)
                    .mul(new decimal_js_1.default(priceIncrementPercent))
                    .div(new decimal_js_1.default(100))).toFixed(2);
                return Object.assign(Object.assign({}, variant), { offer_sale_price: incrementedPrice });
            });
            const newProduct = yield product_1.default.create({
                storeId: store.id,
                vendorId,
                categoryId: categoryId || null,
                name: productDetails.ae_item_base_info_dto.subject,
                description: productDetails.ae_item_base_info_dto.detail,
                specification: productDetails.ae_item_base_info_dto.mobile_detail,
                sku: `KDM-${(0, uuid_1.v4)()}`,
                type: 'dropship',
                price: lowestPricedVariant.sku_price,
                discount_price: productPrice,
                condition: "brand_new",
                quantity: lowestPricedVariant.sku_available_stock,
                image_url: productImages[0],
                video_url: productVideoUrl || null,
                additional_images: productImages,
                variants: variantIncrementedPrices,
            }, { transaction });
            yield dropshipProducts_1.default.create({
                productId: newProduct.id,
                dropshipProductId: String(productDetails.ae_item_base_info_dto.product_id),
                vendorId,
                priceIncrementPercent,
            }, { transaction });
            yield transaction.commit();
            res.status(200).json({
                message: "Dropshipping product added to inventory successfully",
                data: newProduct,
            });
        }
        catch (error) {
            console.error(error);
            logger_1.default.error(error);
            logger_1.default.error(`Error adding dropshipping product to catalog: ${error.message}`);
            yield transaction.rollback();
            res.status(500).json({
                message: "An error occurred while adding dropshipping product to catalog.",
            });
        }
    });
}
// export async function getAliExpressDropshipCredsStatus(req: Request, res: Response): Promise<void> {
//   try {
//     const vendorId = (req as any).adminId;
//
//     const credsStatus = await DropShippingCred.findOne({
//       where: {
//         vendorId,
//       },
//     });
//
//     if (!credsStatus) {
//       res.status(200).json({ data: { message: "No credentials found", isSet: false } });
//       return;
//     }
//
//     res.status(200)
//       .json({  data: { message: "Credentials found", creds: credsStatus, isSet: true } });
//   }
//   catch (error: any) {
//     logger.error(
//       `Error retrieving dropshipping credentials status: ${error.message}`,
//     );
//     res.status(500).json({
//       message:
//         "An error occurred while retrieving dropshipping credentials status.",
//     });
//   }
// }
function getAliExpressDropshipCredsStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const vendorId = req.adminId;
            const credsStatus = yield dropshippngCreds_1.default.findOne({
                where: {
                    vendorId,
                },
            });
            if (!credsStatus) {
                res.status(200).json({
                    data: {
                        isConnected: false,
                        message: "No AliExpress account connected",
                        statusColor: "gray",
                    },
                });
                return;
            }
            // Check if tokens are expired
            const now = Date.now();
            const isAccessTokenExpired = credsStatus.expireTime < now;
            const isRefreshTokenExpired = credsStatus.refreshTokenValidTime < now;
            // Calculate time remaining
            const accessTokenMinutes = Math.max(0, Math.floor((credsStatus.expireTime - now) / 1000 / 60));
            const refreshTokenHours = Math.max(0, Math.floor((credsStatus.refreshTokenValidTime - now) / 1000 / 60 / 60));
            // Format expiry times in human-readable format
            const formatExpiryTime = (minutes) => {
                if (minutes === 0)
                    return "Expired";
                if (minutes < 60)
                    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                if (mins === 0)
                    return `${hours} hour${hours !== 1 ? "s" : ""}`;
                return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
            };
            const formatRefreshExpiryTime = (hours) => {
                if (hours === 0)
                    return "Expired";
                if (hours < 24)
                    return `${hours} hour${hours !== 1 ? "s" : ""}`;
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                if (remainingHours === 0)
                    return `${days} day${days !== 1 ? "s" : ""}`;
                return `${days} day${days !== 1 ? "s" : ""} ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
            };
            // Format dates
            const formatDate = (date) => {
                return new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            };
            // Determine connection status
            let status;
            let statusMessage;
            let statusBadge;
            let statusColor;
            let showReconnectButton;
            if (isRefreshTokenExpired) {
                status = "expired";
                statusBadge = "✗ Expired";
                statusMessage =
                    "Your AliExpress connection has expired. Please reconnect your account to continue dropshipping.";
                statusColor = "red";
                showReconnectButton = true;
            }
            else if (accessTokenMinutes < 60) {
                // Less than 1 hour
                status = "expiring_soon";
                statusBadge = "⚠ Expiring Soon";
                statusMessage =
                    "Your AliExpress connection will expire soon. It will automatically refresh. ";
                statusColor = "orange";
                showReconnectButton = false;
            }
            else {
                status = "active";
                statusBadge = "✓ Active";
                statusMessage =
                    "Your AliExpress account is connected and working properly.";
                statusColor = "green";
                showReconnectButton = false;
            }
            res.status(200).json({
                data: {
                    isConnected: true,
                    status,
                    statusBadge,
                    statusColor,
                    message: statusMessage,
                    showReconnectButton,
                    account: {
                        email: credsStatus.account,
                        nickname: credsStatus.userNick,
                        sellerId: credsStatus.sellerId,
                        platform: credsStatus.accountPlatform === "seller_center"
                            ? "Seller Center"
                            : credsStatus.accountPlatform,
                    },
                    expiryInfo: {
                        accessToken: {
                            label: "Access Token",
                            expiresIn: formatExpiryTime(accessTokenMinutes),
                            isExpired: isAccessTokenExpired,
                        },
                        refreshToken: {
                            label: "Refresh Token",
                            expiresIn: formatRefreshExpiryTime(refreshTokenHours),
                            isExpired: isRefreshTokenExpired,
                        },
                    },
                    timestamps: {
                        connectedAt: formatDate(credsStatus.createdAt),
                        lastUpdated: formatDate(credsStatus.updatedAt),
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error retrieving dropshipping credentials status: ${error.message}`);
            res.status(500).json({
                message: "An error occurred while retrieving dropshipping credentials status.",
            });
        }
    });
}
;
const getVendorPayoutReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, currency, vendorId } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (currency)
            where.currency = currency;
        if (vendorId)
            where.vendorId = vendorId;
        const withdrawals = yield withdrawal_1.default.findAll({
            where,
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ data: withdrawals });
    }
    catch (error) {
        logger_1.default.error("Error fetching payout reports:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVendorPayoutReports = getVendorPayoutReports;
const getVendorEarningsReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vendorId, startDate, endDate } = req.query;
        const where = { transactionType: "sale", status: "completed" };
        if (vendorId)
            where.userId = vendorId;
        if (startDate && endDate) {
            where.createdAt = {
                [sequelize_1.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }
        const sales = yield transaction_1.default.findAll({
            where,
            attributes: [
                "currency",
                [sequelize_1.Sequelize.fn("SUM", sequelize_1.Sequelize.col("amount")), "totalEarnings"],
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("id")), "totalOrders"],
            ],
            group: ["currency"],
            include: vendorId
                ? [
                    {
                        model: user_1.default,
                        as: "user",
                        attributes: ["id", "firstName", "lastName", "email"],
                    },
                ]
                : [],
        });
        res.status(200).json({ data: sales });
    }
    catch (error) {
        logger_1.default.error("Error fetching earnings report:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVendorEarningsReport = getVendorEarningsReport;
const getOverallPayoutStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield withdrawal_1.default.findAll({
            attributes: [
                "currency",
                "status",
                [sequelize_1.Sequelize.fn("SUM", sequelize_1.Sequelize.col("amount")), "totalAmount"],
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("id")), "count"],
            ],
            group: ["currency", "status"],
        });
        res.status(200).json({ data: stats });
    }
    catch (error) {
        logger_1.default.error("Error fetching payout stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getOverallPayoutStats = getOverallPayoutStats;
const getAllOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, status, productId, ownerType } = req.query;
    const offset = (Number(page) - 1) * Number(limit) || 0;
    const where = {};
    if (status)
        where.status = String(status);
    if (productId)
        where.productId = String(productId);
    // ownerType=admin → only offers on admin-owned products
    // ownerType=vendor → only offers on vendor-owned products
    // no ownerType → all offers (oversight)
    const productInclude = {
        model: product_1.default,
        as: "product",
        attributes: ["id", "name", "price", "image_url", "vendorId"],
        required: true,
    };
    if (ownerType === "admin") {
        productInclude.include = [{
                model: admin_1.default,
                as: "admin",
                attributes: ["id"],
                required: true,
            }];
    }
    else if (ownerType === "vendor") {
        productInclude.include = [{
                model: admin_1.default,
                as: "admin",
                attributes: ["id"],
                required: false,
            }];
        productInclude.where = { "$product.admin.id$": null };
    }
    try {
        const { count, rows: offers } = yield productoffer_1.default.findAndCountAll({
            where,
            subQuery: false,
            include: [
                productInclude,
                {
                    model: user_1.default,
                    as: "buyer",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: Number(limit) || 10,
            offset,
        });
        res.status(200).json({ data: offers, total: count });
    }
    catch (error) {
        logger_1.default.error(`Error fetching offers: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching offers." });
    }
});
exports.getAllOffers = getAllOffers;
const respondToOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { offerId } = req.params;
    const { status, counterPrice } = req.body;
    const allowedStatuses = ["accepted", "rejected", "countered"];
    if (!status || !allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Status must be one of: accepted, rejected, countered." });
        return;
    }
    if (status === "countered" && (!counterPrice || isNaN(Number(counterPrice)) || Number(counterPrice) <= 0)) {
        res.status(400).json({ message: "A valid counter price is required when countering an offer." });
        return;
    }
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const offer = yield productoffer_1.default.findByPk(offerId, {
            include: [
                { model: product_1.default, as: "product", attributes: ["id", "name", "vendorId"] },
                { model: user_1.default, as: "buyer", attributes: ["id", "firstName", "fcmToken"] },
            ],
        });
        if (!offer) {
            res.status(404).json({ message: "Offer not found." });
            return;
        }
        const product = offer.product;
        if (product.vendorId !== adminId) {
            res.status(403).json({ message: "You can only respond to offers on your own products." });
            return;
        }
        if (offer.status !== "pending") {
            res.status(400).json({ message: "This offer has already been responded to." });
            return;
        }
        yield offer.update({
            status,
            counterPrice: status === "countered" ? Number(counterPrice) : null,
        });
        const buyer = offer.buyer;
        const notificationMessages = {
            accepted: `Your offer on "${product.name}" has been accepted!`,
            rejected: `Your offer on "${product.name}" has been declined.`,
            countered: `The admin has made a counter offer of ${counterPrice} on "${product.name}".`,
        };
        yield notification_1.default.create({
            userId: buyer.id,
            title: status === "accepted" ? "Offer Accepted" : status === "rejected" ? "Offer Declined" : "Counter Offer Received",
            message: notificationMessages[status],
            type: `OFFER_${status.toUpperCase()}`,
            isRead: false,
        });
        if (buyer.fcmToken) {
            try {
                yield (0, pushNotification_1.sendPushNotificationSingle)({
                    token: buyer.fcmToken,
                    notification: {
                        title: status === "accepted" ? "Offer Accepted" : status === "rejected" ? "Offer Declined" : "Counter Offer",
                        body: notificationMessages[status],
                    },
                    data: {
                        offerId: offer.id,
                        type: index_1.PushNotificationTypes.ORDER_STATUS_UPDATE,
                    },
                });
            }
            catch (pushError) {
                logger_1.default.error("Error sending push notification:", pushError);
            }
        }
        res.status(200).json({ message: "Offer response sent successfully.", data: offer });
    }
    catch (error) {
        logger_1.default.error(`Error responding to offer: ${error.message}`);
        res.status(500).json({ message: "An error occurred while responding to the offer." });
    }
});
exports.respondToOffer = respondToOffer;
//# sourceMappingURL=adminController.js.map