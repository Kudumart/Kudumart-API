// src/controllers/userController.ts
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { Op, Sequelize, ForeignKeyConstraintError } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { generateOTP } from "../utils/helpers";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import JwtService from "../services/jwt.service";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import { capitalizeFirstLetter } from "../utils/helpers";
import Admin from "../models/admin";
import Role from "../models/role";
import Permission from "../models/permission";
import RolePermission from "../models/rolepermission";
import SubscriptionPlan from "../models/subscriptionplan";
import Category from "../models/category";
import SubCategory from "../models/subcategory";
import User from "../models/user";
import KYC from "../models/kyc";
import PaymentGateway from "../models/paymentgateway";
import Currency from "../models/currency";
import { log } from "console";
import Product from "../models/product";
import Store from "../models/store";
import AuctionProduct from "../models/auctionproduct";
import Order from "../models/order";
import OrderItem from "../models/orderitem";
import Payment from "../models/payment";
import Bid from "../models/bid";
import VendorSubscription from "../models/vendorsubscription";
import sequelizeService from "../services/sequelize.service";
import Transaction from "../models/transaction";

// Extend the Express Request interface to include adminId and admin
interface AuthenticatedRequest extends Request {
    adminId?: string;
    admin?: Admin; // This is the instance type of the Admin model
}

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get the token from the request
        const token = JwtService.jwtGetToken(req);

        if (!token) {
            res.status(400).json({
                message: "Token not provided",
            });
            return;
        }

        // Blacklist the token to prevent further usage
        await JwtService.jwtBlacklistToken(token);

        res.status(200).json({
            message: "Logged out successfully.",
        });
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: "Server error during logout.",
        });
    }
};

export const updateProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, email, photo } = req.body;
        const adminId = req.admin?.id;

        // Fetch the admin by their ID
        const admin = await Admin.findByPk(adminId);
        if (!admin) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }

        // Check if email is being updated
        if (email && email !== admin.email) {
            // Check if the email already exists for another user
            const emailExists = await Admin.findOne({ where: { email } });
            if (emailExists) {
                res
                    .status(400)
                    .json({ message: "Email is already in use by another user." });
                return;
            }
        }

        // Update admin profile information
        admin.name = name ? capitalizeFirstLetter(name) : admin.name;
        admin.photo = photo || admin.photo;
        admin.email = email || admin.email;

        await admin.save();

        res.status(200).json({
            message: "Profile updated successfully.",
            data: admin,
        });
    } catch (error: any) {
        logger.error("Error updating admin profile:", error);

        res.status(500).json({
            message: "Server error during profile update.",
        });
    }
};

export const updatePassword = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const adminId = req.admin?.id; // Using optional chaining to access adminId

    try {
        // Find the admin
        const admin = await Admin.scope("auth").findByPk(adminId);
        if (!admin) {
            res.status(404).json({ message: "admin not found." });
            return;
        }

        // Check if the old password is correct
        const isMatch = await admin.checkPassword(oldPassword);
        if (!isMatch) {
            res.status(400).json({ message: "Old password is incorrect." });
            return;
        }

        // Update the password
        admin.password = await Admin.hashPassword(newPassword); // Hash the new password before saving
        await admin.save();

        // Send password reset notification email
        const message = emailTemplates.adminPasswordResetNotification(admin);
        try {
            await sendMail(
                admin.email,
                `${process.env.APP_NAME} - Password Reset Notification`,
                message
            );
        } catch (emailError) {
            logger.error("Error sending email:", emailError); // Log error for internal use
        }

        res.status(200).json({
            message: "Password updated successfully.",
        });
    } catch (error) {
        logger.error(error);

        res.status(500).json({
            message: "Server error during password update.",
        });
    }
};

export const subAdmins = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, email } = req.query; // Get the search query parameters

        // Build the where condition dynamically based on the presence of name and email
        const whereCondition: any = {};

        if (name) {
            whereCondition.name = {
                [Op.like]: `%${name}%`, // Use LIKE for case-insensitive match
            };
        }

        if (email) {
            whereCondition.email = {
                [Op.like]: `%${email}%`, // Use LIKE for case-insensitive match
            };
        }

        // Fetch sub-admins along with their roles, applying the search conditions
        const subAdmins = await Admin.findAll({
            where: whereCondition,
            include: [
                {
                    model: Role, // Include the Role model in the query
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
    } catch (error) {
        logger.error("Error retrieving sub-admins:", error);
        res.status(500).json({ message: `Error retrieving sub-admins: ${error}` });
    }
};

export const createSubAdmin = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, email, roleId } = req.body;

        // Check if the email already exists
        const existingSubAdmin = await Admin.findOne({ where: { email } });
        if (existingSubAdmin) {
            res.status(400).json({ message: "Email already in use" });
            return;
        }

        // Generate a random password (you can change this to your desired method)
        const password = Math.random().toString(36).slice(-8);

        const checkRole = await Role.findByPk(roleId);
        if (!checkRole) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        // Create the sub-admin
        const newSubAdmin = await Admin.create({
            name,
            email,
            password: password,
            roleId,
            status: "active", // Default status
        });

        // Send mail
        let message = emailTemplates.subAdminCreated(newSubAdmin, password);
        try {
            await sendMail(
                email,
                `${process.env.APP_NAME} - Your Sub-Admin Login Details`,
                message
            );
        } catch (emailError) {
            logger.error("Error sending email:", emailError); // Log error for internal use
        }

        res.status(200).json({ message: "Sub Admin created successfully." });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: `Error creating sub-admin: ${error}` });
    }
};

