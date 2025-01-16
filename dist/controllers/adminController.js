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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewUser = exports.toggleUserStatus = exports.getAllVendors = exports.getAllCustomers = exports.deleteCurrency = exports.getAllCurrencies = exports.updateCurrency = exports.addCurrency = exports.setPaymentGatewayActive = exports.getAllPaymentGateways = exports.deletePaymentGateway = exports.updatePaymentGateway = exports.createPaymentGateway = exports.approveOrRejectKYC = exports.getAllKYC = exports.getAllSubCategories = exports.deleteSubCategory = exports.updateSubCategory = exports.createSubCategory = exports.getCategoriesWithSubCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getAllCategories = exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.createSubscriptionPlan = exports.getAllSubscriptionPlans = exports.deletePermission = exports.updatePermission = exports.getPermissions = exports.createPermission = exports.deletePermissionFromRole = exports.assignPermissionToRole = exports.viewRolePermissions = exports.updateRole = exports.getRoles = exports.createRole = exports.resendLoginDetailsSubAdmin = exports.deleteSubAdmin = exports.deactivateOrActivateSubAdmin = exports.updateSubAdmin = exports.createSubAdmin = exports.subAdmins = exports.updatePassword = exports.updateProfile = exports.logout = void 0;
const sequelize_1 = require("sequelize");
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
    var _b;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const adminId = (_b = req.admin) === null || _b === void 0 ? void 0 : _b.id; // Using optional chaining to access adminId
    try {
        // Find the admin
        const admin = yield admin_1.default.scope("auth").findByPk(adminId);
        if (!admin) {
            res.status(404).json({ message: "admin not found." });
            return;
        }
        // Check if the old password is correct
        const isMatch = yield admin.checkPassword(oldPassword);
        if (!isMatch) {
            res.status(400).json({ message: "Old password is incorrect." });
            return;
        }
        // Update the password
        admin.password = yield admin_1.default.hashPassword(newPassword); // Hash the new password before saving
        yield admin.save();
        // Send password reset notification email
        const message = messages_1.emailTemplates.adminPasswordResetNotification(admin);
        try {
            yield (0, mail_service_1.sendMail)(admin.email, `${process.env.APP_NAME} - Password Reset Notification`, message);
        }
        catch (emailError) {
            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
        }
        res.status(200).json({
            message: "Password updated successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error);
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
                    model: role_1.default,
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
    const { name, duration, price, productLimit, allowsAuction, auctionProductLimit, } = req.body;
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
    const { planId, name, duration, price, productLimit, allowsAuction, auctionProductLimit, } = req.body;
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
            where: name ? { name: { [sequelize_1.Op.like]: `%${name}%` } } : {},
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
            attributes: ["id", "name", "image"],
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
//# sourceMappingURL=adminController.js.map