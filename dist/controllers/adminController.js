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
exports.getGeneralProducts = exports.viewGeneralStore = exports.getGeneralStores = exports.viewUser = exports.toggleUserStatus = exports.getAllVendors = exports.getAllCustomers = exports.deleteCurrency = exports.getAllCurrencies = exports.updateCurrency = exports.addCurrency = exports.setPaymentGatewayActive = exports.getAllPaymentGateways = exports.deletePaymentGateway = exports.updatePaymentGateway = exports.createPaymentGateway = exports.approveOrRejectKYC = exports.getAllKYC = exports.getAllSubCategories = exports.deleteSubCategory = exports.updateSubCategory = exports.createSubCategory = exports.getCategoriesWithSubCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.createSubscriptionPlan = exports.getAllSubscriptionPlans = exports.deletePermission = exports.updatePermission = exports.getPermissions = exports.createPermission = exports.deletePermissionFromRole = exports.assignPermissionToRole = exports.viewRolePermissions = exports.updateRole = exports.getRoles = exports.createRole = exports.resendLoginDetailsSubAdmin = exports.deleteSubAdmin = exports.deactivateOrActivateSubAdmin = exports.updateSubAdmin = exports.createSubAdmin = exports.subAdmins = exports.updatePassword = exports.updateProfile = exports.logout = void 0;
exports.deleteFaqCategory = exports.updateFaqCategory = exports.getFaqCategory = exports.getAllFaqCategories = exports.createFaqCategory = exports.deleteTestimonial = exports.getTestimonial = exports.getAllTestimonials = exports.updateTestimonial = exports.createTestimonial = exports.getOrderItemsInfo = exports.getOrderItems = exports.approveOrRejectAdvert = exports.viewGeneralAdvert = exports.getGeneralAdverts = exports.deleteAdvert = exports.viewAdvert = exports.getAdverts = exports.updateAdvert = exports.createAdvert = exports.activeProducts = exports.getTransactionsForAdmin = exports.viewAuctionProduct = exports.fetchAuctionProducts = exports.cancelAuctionProduct = exports.deleteAuctionProduct = exports.updateAuctionProduct = exports.createAuctionProduct = exports.changeProductStatus = exports.moveToDraft = exports.viewProduct = exports.fetchProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.deleteStore = exports.updateStore = exports.createStore = exports.getStore = exports.getAllSubscribers = exports.getGeneralPaymentDetails = exports.getAllGeneralOrderItems = exports.getAllGeneralOrders = exports.deleteGeneralAuctionProduct = exports.viewGeneralAuctionProduct = exports.getGeneralAuctionProducts = exports.publishProduct = exports.unpublishProduct = exports.deleteGeneralProduct = exports.viewGeneralProduct = void 0;
exports.downloadApplicantResume = exports.repostJob = exports.viewApplicant = exports.getJobApplicants = exports.deleteJob = exports.closeJob = exports.getJobById = exports.updateJob = exports.getJobs = exports.postJob = exports.deleteContactById = exports.getContactById = exports.getAllContacts = exports.deleteFaq = exports.updateFaq = exports.getFaq = exports.getAllFaqs = exports.createFaq = void 0;
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
// Define the upload directory
const uploadDir = path_1.default.join(__dirname, "../../uploads");
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
        res.status(400).json({ message: "New password must be at least 8 characters long." });
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
        const relatedTables = [
            { name: "stores", model: store_1.default, field: "vendorId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({ where: { [table.field]: subAdmin.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete sub-admin because related records exist in ${table.name}` });
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
        const queryOptions = {}; // Initialize query options
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
    const { name, duration, price, productLimit, allowsAuction, auctionProductLimit, maxAds, adsDurationDays, } = req.body;
    try {
        // Check if the subscription plan name already exists
        const existingPlan = yield subscriptionplan_1.default.findOne({ where: { name } });
        if (existingPlan) {
            res
                .status(400)
                .json({ message: "A plan with this name already exists." });
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
            maxAds,
            adsDurationDays,
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
    const { planId, name, duration, price, productLimit, allowsAuction, auctionProductLimit, maxAds, adsDurationDays, } = req.body;
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
        // Update fields
        plan.name = name;
        plan.duration = duration;
        plan.price = price;
        plan.productLimit = productLimit;
        plan.allowsAuction = allowsAuction;
        plan.auctionProductLimit = auctionProductLimit;
        plan.maxAds = maxAds;
        plan.adsDurationDays = adsDurationDays;
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
            { name: "vendor_subscriptions", model: vendorsubscription_1.default, field: "subscriptionPlanId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({ where: { [table.field]: plan.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete subscription plan because related records exist in ${table.name}` });
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
            const count = yield table.model.count({ where: { [table.field]: category.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete category because related records exist in ${table.name}` });
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
                where: { [table.field]: subCategory.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
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
        // Set all other active gateways to false
        yield paymentgateway_1.default.update({ isActive: false }, { where: { isActive: true } });
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
    if (!name || typeof name !== "string") {
        res.status(400).json({ message: "Name is required and must be a string." });
    }
    if (!symbol || typeof symbol !== "string") {
        res
            .status(400)
            .json({ message: "Symbol is required and must be a string." });
    }
    try {
        // Check for existing currency with matching name or symbol (case-insensitive)
        const existingCurrency = yield currency_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("name")), name.toLowerCase()),
                    sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn("LOWER", sequelize_1.Sequelize.col("symbol")), symbol.toLowerCase()),
                ],
            },
        });
        if (existingCurrency) {
            res
                .status(400)
                .json({
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
            res
                .status(400)
                .json({
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
            const count = yield table.model.count({ where: { [table.field]: currency.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete currency because related records exist in ${table.name}` });
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
        res
            .status(200)
            .json({
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
        res.status(200).json({ message: "User retrieved successfully.", data: user });
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
        res.status(500).json({ message: "Failed to retrieve stores", error: error.message });
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
                    attributes: ['symbol']
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
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
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
                            attributes: ['symbol']
                        },
                    ]
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
            { name: "carts", model: cart_1.default, field: "productId" }
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: product.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
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
        const product = yield product_1.default.findByPk(productId, { include: [{ model: user_1.default, as: "vendor" }] });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if the product is already unpublished
        if (product.status === 'inactive') {
            res.status(400).json({ message: "Product is already unpublished" });
            return;
        }
        // Update product status to inactive
        product.status = 'inactive';
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
        const product = yield product_1.default.findByPk(productId, { include: [{ model: user_1.default, as: "vendor" }] });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        // Check if the product is already active
        if (product.status === 'active') {
            res.status(400).json({ message: "Product is already published" });
            return;
        }
        // Update product status to active
        product.status = 'active';
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
                            attributes: ['symbol']
                        },
                    ]
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
        const relatedTables = [
            { name: "bids", model: bid_1.default, field: "auctionProductId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: auctionProduct.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete auction product because related records exist in ${table.name}` });
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
            filters.isActive = isActive === 'true';
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
                }
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
            res.status(404).json({ message: "No stores found for this admin.", data: [] });
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
    const { currencyId, name, location, logo, businessHours, deliveryOptions, tipsOnFinding } = req.body;
    if (!currencyId) {
        res.status(400).json({ message: 'Currency ID is required.' });
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
            res.status(404).json({ message: 'Currency not found' });
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
    const { storeId, currencyId, name, location, businessHours, deliveryOptions, tipsOnFinding, logo } = req.body;
    try {
        const store = yield store_1.default.findOne({ where: { id: storeId } });
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
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
            logo
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
            { name: "products", model: product_1.default, field: "storeId" }
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: store.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete store because related records exist in ${table.name}` });
                return;
            }
        }
        yield store.destroy({ transaction });
        yield transaction.commit();
        res.status(200).json({ message: "Store and all associations deleted successfully" });
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
            res
                .status(404)
                .json({ message: "Admin not found." });
            return;
        }
        if (!storeExists) {
            res
                .status(404)
                .json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
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
            { name: "carts", model: cart_1.default, field: "productId" }
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: product.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
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
                    attributes: ['name'],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
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
                            attributes: ['symbol']
                        },
                    ]
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
            res
                .status(404)
                .json({ message: "Admin not found." });
            return;
        }
        if (!storeExists) {
            res
                .status(404)
                .json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
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
            res
                .status(404)
                .json({ message: "Admin not found." });
            return;
        }
        if (!storeExists) {
            res
                .status(404)
                .json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
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
        const relatedTables = [
            { name: "bids", model: bid_1.default, field: "auctionProductId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: auctionProduct.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete auction product because related records exist in ${table.name}` });
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
                    attributes: ['name'],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })));
        if (auctionProducts.length === 0) {
            res
                .status(404)
                .json({ message: "No auction products found for this vendor.", data: [] });
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
                            attributes: ['symbol']
                        },
                    ]
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
            where: Object.assign(Object.assign(Object.assign({}, (transactionType && { transactionType: { [sequelize_1.Op.like]: `%${transactionType}%` } })), (refId && { refId: { [sequelize_1.Op.like]: `%${refId}%` } })), (status && { status })),
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
        res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
    }
});
exports.getTransactionsForAdmin = getTransactionsForAdmin;
// Adverts
const activeProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
    const { name } = req.query;
    try {
        const products = yield product_1.default.findAll(Object.assign({ where: { vendorId: adminId, status: "active" } }, ((name) && {
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
    const { categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;
    try {
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
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
            link
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
    const { advertId, categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;
    try {
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
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
                { model: product_1.default, as: "product", attributes: ['id', 'name'] },
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
                { showOnHomepage: { [sequelize_1.Op.like]: `%${search}%` } }
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
                { model: product_1.default, as: "product", attributes: ['id', 'name'] },
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
        res.status(400).json({ message: "Invalid status. Only 'approved' or 'rejected' allowed." });
        return;
    }
    // If rejected, ensure adminNote is provided
    if (status === "rejected" && !adminNote) {
        res.status(400).json({ message: "Admin note is required when rejecting an advert." });
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
            order: [["createdAt", "DESC"]], // Sort by most recent
        });
        if (!orderItems || orderItems.length === 0) {
            res.status(404).json({ message: "No order items found for this vendor." });
            return;
        }
        res.status(200).json({
            message: "Order items retrieved successfully",
            data: orderItems,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Failed to retrieve order items." });
    }
});
exports.getOrderItems = getOrderItems;
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
        res.status(500).json({ message: error.message || "Failed to retrieve order details." });
    }
});
exports.getOrderItemsInfo = getOrderItemsInfo;
// Create a testimonial
const createTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, position, photo, message } = req.body;
    try {
        if (!name || !message) {
            res.status(400).json({ message: "Name and message are required" });
            return;
        }
        const newTestimonial = yield testimonial_1.default.create({ name, position, photo, message });
        res.status(200).json({
            message: "Testimonial created successfully",
            data: newTestimonial,
        });
    }
    catch (error) {
        logger_1.default.error(`Error creating testimonial: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the testimonial. Please try again later." });
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
        res.status(200).json({ message: "Testimonial updated successfully", data: testimonial });
    }
    catch (error) {
        logger_1.default.error(`Error updating testimonial ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the testimonial. Please try again later." });
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
        res.status(500).json({ message: "An error occurred while retrieving testimonials. Please try again later." });
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
        res.status(500).json({ message: "An error occurred while fetching the testimonial. Please try again later." });
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
        res.status(500).json({ message: "An error occurred while deleting the testimonial. Please try again later." });
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
        res.status(200).json({ message: "FAQ category created successfully", data: newCategory });
    }
    catch (error) {
        logger_1.default.error(`Error creating FAQ category: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the FAQ category." });
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
        res.status(500).json({ message: "An error occurred while retrieving FAQ categories." });
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
        res.status(500).json({ message: "An error occurred while fetching the FAQ category." });
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
        res.status(200).json({ message: "FAQ category updated successfully", data: category });
    }
    catch (error) {
        logger_1.default.error(`Error updating FAQ category ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the FAQ category." });
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
        yield category.faqs.destroy();
        yield category.destroy();
        res.status(200).json({ message: "FAQ category deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(`Error deleting FAQ category ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while deleting the FAQ category." });
    }
});
exports.deleteFaqCategory = deleteFaqCategory;
// Create an FAQ
const createFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, question, answer } = req.body;
    try {
        if (!categoryId || !question || !answer) {
            res.status(400).json({ message: "Category ID, question, and answer are required" });
            return;
        }
        const categoryExists = yield faqcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }
        const newFaq = yield faq_1.default.create({
            faqCategoryId: categoryId, question, answer
        });
        res.status(200).json({ message: "FAQ created successfully", data: newFaq });
    }
    catch (error) {
        logger_1.default.error(`Error creating FAQ: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the FAQ." });
    }
});
exports.createFaq = createFaq;
// Get all FAQs
const getAllFaqs = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqs = yield faq_1.default.findAll({ include: [{ model: faqcategory_1.default, as: "faqCategory" }] });
        res.status(200).json({ data: faqs });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving FAQs: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving FAQs." });
    }
});
exports.getAllFaqs = getAllFaqs;
// Get a single FAQ
const getFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const faq = yield faq_1.default.findByPk(id, { include: [{ model: faqcategory_1.default, as: "faqCategory" }] });
        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }
        res.status(200).json({ data: faq });
    }
    catch (error) {
        logger_1.default.error(`Error fetching FAQ ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching the FAQ." });
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
            faqCategoryId: categoryId, question, answer
        });
        res.status(200).json({ message: "FAQ updated successfully", data: faq });
    }
    catch (error) {
        logger_1.default.error(`Error updating FAQ ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the FAQ." });
    }
});
exports.updateFaq = updateFaq;
// Delete an FAQ
const deleteFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
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
        res.status(500).json({ message: "An error occurred while deleting the FAQ." });
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
        const { title, workplaceType, jobType, location, description, } = req.body;
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
                        sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("Applicants.id")),
                        "applicantCount"
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
            where: { jobId }
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
        res.status(500).json({ message: "An error occurred while downloading the file" });
    }
});
exports.downloadApplicantResume = downloadApplicantResume;
//# sourceMappingURL=adminController.js.map