export const updateSubAdmin = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { subAdminId, name, email, roleId } = req.body;

    try {
        // Find the sub-admin by their ID
        const subAdmin = await Admin.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }

        // Check if the email is already in use by another sub-admin
        if (email && email !== subAdmin.email) {
            // Only check if the email has changed
            const existingAdmin = await Admin.findOne({
                where: {
                    email,
                    id: { [Op.ne]: subAdminId }, // Ensure it's not the same sub-admin
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
        await subAdmin.update({
            name,
            email,
            roleId,
        });

        res.status(200).json({ message: "Sub Admin updated successfully." });
    } catch (error) {
        // Log and send the error message in the response
        logger.error("Error updating sub-admin:", error);
        res.status(500).json({ message: `Error updating sub-admin: ${error}` });
    }
};

export const deactivateOrActivateSubAdmin = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { subAdminId } = req.body;

    try {
        // Find the sub-admin by ID
        const subAdmin = await Admin.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }

        // Toggle status: if active, set to inactive; if inactive, set to active
        const newStatus = subAdmin.status === "active" ? "inactive" : "active";
        subAdmin.status = newStatus;

        // Save the updated status
        await subAdmin.save();

        res
            .status(200)
            .json({ message: `Sub-admin status updated to ${newStatus}.` });
    } catch (error) {
        // Log the error and send the response
        logger.error("Error updating sub-admin status:", error);
        res
            .status(500)
            .json({ message: `Error updating sub-admin status: ${error}` });
    }
};

export const deleteSubAdmin = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const subAdminId = req.query.subAdminId as string;

    try {
        const subAdmin = await Admin.findByPk(subAdminId);
        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }

        await subAdmin.destroy();
        res.status(200).json({ message: "Sub-admin deleted successfully" });
    } catch (error) {
        logger.error(error);
        res
            .status(500)
            .json({ message: "Error deleting sub-admin: ${error.message}" });
    }
};

export const resendLoginDetailsSubAdmin = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { subAdminId } = req.body;

    try {
        const subAdmin = await Admin.findByPk(subAdminId);

        if (!subAdmin) {
            res.status(404).json({ message: "Sub-admin not found" });
            return;
        }

        // Generate a new password (or reuse the existing one)
        const password = Math.random().toString(36).slice(-8);

        // Update the password in the database
        subAdmin.password = password;
        await subAdmin.save();

        // Send mail
        let message = emailTemplates.subAdminCreated(subAdmin, password);
        try {
            await sendMail(
                subAdmin.email,
                `${process.env.APP_NAME} - Your New Login Details`,
                message
            );
        } catch (emailError) {
            logger.error("Error sending email:", emailError); // Log error for internal use
        }

        res.status(200).json({ message: "Login details resent successfully" });
    } catch (error) {
        logger.error(error);
        res
            .status(500)
            .json({ message: "Error resending login details: ${error.message}" });
    }
};

// Roles
// Create a new Role
export const createRole = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { name } = req.body;

    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }

        // Check if a role with the same name already exists
        const existingRole = await Role.findOne({ where: { name } });
        if (existingRole) {
            res.status(409).json({ message: "Role with this name already exists." });
            return;
        }

        // Create the new role
        const role = await Role.create({ name });
        res.status(200).json({ message: "Role created successfully" });
    } catch (error) {
        logger.error("Error creating role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all Roles
export const getRoles = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const roles = await Role.findAll();
        res.status(200).json({ data: roles });
    } catch (error) {
        logger.error("Error fetching roles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update an existing Role
export const updateRole = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { roleId, name } = req.body;

    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }

        const role = await Role.findByPk(roleId);

        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        // Check if another role with the same name exists
        const existingRole = await Role.findOne({
            where: { name, id: { [Op.ne]: roleId } }, // Exclude the current role ID
        });

        if (existingRole) {
            res
                .status(409)
                .json({ message: "Another role with this name already exists." });
            return;
        }

        // Update the role name
        role.name = name;
        await role.save();

        res.status(200).json({ message: "Role updated successfully", role });
    } catch (error) {
        logger.error("Error updating role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// View a Role's Permissions
export const viewRolePermissions = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const roleId = req.query.roleId as string;

    try {
        const role = await Role.findByPk(roleId, {
            include: [{ model: Permission, as: "permissions" }],
        });

        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        res.status(200).json({ data: role });
    } catch (error) {
        logger.error("Error fetching role permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Assign a New Permission to a Role
export const assignPermissionToRole = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { roleId, permissionId } = req.body;

    try {
        // Ensure role and permission exist
        const role = await Role.findByPk(roleId);

        const permission = await Permission.findByPk(permissionId);

        if (!role || !permission) {
            res.status(404).json({ message: "Role or Permission not found" });
            return;
        }

        // Check if the permission is already assigned to the role
        const existingRolePermission = await RolePermission.findOne({
            where: { roleId, permissionId },
        });

        if (existingRolePermission) {
            res
                .status(409)
                .json({ message: "Permission is already assigned to this role" });
            return;
        }

        // Assign permission to role
        await RolePermission.create({ roleId, permissionId });

        res
            .status(200)
            .json({ message: "Permission assigned to role successfully" });
    } catch (error) {
        logger.error("Error assigning permission to role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a Permission from a Role
export const deletePermissionFromRole = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { roleId, permissionId } = req.query;

    try {
        const role = await Role.findOne({
            where: { id: roleId },
        });

        if (!role) {
            res.status(404).json({ message: "Role not found" });
            return;
        }

        const rolePermission = await RolePermission.findOne({
            where: { roleId, permissionId },
        });

        if (!rolePermission) {
            res.status(404).json({ message: "Permission not found for the role" });
            return;
        }

        await rolePermission.destroy();

        res
            .status(200)
            .json({ message: "Permission removed from role successfully" });
    } catch (error) {
        logger.error("Error deleting permission from role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Permission
// Create a new Permission
export const createPermission = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name } = req.body;

    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }

        // Check if permission name already exists
        const existingPermission = await Permission.findOne({ where: { name } });
        if (existingPermission) {
            res.status(409).json({ message: "Permission name already exists." });
            return;
        }

        // Create new permission if it doesn't exist
        const permission = await Permission.create({ name });
        res.status(201).json({
            message: "Permission created successfully",
        });
    } catch (error) {
        logger.error("Error creating permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all Permissions
export const getPermissions = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const permissions = await Permission.findAll();
        res.status(200).json({ data: permissions });
    } catch (error) {
        logger.error("Error fetching permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update an existing Permission
export const updatePermission = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { permissionId, name } = req.body;

    try {
        if (!name) {
            res.status(400).json({ message: "Name is required." });
            return;
        }

        const permission = await Permission.findByPk(permissionId);

        if (!permission) {
            res.status(404).json({ message: "Permission not found" });
            return;
        }

        // Check if the new name exists in another permission
        const existingPermission = await Permission.findOne({
            where: {
                name,
                id: { [Op.ne]: permissionId }, // Exclude current permission
            },
        });

        if (existingPermission) {
            res.status(409).json({ message: "Permission name already exists." });
            return;
        }

        permission.name = name;
        await permission.save();

        res.status(200).json({ message: "Permission updated successfully" });
    } catch (error) {
        logger.error("Error updating permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a Permission and cascade delete from role_permissions
export const deletePermission = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const permissionId = req.query.permissionId as string;

        // Find the permission
        const permission = await Permission.findByPk(permissionId);

        if (!permission) {
            res.status(404).json({ message: "Permission not found" });
            return;
        }

        // Delete the permission and associated role_permissions
        await permission.destroy();
        await RolePermission.destroy({ where: { permissionId } });

        res.status(200).json({
            message:
                "Permission and associated role permissions deleted successfully",
        });
    } catch (error) {
        logger.error("Error deleting permission:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Subscription Plan
export const getAllSubscriptionPlans = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name } = req.query; // Get the name from query parameters

        const queryOptions: any = {}; // Initialize query options

        // If a name is provided, add a condition to the query
        if (name) {
            queryOptions.where = {
                name: {
                    [Op.like]: `%${name}%`, // Use a partial match for name
                },
            };
        }

        const plans = await SubscriptionPlan.findAll(queryOptions); // Use query options
        res.status(200).json({ data: plans });
    } catch (error) {
        logger.error("Error fetching subscription plans:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createSubscriptionPlan = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {
        name,
        duration,
        price,
        productLimit,
        allowsAuction,
        auctionProductLimit,
        maxAds,
        adsDurationDays,
    } = req.body;

    try {
        // Check if the subscription plan name already exists
        const existingPlan = await SubscriptionPlan.findOne({ where: { name } });

        if (existingPlan) {
            res
                .status(400)
                .json({ message: "A plan with this name already exists." });
            return;
        }

        // Create the subscription plan
        await SubscriptionPlan.create({
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
    } catch (error) {
        logger.error("Error creating subscription plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateSubscriptionPlan = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {
        planId,
        name,
        duration,
        price,
        productLimit,
        allowsAuction,
        auctionProductLimit,
        maxAds,
        adsDurationDays,
    } = req.body;

    try {
        // Fetch the subscription plan to update
        const plan = await SubscriptionPlan.findByPk(planId);
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
        const existingPlan = await SubscriptionPlan.findOne({
            where: { name, id: { [Op.ne]: planId } },
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
        plan.adsDurationDays =adsDurationDays; 
        await plan.save();

        res.status(200).json({ message: "Subscription plan updated successfully" });
    } catch (error) {
        logger.error("Error updating subscription plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteSubscriptionPlan = async (
    req: Request,
    res: Response
): Promise<void> => {
    const planId = req.query.planId as string;

    try {
        // Fetch the subscription plan
        const plan = await SubscriptionPlan.findByPk(planId);
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
        await plan.destroy();
        res
            .status(200)
            .json({ message: "Subscription plan deleted successfully." });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete subscription plan because it is currently assigned to one or more vendors. Please reassign or delete these associations before proceeding.",
            });
        } else {
            logger.error("Error deleting subscription plan:", error);
            res.status(500).json({ message: "Error deleting subscription plan" });
        }
    }
};

export const getAllCategories = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name } = req.query;

    try {
        const categories = await Category.findAll({
            where: name ? { name: { [Op.like]: `%${name}%` } } : {}, // Search by name if provided
            attributes: {
                include: [
                    [
                        // Count the total number of subcategories without including them in the result
                        Sequelize.literal(
                            `(SELECT COUNT(*) FROM sub_categories WHERE sub_categories.categoryId = Category.id)`
                        ),
                        "subCategoryCount",
                    ],
                ],
            },
        });

        res.status(200).json({ data: categories });
    } catch (error) {
        logger.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

// category
export const createCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
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
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            res.status(400).json({ message: "Category name already exists" });
            return;
        }

        // Create the new category
        const category = await Category.create({ name, image });
        res.status(200).json({ message: "Category created successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error creating category" });
    }
};

export const updateCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
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
        const checkCategory = await Category.findByPk(categoryId);
        if (!checkCategory) {
            res.status(404).json({
                message: "Category not found",
            });
            return;
        }

        // Check if another category with the same name exists, excluding the current category
        const existingCategory = await Category.findOne({
            where: { name, id: { [Op.ne]: categoryId } },
        });

        if (existingCategory) {
            res.status(400).json({ message: "Category name already in use" });
            return; // Ensure the function returns after sending a response
        }

        // Fetch category by ID to update
        const category = await Category.findByPk(categoryId);
        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return; // Ensure the function returns after sending a response
        }

        // Update the category
        await category.update({ name, image });

        // Send the success response
        res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
        logger.error(error); // Use logger.error instead of logger for debugging
        res.status(500).json({ message: "Error updating category" });
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    const categoryId = req.query.categoryId as string;

    try {
        const category = await Category.findByPk(categoryId);

        if (!category) {
            res.status(404).json({ message: "Category not found" });
            return;
        }

        await category.destroy();
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete category because it has associated sub-categories. Delete or reassign sub-categories before deleting this category.",
            });
        } else {
            logger.error(error);
            res.status(500).json({ message: "Error deleting category" });
        }
    }
};

export const getCategoriesWithSubCategories = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: SubCategory,
                    as: "subCategories", // alias used in the association
                },
            ],
            attributes: ["id", "name", "image"], // select specific fields in Category
            order: [["name", "ASC"]], // sort categories alphabetically, for example
        });

        res.status(200).json({ data: categories });
    } catch (error) {
        logger.error("Error fetching categories with subcategories:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// sub_category
export const createSubCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
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
        const checkCategory = await Category.findByPk(categoryId);
        if (!checkCategory) {
            res.status(404).json({
                message: "Category not found",
            });
            return;
        }

        // Check if a sub_category with the same name already exists within the same category
        const existingSubCategory = await SubCategory.findOne({
            where: { name, categoryId },
        });
        if (existingSubCategory) {
            res.status(400).json({
                message: "Sub-category name already exists within this category",
            });
            return;
        }

        // Create new sub_category
        const newSubCategory = await SubCategory.create({
            categoryId,
            name,
            image,
        });
        res.status(200).json({
            message: "Sub-category created successfully",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error creating sub-category" });
    }
};

export const updateSubCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
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
        const checkCategory = await Category.findByPk(categoryId);
        if (!checkCategory) {
            res.status(404).json({
                message: "Category not found",
            });
            return;
        }

        // Fetch sub_category by ID to update
        const subCategory = await SubCategory.findByPk(subCategoryId);
        if (!subCategory) {
            res.status(404).json({ message: "Sub-category not found" });
            return;
        }

        // Check if another sub_category with the same name exists within the same category
        const existingSubCategory = await SubCategory.findOne({
            where: { name, categoryId, id: { [Op.ne]: subCategoryId } },
        });
        if (existingSubCategory) {
            res.status(400).json({
                message: "Sub-category name already exists within this category",
            });
            return;
        }

        // Update the sub_category
        await subCategory.update({ name, image });
        res.status(200).json({ message: "Sub-category updated successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error updating sub-category" });
    }
};

export const deleteSubCategory = async (
    req: Request,
    res: Response
): Promise<void> => {
    const subCategoryId = req.query.subCategoryId as string;

    if (!subCategoryId) {
        res.status(400).json({ message: "Sub-category ID is required" });
        return;
    }

    try {
        const subCategory = await SubCategory.findByPk(subCategoryId);
        if (!subCategory) {
            res.status(404).json({ message: "Sub-category not found" });
            return;
        }

        await subCategory.destroy();
        res.status(200).json({ message: "Sub-category deleted successfully" });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete sub-category because it has associated products. Delete or reassign products before deleting this sub-category.",
            });
        } else {
            logger.error(error);
            res.status(500).json({ message: "Error deleting sub-category" });
        }
    }
};

export const getAllSubCategories = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name } = req.query;

    try {
        // Query with name filter if provided
        const whereClause = name ? { name: { [Op.like]: `%${name}%` } } : {};

        const subCategories = await SubCategory.findAll({ where: whereClause });
        res.status(200).json({ data: subCategories });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error fetching sub-categories" });
    }
};

// KYC
export const getAllKYC = async (req: Request, res: Response): Promise<void> => {
    const { email, firstName, lastName } = req.query;

    try {
        // Build query filters
        const userFilter: any = {};
        if (email) userFilter.email = { [Op.like]: `%${email}%` };
        if (firstName) userFilter.firstName = { [Op.like]: `%${firstName}%` };
        if (lastName) userFilter.lastName = { [Op.like]: `%${lastName}%` };

        // Fetch all KYC records with User relationship
        const kycRecords = await KYC.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    where: userFilter,
                },
            ],
        });

        res.status(200).json({ data: kycRecords });
    } catch (error: any) {
        logger.error("Error retrieving KYC records:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const approveOrRejectKYC = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { kycId, isVerified, note } = req.body; // Approve flag and note from request body

    try {
        // Find the KYC record by ID
        const kycRecord = await KYC.findByPk(kycId, {
            include: [
                {
                    model: User,
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
        await kycRecord.save();

        // Prepare email notification
        const isApproved = isVerified;
        const message = emailTemplates.kycStatusUpdate(
            user,
            isApproved,
            kycRecord.adminNote
        );

        // Send email notification
        try {
            await sendMail(
                user.email,
                `${process.env.APP_NAME} - Your KYC Status Update`,
                message
            );
        } catch (emailError) {
            logger.error("Error sending email:", emailError); // Log error for internal use
            // Optionally handle this scenario (e.g., revert KYC status)
        }

        // Send response
        res.status(200).json({
            message: isApproved
                ? "KYC approved successfully"
                : "KYC rejected with note",
        });
    } catch (error: any) {
        logger.error("Error approving/rejecting KYC:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Payment Gateway
export const createPaymentGateway = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name, publicKey, secretKey } = req.body;

    try {
        // Check if any payment gateway is active
        const activeGateway = await PaymentGateway.findOne({
            where: { isActive: true },
        });

        // If there's no active gateway, set the new one as active, else set it as inactive
        const newIsActive = activeGateway ? false : true;

        const paymentGateway = await PaymentGateway.create({
            name,
            publicKey,
            secretKey,
            isActive: newIsActive,
        });

        res.status(200).json({
            message: "Payment Gateway created successfully",
            data: paymentGateway,
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while creating the payment gateway.",
        });
    }
};

export const updatePaymentGateway = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id, name, publicKey, secretKey } = req.body;

    try {
        const paymentGateway = await PaymentGateway.findByPk(id);

        if (!paymentGateway) {
            res.status(404).json({ message: "Payment Gateway not found" });
            return;
        }

        await paymentGateway.update({
            name,
            publicKey,
            secretKey,
        });

        res.status(200).json({
            message: "Payment Gateway updated successfully",
            data: paymentGateway,
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while updating the payment gateway.",
        });
    }
};

export const deletePaymentGateway = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = req.query.id as string;

    try {
        const paymentGateway = await PaymentGateway.findByPk(id);

        if (!paymentGateway) {
            res.status(404).json({ message: "Payment Gateway not found" });
            return;
        }

        if (paymentGateway.isActive) {
            // If the gateway to be deleted is active, check for another active one
            const anotherActiveGateway = await PaymentGateway.findOne({
                where: { id: { [Op.ne]: id } },
            });

            if (anotherActiveGateway) {
                // If another active gateway exists, set it to active and delete this one
                await anotherActiveGateway.update({ isActive: true });
                await paymentGateway.destroy();
                res.status(200).json({
                    message:
                        "Payment Gateway deleted successfully and another one activated.",
                });
            } else {
                // If no other active gateway, delete this one
                await paymentGateway.destroy();
                res.status(200).json({
                    message: "Last active payment gateway deleted.",
                });
            }
        } else {
            // If the gateway is not active, just delete it
            await paymentGateway.destroy();
            res.status(200).json({
                message: "Payment Gateway deleted successfully.",
            });
        }
    } catch (error: any) {
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while deleting the payment gateway.",
        });
    }
};

export const getAllPaymentGateways = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const gateways = await PaymentGateway.findAll();
        res.status(200).json({
            message: "Payment Gateways retrieved successfully",
            data: gateways,
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                error.message || "An error occurred while fetching payment gateways.",
        });
    }
};

export const setPaymentGatewayActive = async (
    req: Request,
    res: Response
): Promise<void> => {
    const id = req.query.id as string;

    try {
        const paymentGateway = await PaymentGateway.findByPk(id);

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
        await PaymentGateway.update(
            { isActive: false },
            { where: { isActive: true } }
        );

        // Set the specified gateway as active
        await paymentGateway.update({ isActive: true });

        res.status(200).json({
            message: "Payment Gateway successfully set to active.",
        });
    } catch (error: any) {
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while updating the payment gateway.",
        });
    }
};

// Currency
export const addCurrency = async (
    req: Request,
    res: Response
): Promise<void> => {
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
        const existingCurrency = await Currency.findOne({
            where: {
                [Op.or]: [
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.col("name")),
                        name.toLowerCase()
                    ),
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.col("symbol")),
                        symbol.toLowerCase()
                    ),
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

        const currency = await Currency.create({ name, symbol });
        res.status(200).json({ message: "Currency added successfully", currency });
    } catch (error) {
        logger.error("Error adding currency:", error);
        res.status(500).json({ message: "Failed to add currency" });
    }
};

export const updateCurrency = async (
    req: Request,
    res: Response
): Promise<void> => {
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
        const currency = await Currency.findByPk(currencyId);

        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }

        // Check for uniqueness of name and symbol, excluding the current record
        const existingCurrency = await Currency.findOne({
            where: {
                [Op.or]: [
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.col("name")),
                        name.toLowerCase()
                    ),
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.col("symbol")),
                        symbol.toLowerCase()
                    ),
                ],
                id: { [Op.ne]: currencyId }, // Exclude the current currency
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
        await currency.update({ name, symbol });
        res
            .status(200)
            .json({ message: "Currency updated successfully", currency });
    } catch (error) {
        logger.error("Error updating currency:", error);
        res.status(500).json({ message: "Failed to update currency" });
    }
};

export const getAllCurrencies = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const currencies = await Currency.findAll();
        res.status(200).json({ data: currencies });
    } catch (error) {
        logger.error("Error fetching currencies:", error);
        res.status(500).json({ message: "Failed to fetch currencies" });
    }
};

export const deleteCurrency = async (
    req: Request,
    res: Response
): Promise<void> => {
    const currencyId = req.query.currencyId as string;

    try {
        const currency = await Currency.findByPk(currencyId);

        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
            return;
        }

        await currency.destroy();
        res.status(200).json({ message: "Currency deleted successfully" });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete currency because it is currently assigned to one or more stores. Please reassign or delete these associations before proceeding.",
            });
        } else {
            logger.error("Error deleting currency:", error);
            res.status(500).json({ message: "Failed to delete currency" });
        }
    }
};

export const getAllCustomers = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
        const offset = (Number(page) - 1) * Number(limit);

        const searchCondition = {
            [Op.or]: [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phoneNumber: { [Op.like]: `%${search}%` } },
            ],
        };

        const { rows: customers, count: totalCustomers } =
            await User.findAndCountAll({
                where: {
                    accountType: "Customer",
                    ...searchCondition,
                },
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
    } catch (error) {
        logger.error("Error fetching customers:", error);
        res.status(500).json({ message: "Failed to fetch customers", error });
    }
};

export const getAllVendors = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { page = 1, limit = 10, search = "" } = req.query;

    try {
        const offset = (Number(page) - 1) * Number(limit);

        const searchCondition = {
            [Op.or]: [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phoneNumber: { [Op.like]: `%${search}%` } },
            ],
        };

        const { rows: vendors, count: totalVendors } = await User.findAndCountAll({
            where: {
                accountType: "Vendor",
                ...searchCondition,
            },
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
    } catch (error) {
        logger.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Failed to fetch vendors" });
    }
};

export const toggleUserStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.query.userId as string;

    try {
        // Fetch the user
        const user = await User.findByPk(userId);

        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        // Toggle the status
        user.status = user.status === "active" ? "inactive" : "active";
        await user.save();

        const statusMessage =
            user.status === "active" ? "activated" : "deactivated";
        res
            .status(200)
            .json({
                message: `User successfully ${statusMessage}.`,
            });
    } catch (error) {
        logger.error("Error toggling user status:", error);
        res.status(500).json({ message: "Failed to toggle user status." });
    }
};

export const viewUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.query.userId as string;

    try {
        // Fetch the user
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: KYC,
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
    } catch (error) {
        logger.error("Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user.", error });
    }
};

export const getGeneralStores = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page
        const offset = (page - 1) * limit; // Calculate offset

        // Fetch stores with pagination and associated data
        const { rows: stores, count: totalStores } = await Store.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Currency,
                    as: "currency",
                },
                {
                    model: Product,
                    as: "products",
                    attributes: [], // Exclude detailed product attributes
                },
                {
                    model: AuctionProduct,
                    as: "auctionproducts",
                    attributes: [], // Exclude detailed auction product attributes
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM auction_products AS auctionproduct
                            WHERE auctionproduct.storeId = Store.id
                        )`),
                        "totalAuctionProducts",
                    ],
                ],
            },
            offset, // Apply offset for pagination
            limit,  // Apply limit for pagination
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
    } catch (error: any) {
        logger.error("Error retrieving stores:", error);
        res.status(500).json({ message: "Failed to retrieve stores", error: error.message });
    }
};

export const viewGeneralStore = async (
    req: Request,
    res: Response
): Promise<void> => {
    // Get productId from route params instead of query
    const { storeId } = req.query;

    try {
        const store = await Store.findOne({
            where: {
                [Op.or]: [{ id: storeId }, { name: storeId }],
            },
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Currency,
                    as: "currency",
                    attributes: ['symbol']
                },
                {
                    model: Product,
                    as: "products",
                    attributes: [], // Exclude detailed product attributes
                },
                {
                    model: AuctionProduct,
                    as: "auctionproducts",
                    attributes: [], // Exclude detailed auction product attributes
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        Sequelize.literal(`(
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch store" });
    }
};

export const getGeneralProducts = async (req: Request, res: Response): Promise<void> => {
    const { name, sku, status, condition, categoryName, page, limit } = req.query;

    try {
        // Get pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1; // Default to page 1 if not provided
        const limitNumber = parseInt(limit as string, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * limitNumber;

        // Fetch products with filters, pagination, and associated data
        const { rows: products, count: totalProducts } = await Product.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: SubCategory,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: Store,
                    as: "store",
                    attributes: ["name"],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ],
            ...((name || sku || status || condition) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                    ...(sku && { sku }),
                    ...(status && { status }),
                    ...(condition && { condition }),
                },
            }),
            offset, // Apply offset for pagination
            limit: limitNumber, // Apply limit for pagination
            order: [["createdAt", "DESC"]], // Order by creation date (newest first)
        });

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
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

export const viewGeneralProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    // Get productId from route params instead of query
    const { productId } = req.query;

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
            },
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Store,
                    as: "store",
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

export const deleteGeneralProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { productId } = req.query;

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
            },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }

        await product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

export const getGeneralAuctionProducts = async (req: Request, res: Response): Promise<void> => {
    const { name, sku, status, condition, categoryName, page, limit } = req.query;

    try {
        // Get pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1; // Default to page 1 if not provided
        const limitNumber = parseInt(limit as string, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * limitNumber;

        // Fetch auction products with filters, pagination, and associated data
        const { rows: auctionProducts, count: totalAuctionProducts } = await AuctionProduct.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: SubCategory,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: Store,
                    as: "store",
                    attributes: ["name"],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ],
            ...((name || sku || status || condition) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                    ...(sku && { sku }),
                    ...(status && { status }),
                    ...(condition && { condition }),
                },
            }),
            offset, // Apply offset for pagination
            limit: limitNumber, // Apply limit for pagination
            order: [["createdAt", "DESC"]], // Order by creation date (newest first)
        });

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
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching auction products.",
        });
    }
};

export const viewGeneralAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    // Get auctionProductId from route params instead of query
    const { auctionProductId } = req.query;

    try {
        const product = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
            },
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Store,
                    as: "store",
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

export const deleteGeneralAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { auctionProductId } = req.query;

    try {
        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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

        const bidCount = await Bid.count({
            where: { auctionProductId },
        });

        if (bidCount > 0) {
            res.status(400).json({
                message: "Auction product already has bids, cannot be deleted.",
            });
            return;
        }

        // Delete the auction product
        await auctionProduct.destroy();

        res.status(200).json({ message: "Auction product deleted successfully." });
    } catch (error: any) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        } else {
            logger.error(error);
            res.status(500).json({
                message:
                    error.message ||
                    "An error occurred while deleting the auction product.",
            });
        }
    }
};

export const getAllGeneralOrders = async (req: Request, res: Response): Promise<void> => {
    const { trackingNumber, page, limit } = req.query; // Only track by tracking number, no pagination

    try {
        // Fetch orders with the count of order items, and apply search by tracking number
        const orders = await Order.findAll({
            where: {
                ...(trackingNumber && {
                    trackingNumber: { [Op.like]: `%${trackingNumber}%` }, // Search by tracking number
                }),
            },
            attributes: {
                include: [
                    [
                        Sequelize.fn("COUNT", Sequelize.col("orderItems.id")),
                        "orderItemsCount", // Alias for the count of order items
                    ],
                ],
            },
            include: [
                {
                    model: OrderItem,
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
    } catch (error) {
        logger.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllGeneralOrderItems = async (req: Request, res: Response): Promise<void> => {
    const { orderId, page = 1, limit = 10 } = req.query;

    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    try {
        // Ensure `orderId` is provided
        if (!orderId) {
            res.status(400).json({ message: "Order ID is required" });
            return;
        }

        // Query for order items with pagination
        const { rows: orderItems, count } = await OrderItem.findAndCountAll({
            where: { orderId },
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
    } catch (error) {
        logger.error("Error fetching order items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGeneralPaymentDetails = async (req: Request, res: Response): Promise<void> => {
    const { orderId, page = 1, limit = 10 } = req.query;

    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    try {
        // Ensure `orderId` is provided
        if (!orderId) {
            res.status(400).json({ message: "Order ID is required" });
            return;
        }

        // Fetch payments for the given orderId with pagination
        const { count, rows: payments } = await Payment.findAndCountAll({
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
    } catch (error) {
        logger.error("Error fetching payment details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllSubscribers = async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, subscriptionPlanId, isActive } = req.query; // Destructure query params for page, limit, etc.

    try {
        // Pagination and filtering
        const offset = (Number(page) - 1) * Number(limit);

        // Construct filter criteria
        const filters: any = {};
        if (subscriptionPlanId) {
            filters.subscriptionPlanId = subscriptionPlanId;
        }
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        // Fetch vendor subscriptions with pagination and filters
        const subscribers = await VendorSubscription.findAndCountAll({
            where: filters, // Apply filters (if any)
            limit: Number(limit), // Limit results per page
            offset, // Offset for pagination
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Specify which subscription plan fields to include
                },
                {
                    model: SubscriptionPlan,
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
    } catch (error) {
        // Handle any unexpected errors
        logger.error("Error retrieving subscribers:", error);
        res.status(500).json({ message: "Failed to retrieve subscribers" });
    }
};

export const getStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = req.admin?.id;

    try {
        const stores = await Store.findAll({
            where: { vendorId: adminId },
            include: [
                {
                    model: Currency,
                    as: "currency",
                },
                {
                    model: Product,
                    as: "products",
                    attributes: [], // Don't include individual product details
                },
                {
                    model: AuctionProduct,
                    as: "auctionproducts",
                    attributes: [], // Don't include individual product details
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        Sequelize.literal(`(
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
    } catch (error) {
        logger.error("Error retrieving stores:", error);
        res.status(500).json({ message: "Failed to retrieve stores", error });
    }
};

export const createStore = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;

    const { currencyId, name, location, logo, businessHours, deliveryOptions, tipsOnFinding } =
        req.body;

    if (!currencyId) {
        res.status(400).json({ message: 'Currency ID is required.' });
        return;
    }

    try {
        // Check if a store with the same name exists for this vendorId
        const existingStore = await Store.findOne({
            where: { vendorId: adminId, name },
        });

        if (existingStore) {
            res.status(400).json({
                message: "A store with this name already exists for the vendor.",
            });
            return;
        }

        // Find the currency by ID
        const currency = await Currency.findByPk(currencyId);

        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
            return;
        }

        // Create the store
        const store = await Store.create({
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to create store", error });
    }
};

export const updateStore = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;

    const {
        storeId,
        currencyId,
        name,
        location,
        businessHours,
        deliveryOptions,
        tipsOnFinding,
        logo
    } = req.body;

    try {
        const store = await Store.findOne({ where: { id: storeId } });

        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }

        // Find the currency by ID
        const currency = await Currency.findByPk(currencyId);

        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
            return;
        }

        // Check for unique name for this vendorId if name is being updated
        if (name && store.name !== name) {
            const existingStore = await Store.findOne({
                where: { vendorId: adminId, name, id: { [Op.ne]: storeId } },
            });
            if (existingStore) {
                res.status(400).json({
                    message: "A store with this name already exists for the vendor.",
                });
                return;
            }
        }

        // Update store fields
        await store.update({
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to update store", error });
    }
};

export const deleteStore = async (
    req: Request,
    res: Response
): Promise<void> => {
    const storeId = req.query.storeId as string;

    const transaction = await sequelizeService.connection!.transaction();

    try {
        const store = await Store.findOne({ where: { id: storeId }, transaction });

        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }

        await AuctionProduct.destroy({ where: { storeId }, transaction });
        await Product.destroy({ where: { storeId }, transaction });
        await store.destroy({ transaction });

        await transaction.commit();

        res.status(200).json({ message: "Store and all associations deleted successfully" });
    } catch (error) {
        await transaction.rollback();

        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete store because it has associated records. Ensure all dependencies are handled before deleting the store.",
            });
        } else {
            logger.error(error);
            res.status(500).json({ message: "Failed to delete store", error });
        }
    }
};

// Product
export const createProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;

    const { storeId, categoryId, name, ...otherData } = req.body;

    try {
        // Check for duplicates
        const existingProduct = await Product.findOne({
            where: { vendorId: adminId, name },
        });

        if (existingProduct) {
            res.status(400).json({
                message: "Product with this vendorId and name already exists.",
            });
            return;
        }

        // Check if vendorId, storeId, and categoryId exist
        const vendorExists = await Admin.findByPk(adminId);
        const storeExists = await Store.findByPk(storeId);
        const categoryExists = await SubCategory.findByPk(categoryId);

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
            sku = `KDM-${uuidv4()}`; // Generate a unique SKU
            const skuExists = await Product.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }

        // Create the product
        const product = await Product.create({
            vendorId: adminId,
            storeId,
            categoryId,
            name,
            sku, // Use the generated SKU
            ...otherData,
        });

        res
            .status(200)
            .json({ message: "Product created successfully", data: product });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to create product" });
    }
};

export const updateProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { productId, ...updateData } = req.body;
    const adminId = req.admin?.id;

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }

        await product.update(updateData);

        res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to update product" });
    }
};

export const deleteProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { productId } = req.query;
    const adminId = req.admin?.id;

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }

        await product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

export const fetchProducts = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;
    
    const { name, sku, status, condition, categoryName } = req.query;

    try {
        const products = await Product.findAll({
            where: { vendorId: adminId },
            include: [
                {
                    model: SubCategory,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: Store,
                    as: "store",
                    attributes: ['name'],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
            ],
            ...((name || sku || status || condition) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                    ...(sku && { sku }),
                    ...(status && { status }),
                    ...(condition && { condition }),
                },
            }),
        });

        res.status(200).json({
            data: products,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

export const viewProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    // Get productId from route params instead of query
    const { productId } = req.query;
    const adminId = req.admin?.id;

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
                vendorId: adminId,
            },
            include: [
                {
                    model: Store,
                    as: "store",
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

export const moveToDraft = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { productId } = req.query; // Get productId from request query
    const adminId = req.admin?.id;

    try {
        // Validate productId type
        if (typeof productId !== "string") {
            res.status(400).json({ message: "Invalid productId." });
            return;
        }

        // Find the product by either ID or SKU, ensuring it belongs to the authenticated vendor
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
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
        await product.save();

        // Respond with the updated product
        res.status(200).json({
            message: "Product moved to draft.",
            data: product,
        });
    } catch (error) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to move product to draft." });
    }
};

export const changeProductStatus = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { productId, status } = req.body; // Get productId and status from request body
    const adminId = req.admin?.id;

    // Validate status
    if (!["active", "inactive", "draft"].includes(status)) {
        res.status(400).json({ message: "Invalid status." });
        return;
    }

    try {
        // Find the product by ID or SKU
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
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
        await product.save();

        // Respond with the updated product details
        res.status(200).json({
            message: "Product status updated successfully.",
        });
    } catch (error) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to update product status." });
    }
};

// Auction Product
export const createAuctionProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;

    const {
        storeId,
        categoryId,
        name,
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
    } = req.body;

    try {
        // Check if adminId, storeId, and categoryId exist
        const vendorExists = await Admin.findByPk(adminId);
        const storeExists = await Store.findByPk(storeId);
        const categoryExists = await SubCategory.findByPk(categoryId);

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
            sku = `KDM-${uuidv4()}`; // Generate a unique SKU
            const skuExists = await Product.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }

        // Create the auction product
        const auctionProduct = await AuctionProduct.create({
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
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while creating the auction product.",
        });
    }
};

export const updateAuctionProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;

    const {
        auctionProductId,
        storeId,
        categoryId,
        name,
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
    } = req.body;

    try {

        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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
        const bidExists = await Bid.findOne({ where: { auctionProductId } });
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
        const vendorExists = await Admin.findByPk(adminId);
        const storeExists = await Store.findByPk(storeId);
        const categoryExists = await SubCategory.findByPk(categoryId);

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
        await auctionProduct.save();

        res.status(200).json({
            message: "Auction product updated successfully.",
            auctionProduct,
        });
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while updating the auction product.",
        });
    }
};

export const deleteAuctionProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { auctionProductId } = req.query;
    const adminId = req.admin?.id;

    try {
        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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

        const bidCount = await Bid.count({
            where: { auctionProductId },
        });

        if (bidCount > 0) {
            res.status(400).json({
                message: "Auction product already has bids, cannot be deleted.",
            });
            return;
        }

        // Delete the auction product
        await auctionProduct.destroy();

        res.status(200).json({ message: "Auction product deleted successfully." });
    } catch (error: any) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        } else {
            logger.error(error);
            res.status(500).json({
                message:
                    error.message ||
                    "An error occurred while deleting the auction product.",
            });
        }
    }
};

export const cancelAuctionProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const { auctionProductId } = req.query;
    const adminId = req.admin?.id;

    try {
        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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
        await auctionProduct.save();

        res.status(200).json({
            message: "Auction product has been cancelled successfully.",
        });
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while cancelling the auction product.",
        });
    }
};

export const fetchVendorAuctionProducts = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;
    const { name, sku, status, condition, categoryName } = req.query;

    try {
        // Fetch all auction products for the vendor
        const auctionProducts = await AuctionProduct.findAll({
            where: {
                vendorId: adminId,
            },
            include: [
                {
                    model: SubCategory,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
                },
                {
                    model: Store,
                    as: "store",
                    attributes: ['name'],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
            ],
            ...((name || sku || status || condition) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                    ...(sku && { sku }),
                    ...(status && { status }),
                    ...(condition && { condition }),
                },
            }),
        });

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
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message || "An error occurred while fetching auction products.",
        });
    }
};

export const viewAuctionProduct = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    // Get auctionProductId from route params instead of query
    const { auctionProductId } = req.query;
    const adminId = req.admin?.id;

    try {
        const product = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId: adminId,
            },
            include: [
                {
                    model: Store,
                    as: "store",
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

export const getTransactionsForAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { transactionType, refId, status, userName, page, limit } = req.query;

    try {
        // Get pagination parameters
        const pageNumber = parseInt(page as string, 10) || 1; // Default to page 1 if not provided
        const limitNumber = parseInt(limit as string, 10) || 10; // Default to 10 items per page
        const offset = (pageNumber - 1) * limitNumber;

        // Fetch transactions with filters, pagination, and associated data
        const { rows: transactions, count: totalTransactions } = await Transaction.findAndCountAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                    ...(userName && {
                        where: {
                            [Op.or]: [
                                { firstName: { [Op.like]: `%${userName}%` } },
                                { lastName: { [Op.like]: `%${userName}%` } },
                                { email: { [Op.like]: `%${userName}%` } },
                            ],
                        },
                    }),
                },
            ],
            where: {
                ...(transactionType && { transactionType: { [Op.like]: `%${transactionType}%` } }),
                ...(refId && { refId: { [Op.like]: `%${refId}%` } }),
                ...(status && { status }),
            },
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
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
    }
};
