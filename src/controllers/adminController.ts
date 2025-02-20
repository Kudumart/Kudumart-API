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
import Advert from "../models/advert";
import Notification from "../models/notification";
import Cart from "../models/cart";
import Testimonial from "../models/testimonial";
import FaqCategory from "../models/faqcategory";
import Faq from "../models/faq";
import Contact from "../models/contact"; // Adjust the path as needed
import SaveProduct from "../models/saveproduct";
import ReviewProduct from "../models/reviewproduct";
import Job from "../models/job";
import Applicant from "../models/applicant";
import path from "path";
import fs from "fs";
import Withdrawal from "../models/withdrawal";
import Banner from "../models/banner";

// Extend the Express Request interface to include adminId and admin
interface AuthenticatedRequest extends Request {
    adminId?: string;
    admin?: Admin; // This is the instance type of the Admin model
}

// Define the upload directory
const uploadDir = path.join(__dirname, "../../uploads");

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
    const adminId = req.admin?.id;

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
        const admin = await Admin.scope("auth").findByPk(adminId);
        if (!admin) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }

        // Check if the old password is correct
        const isMatch = await admin.checkPassword(oldPassword);
        if (!isMatch) {
            res.status(400).json({ message: "Old password is incorrect." });
            return;
        }

        // Update the password in the database
        admin.password = newPassword;
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
            // Continue with password update even if email fails
        }

        res.status(200).json({
            message: "Password updated successfully.",
        });
    } catch (error) {
        logger.error("Error updating password:", error);

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

        const relatedTables = [
            { name: "stores", model: Store, field: "vendorId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await table.model.count({ where: { [table.field]: subAdmin.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete sub-admin because related records exist in ${table.name}` });
                return;
            }
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
        plan.adsDurationDays = adsDurationDays;
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

        const relatedTables = [
            { name: "vendor_subscriptions", model: VendorSubscription, field: "subscriptionPlanId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await table.model.count({ where: { [table.field]: plan.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete subscription plan because related records exist in ${table.name}` });
                return;
            }
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

        const relatedTables = [
            { name: "sub_categories", model: SubCategory, field: "categoryId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await table.model.count({ where: { [table.field]: category.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete category because related records exist in ${table.name}` });
                return;
            }
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

        const relatedTables: { name: string; model: typeof Product | typeof AuctionProduct; field: string }[] = [
            { name: "products", model: Product, field: "categoryId" },
            { name: "auction_products", model: AuctionProduct, field: "categoryId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof Product).count({
                where: { [table.field]: subCategory.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
                return;
            }
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

    // Allow only Paystack and Stripe
    const allowedGateways = ["paystack", "stripe"];
    if (!allowedGateways.includes(name.toLowerCase())) {
        res.status(400).json({
            message: "Invalid payment gateway. Only 'Paystack' and 'Stripe' are allowed.",
        });
        return;
    }

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

        // Deactivate only other active gateways with the same name
        await PaymentGateway.update(
            { isActive: false },
            { where: { isActive: true, name: paymentGateway.name } }
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
    const allowedSymbols = ["$", "#", "₦"];
  
    if (!name || typeof name !== "string") {
      res.status(400).json({ message: "Name is required and must be a string." });
      return;
    }
    if (!symbol || typeof symbol !== "string") {
      res.status(400).json({ message: "Symbol is required and must be a string." });
      return;
    }
  
    // Validate if symbol is in allowed list
    if (!allowedSymbols.includes(symbol)) {
      res.status(400).json({ message: `Currency symbol must be one of: ${allowedSymbols.join(", ")}` });
      return;
    }
  
    try {
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
        res.status(400).json({ message: "Currency with the same name or symbol already exists." });
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

        const relatedTables = [
            { name: "store", model: Store, field: "currencyId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await table.model.count({ where: { [table.field]: currency.id } });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete currency because related records exist in ${table.name}` });
                return;
            }
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

        const relatedTables: { name: string; model: typeof SaveProduct | typeof ReviewProduct | typeof Cart; field: string }[] = [
            { name: "save_products", model: SaveProduct, field: "productId" },
            { name: "review_products", model: ReviewProduct, field: "productId" },
            { name: "carts", model: Cart, field: "productId" }
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof SaveProduct).count({
                where: { [table.field]: product.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
                return;
            }
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

export const unpublishProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = req.query.productId as string;

    try {
        // Find the product by ID
        const product = await Product.findByPk(productId, { include: [{ model: User, as: "vendor" }] });
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
        await product.save();

        // Remove the product from all carts
        await Cart.destroy({ where: { productId } });

        // Notify the vendor
        const notificationTitle = "Product Unpublished";
        const notificationMessage = `Your product "${product.name}" has been unpublished by an admin. Please review your listing.`;
        const notificationType = "product_unpublished";

        await Notification.create({
            userId: product.vendorId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
        });

        res.status(200).json({ message: "Product unpublished successfully" });

    } catch (error: any) {
        logger.error("Error unpublishing product:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const publishProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = req.query.productId as string;

    try {
        // Find the product by ID
        const product = await Product.findByPk(productId, { include: [{ model: User, as: "vendor" }] });

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
        await product.save();

        // Notify the vendor
        const notificationTitle = "Product Published";
        const notificationMessage = `Your product "${product.name}" has been published and is now visible to customers.`;
        const notificationType = "product_published";

        await Notification.create({
            userId: product.vendorId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
        });

        res.status(200).json({ message: "Product published successfully" });

    } catch (error: any) {
        logger.error("Error publishing product:", error);
        res.status(500).json({ message: "Server error" });
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

        const relatedTables: { name: string; model: typeof Bid; field: string }[] = [
            { name: "bids", model: Bid, field: "auctionProductId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof Bid).count({
                where: { [table.field]: auctionProduct.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete auction product because related records exist in ${table.name}` });
                return;
            }
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

        const relatedTables: { name: string; model: typeof AuctionProduct | typeof Product; field: string }[] = [
            { name: "auction_products", model: AuctionProduct, field: "storeId" },
            { name: "products", model: Product, field: "storeId" }
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof AuctionProduct).count({
                where: { [table.field]: store.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete store because related records exist in ${table.name}` });
                return;
            }
        }

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

        const relatedTables: { name: string; model: typeof SaveProduct | typeof ReviewProduct | typeof Cart; field: string }[] = [
            { name: "save_products", model: SaveProduct, field: "productId" },
            { name: "review_products", model: ReviewProduct, field: "productId" },
            { name: "carts", model: Cart, field: "productId" }
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof SaveProduct).count({
                where: { [table.field]: product.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
                return;
            }
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

        // Remove the product from all carts
        await Cart.destroy({ where: { productId } });

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

        const relatedTables: { name: string; model: typeof Bid; field: string }[] = [
            { name: "bids", model: Bid, field: "auctionProductId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof Bid).count({
                where: { [table.field]: auctionProduct.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete auction product because related records exist in ${table.name}` });
                return;
            }
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

export const fetchAuctionProducts = async (
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
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
    }
};

// Adverts
export const activeProducts = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const adminId = req.admin?.id;
    const { name } = req.query;

    try {
        const products = await Product.findAll({
            where: { vendorId: adminId, status: "active" },
            ...((name) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                },
            }),
        });

        res.status(200).json({
            data: products,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch active products" });
    }
};

export const createAdvert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = req.admin?.id;
    const { categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;

    try {
        // Check if categoryId and productId exist
        const categoryExists = await SubCategory.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }

        if (productId) {
            const productExists = await Product.findByPk(productId);

            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
                return;
            }
        }

        const newAdvert = await Advert.create({
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
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({ message: "Failed to create advert" });
    }
};

export const updateAdvert = async (req: Request, res: Response): Promise<void> => {
    const { advertId, categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;

    try {
        // Check if categoryId and productId exist
        const categoryExists = await SubCategory.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }

        if (productId) {
            const productExists = await Product.findByPk(productId);

            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
                return;
            }
        }

        const advert = await Advert.findByPk(advertId);

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

        await advert.save();

        res.status(200).json({
            message: "Advert updated successfully",
            data: advert,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to update advert" });
    }
};

export const getAdverts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { search, page = 1, limit = 10 } = req.query;
    const adminId = req.admin?.id;

    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    try {
        // Build the where condition for the search query (using Op.or for title and status)
        const whereConditions: any = { userId: adminId };

        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ];
        }

        // Fetch adverts with pagination, filters, and associated data
        const { count, rows: adverts } = await Advert.findAndCountAll({
            where: whereConditions,
            include: [
                { model: Product, as: "product", attributes: ['id', 'name'] },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewAdvert = async (req: Request, res: Response): Promise<void> => {
    const advertId = req.query.advertId as string;

    try {
        const advert = await Advert.findByPk(advertId, {
            include: [
                { model: Product, as: "product" },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch advert" });
    }
};

export const deleteAdvert = async (req: Request, res: Response): Promise<void> => {
    const advertId = req.query.advertId as string;

    try {
        const advert = await Advert.findByPk(advertId);

        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }

        await advert.destroy();

        res.status(200).json({
            message: "Advert deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to delete advert" });
    }
};

export const getGeneralAdverts = async (req: Request, res: Response): Promise<void> => {
    const { search, page = 1, limit = 10 } = req.query;

    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    try {
        // Build the where condition for the search query (using Op.or for title and status)
        const whereConditions: any = {};

        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
                { showOnHomepage: { [Op.like]: `%${search}%` } }
            ];
        }

        // Fetch adverts with pagination, filters, and associated data
        const { count, rows: adverts } = await Advert.findAndCountAll({
            where: whereConditions,
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
                { model: Product, as: "product", attributes: ['id', 'name'] },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewGeneralAdvert = async (req: Request, res: Response): Promise<void> => {
    const advertId = req.query.advertId as string;

    try {
        const advert = await Advert.findByPk(advertId, {
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
                { model: Product, as: "product" },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch advert" });
    }
};

export const approveOrRejectAdvert = async (req: Request, res: Response): Promise<void> => {
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
        const advert = await Advert.findByPk(advertId);
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
        await advert.save();

        // Send notification
        await Notification.create({
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
    } catch (error) {
        logger.error("Error updating advert status:", error);
        res.status(500).json({ message: "Failed to update advert status." });
    }
};


// Orders
export const getOrderItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = req.admin?.id;

    try {
        // Fetch OrderItems related to the vendor
        const orderItems = await OrderItem.findAll({
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
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to retrieve order items." });
    }
};

export const getOrderItemsInfo = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.query.orderId as string;

    try {
        // Fetch Order related to the vendor
        const order = await Order.findOne({
            where: { id: orderId },
            include: [
                {
                    model: User,
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
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to retrieve order details." });
    }
};

// Create a testimonial
export const createTestimonial = async (req: Request, res: Response): Promise<void> => {
    const { name, position, photo, message } = req.body;

    try {
        if (!name || !message) {
            res.status(400).json({ message: "Name and message are required" });
            return;
        }

        const newTestimonial = await Testimonial.create({ name, position, photo, message });

        res.status(200).json({
            message: "Testimonial created successfully",
            data: newTestimonial,
        });

    } catch (error: any) {
        logger.error(`Error creating testimonial: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the testimonial. Please try again later." });
    }
};

// Update a testimonial
export const updateTestimonial = async (req: Request, res: Response): Promise<void> => {
    const { id, name, position, photo, message } = req.body;

    try {
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            res.status(404).json({ message: "Testimonial not found" });
            return;
        }

        await testimonial.update({ name, position, photo, message });

        res.status(200).json({ message: "Testimonial updated successfully", data: testimonial });

    } catch (error: any) {
        logger.error(`Error updating testimonial ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the testimonial. Please try again later." });
    }
};

// Get all testimonials
export const getAllTestimonials = async (req: Request, res: Response): Promise<void> => {
    try {
        const testimonials = await Testimonial.findAll();
        res.status(200).json({ data: testimonials });

    } catch (error: any) {
        logger.error(`Error retrieving testimonials: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving testimonials. Please try again later." });
    }
};

// Get a single testimonial
export const getTestimonial = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            res.status(404).json({ message: "Testimonial not found" });
            return;
        }

        res.status(200).json({ data: testimonial });

    } catch (error: any) {
        logger.error(`Error fetching testimonial ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching the testimonial. Please try again later." });
    }
};

// Delete a testimonial
export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const testimonial = await Testimonial.findByPk(id);

        if (!testimonial) {
            res.status(404).json({ message: "Testimonial not found" });
            return;
        }

        await testimonial.destroy();
        res.status(200).json({ message: "Testimonial deleted successfully" });

    } catch (error: any) {
        logger.error(`Error deleting testimonial ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while deleting the testimonial. Please try again later." });
    }
};

// Create FAQ Category
export const createFaqCategory = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;

    try {
        if (!name) {
            res.status(400).json({ message: "Category name is required" });
            return;
        }

        const newCategory = await FaqCategory.create({ name });

        res.status(200).json({ message: "FAQ category created successfully", data: newCategory });

    } catch (error: any) {
        logger.error(`Error creating FAQ category: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the FAQ category." });
    }
};

// Get all FAQ Categories with FAQ count
export const getAllFaqCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await FaqCategory.findAll({
            include: [
                {
                    model: Faq,
                    as: "faqs",
                    attributes: [],
                },
            ],
            attributes: [
                "id",
                "name",
                [Sequelize.fn("COUNT", Sequelize.col("faqs.id")), "faqCount"],
            ],
            group: ["FaqCategory.id"],
        });

        res.status(200).json({ data: categories });

    } catch (error: any) {
        logger.error(`Error retrieving FAQ categories: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving FAQ categories." });
    }
};

// Get a single FAQ Category with its FAQs
export const getFaqCategory = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const category = await FaqCategory.findByPk(id, {
            include: [
                {
                    model: Faq,
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

    } catch (error: any) {
        logger.error(`Error fetching FAQ category ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching the FAQ category." });
    }
};

// Update FAQ Category
export const updateFaqCategory = async (req: Request, res: Response): Promise<void> => {
    const { id, name } = req.body;

    try {
        const category = await FaqCategory.findByPk(id);

        if (!category) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }

        await category.update({ name });

        res.status(200).json({ message: "FAQ category updated successfully", data: category });

    } catch (error: any) {
        logger.error(`Error updating FAQ category ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the FAQ category." });
    }
};

// Delete FAQ Category
export const deleteFaqCategory = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const category = await FaqCategory.findByPk(id);

        if (!category) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }

        // Deletion
        await Faq.destroy({ where: { faqCategoryId: id }});
        await category.destroy();

        res.status(200).json({ message: "FAQ category deleted successfully" });

    } catch (error: any) {
        logger.error(`Error deleting FAQ category ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while deleting the FAQ category." });
    }
};

// Create an FAQ
export const createFaq = async (req: Request, res: Response): Promise<void> => {
    const { categoryId, question, answer } = req.body;

    try {
        if (!categoryId || !question || !answer) {
            res.status(400).json({ message: "Category ID, question, and answer are required" });
            return;
        }

        const categoryExists = await FaqCategory.findByPk(categoryId);
        if (!categoryExists) {
            res.status(404).json({ message: "FAQ category not found" });
            return;
        }

        const newFaq = await Faq.create({
            faqCategoryId:
                categoryId, question, answer
        });

        res.status(200).json({ message: "FAQ created successfully", data: newFaq });

    } catch (error: any) {
        logger.error(`Error creating FAQ: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the FAQ." });
    }
};

// Get all FAQs
export const getAllFaqs = async (_req: Request, res: Response): Promise<void> => {
    try {
        const faqs = await Faq.findAll({ include: [{ model: FaqCategory, as: "faqCategory" }] });
        res.status(200).json({ data: faqs });

    } catch (error: any) {
        logger.error(`Error retrieving FAQs: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving FAQs." });
    }
};

// Get a single FAQ
export const getFaq = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const faq = await Faq.findByPk(id, { include: [{ model: FaqCategory, as: "faqCategory" }] });

        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }

        res.status(200).json({ data: faq });

    } catch (error: any) {
        logger.error(`Error fetching FAQ ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching the FAQ." });
    }
};

// Update an FAQ
export const updateFaq = async (req: Request, res: Response): Promise<void> => {
    const { id, categoryId, question, answer } = req.body;

    try {
        const faq = await Faq.findByPk(id);

        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }

        await faq.update({
            faqCategoryId:
                categoryId, question, answer
        });

        res.status(200).json({ message: "FAQ updated successfully", data: faq });

    } catch (error: any) {
        logger.error(`Error updating FAQ ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the FAQ." });
    }
};

// Delete an FAQ
export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string ;

    try {
        const faq = await Faq.findByPk(id);

        if (!faq) {
            res.status(404).json({ message: "FAQ not found" });
            return;
        }

        await faq.destroy();

        res.status(200).json({ message: "FAQ deleted successfully" });

    } catch (error: any) {
        logger.error(`Error deleting FAQ ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while deleting the FAQ." });
    }
};

// Contact Us Form
export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
    const { search } = req.query; // Capture the search parameter from the query string

    try {
        // Construct the search query object
        const searchConditions: any = {};

        if (search) {
            const searchTerm = `%${search}%`; // Add wildcards for partial matching

            // Add conditions for each searchable field (name, phoneNumber, email, message)
            searchConditions[Op.or] = [
                { name: { [Op.like]: searchTerm } },
                { phoneNumber: { [Op.like]: searchTerm } },
                { email: { [Op.like]: searchTerm } },
                { message: { [Op.like]: searchTerm } },
            ];
        }

        // Fetch all contact entries from the database, applying the search conditions if provided
        const contacts = await Contact.findAll({
            where: searchConditions,
        });

        // If no contacts are found
        if (contacts.length === 0) {
            res.status(404).json({ message: "No contact entries found." });
            return;
        }

        // Return the contact entries
        res.status(200).json({ data: contacts });
    } catch (error: any) {
        logger.error("Error fetching contacts:", error);
        res.status(500).json({
            message: "An error occurred while fetching contact entries.",
        });
    }
};

export const getContactById = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string; // Assuming contact ID is passed as a URL parameter

    try {
        // Fetch the contact entry by ID
        const contact = await Contact.findByPk(id);

        // If the contact is not found
        if (!contact) {
            res.status(404).json({ message: "Contact entry not found." });
            return;
        }

        // Return the contact entry
        res.status(200).json({ data: contact });
    } catch (error: any) {
        logger.error("Error fetching contact:", error);
        res.status(500).json({
            message: "An error occurred while fetching the contact entry.",
        });
    }
};

export const deleteContactById = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string; // Assuming contact ID is passed as a URL parameter

    try {
        // Find and delete the contact entry by ID
        const contact = await Contact.findByPk(id);

        // If the contact is not found
        if (!contact) {
            res.status(404).json({ message: "Contact entry not found." });
            return;
        }

        await contact.destroy();

        // Return success message
        res.status(200).json({ message: "Contact entry deleted successfully." });
    } catch (error: any) {
        logger.error("Error deleting contact:", error);
        res.status(500).json({
            message: "An error occurred while deleting the contact entry.",
        });
    }
};

// JOB
export const postJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            title,
            workplaceType,
            jobType,
            location,
            description,
        } = req.body;

        const adminId = req.admin?.id;

        // Create the job
        const newJob = await Job.create({
            creatorId: adminId,
            title,
            slug: `${title.toLowerCase().replace(/ /g, "-")}-${uuidv4()}`,
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
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: "An error occurred while posting the job.",
        });
    }
};

export const getJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, title } = req.query; // Expecting 'Draft', 'Active', or 'Closed' for status, and a string for title

        const jobs = await Job.findAll({
            where: {
                ...(status && { status: { [Op.eq]: status } }), // Optional filtering by status
                ...(title && { title: { [Op.like]: `%${title}%` } }), // Optional filtering by title (partial match)
            },
            attributes: {
                include: [
                    [
                        Sequelize.fn("COUNT", Sequelize.col("applicants.id")),
                        "applicantCount"
                    ],
                ],
            },
            include: [
                {
                    model: Applicant,
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
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: "An error occurred while retrieving jobs.",
        });
    }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const { jobId, title, workplaceType, jobType, location, description } = req.body;

        if (!jobId) {
            res.status(400).json({ message: "Job ID is required." });
            return;
        }

        // Find the job
        const job = await Job.findByPk(jobId);
        if (!job) {
            res.status(404).json({ message: "Job not found." });
            return;
        }

        // Update job with new values or keep the old ones
        await job.update({
            title: title ?? job.title,
            workplaceType: workplaceType ?? job.workplaceType,
            jobType: jobType ?? job.jobType,
            location: location ?? job.location,
            description: description ?? job.description,
        });

        res.status(200).json({
            message: "Job updated successfully.",
            data: job,
        });
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: "An error occurred while updating the job.",
        });
    }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = req.query.jobId as string;

        if (!jobId) {
            res.status(400).json({ message: "Job ID is required." });
            return;
        }

        // Find the job by ID
        const job = await Job.findByPk(jobId);

        if (!job) {
            res.status(404).json({ message: "Job not found." });
            return;
        }

        res.status(200).json({
            message: "Job retrieved successfully.",
            data: job,
        });
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: "An error occurred while retrieving the job.",
        });
    }
};

// CLOSE Job
export const closeJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = req.query.jobId as string;

        // Find the job
        const job = await Job.findByPk(jobId);

        if (!job) {
            res.status(404).json({
                message: "Job not found in our database.",
            });
            return;
        }

        // Update the job status to 'Closed'
        job.status = "closed";
        job.updatedAt = new Date();

        await job.save();

        res.status(200).json({
            message: "Job closed successfully.",
            data: job, // Replace with a JobResource equivalent if necessary
        });
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            message: "An error occurred while closing the job.",
        });
    }
};

// DELETE Job
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobId = req.query.jobId as string;

        // Find the job
        const job = await Job.findByPk(jobId);

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
        const transaction = await sequelizeService.connection!.transaction();

        try {
            // Delete all applicants related to this job
            await Applicant.destroy({ where: { jobId }, transaction });

            // Delete the job
            await job.destroy({ transaction });

            await transaction.commit(); // Commit changes

            res.status(200).json({
                message: "Job and related applicants deleted successfully.",
            });
        } catch (error) {
            await transaction.rollback(); // Revert changes if an error occurs
            throw error;
        }
    } catch (error: any) {
        logger.error("Error deleting job:", error);
        res.status(500).json({
            message: "An error occurred while deleting the job.",
        });
    }
};

export const getJobApplicants = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const jobId = req.query.jobId as string;

        const job = await Job.findOne({ where: { id: jobId } });

        if (!job) {
            res.status(403).json({
                message: "Job not found.",
            });
            return;
        }

        const applicants = await Applicant.findAll({
            where: { jobId }
        });

        res.status(200).json({
            message: "All applicants retrieved successfully.",
            data: applicants,
        });
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

export const viewApplicant = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const applicantId = req.query.applicantId as string;

        const applicant = await Applicant.findByPk(applicantId, {
            include: [
                {
                    model: Job,
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

        const job = await Job.findByPk(applicant.jobId);
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

export const repostJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { jobId } = req.body;

        const adminId = req.admin?.id;

        const job = await Job.findByPk(jobId);

        if (!job) {
            res.status(404).json({
                message: "Job not found in our database.",
            });
            return;
        }

        if (!job.title) {
            throw new Error("Job title cannot be null.");
        }

        const repost = await Job.create({
            creatorId: adminId,
            title: job.title,
            slug: `${job.title.toLowerCase().replace(/\s+/g, "-")}-${Math.floor(
                Math.random() * 10000
            )}`,
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

export const downloadApplicantResume = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const applicantId = req.query.applicantId as string;

        const applicant = await Applicant.findByPk(applicantId);

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

        const cleanFilename = path.basename(filename);
        const filePath = path.join(uploadDir, cleanFilename);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: "File not found" });
            return;
        }

        // Rename file when sending for download
        const newFilename = `${applicantName}_Resume.pdf`;

        res.download(filePath, newFilename, (err) => {
            if (err) {
                logger.error("Error downloading file:", err);
                res.status(500).json({ message: "Error downloading file" });
            }
        });
    } catch (error) {
        logger.error("Error in downloadFile:", error);
        res.status(500).json({ message: "An error occurred while downloading the file" });
    }
};

// Update withdrawal status (Admin action)
export const updateWithdrawalStatus = async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelizeService.connection!.transaction();

    try {
        const { id, status, paymentReceipt, note } = req.body; // Ensure 'note' is provided for rejection

        // Find withdrawal request
        const withdrawal = await Withdrawal.findByPk(id, { transaction });
        if (!withdrawal) {
            await transaction.rollback();
            res.status(404).json({ message: "Withdrawal not found" });
            return;
        }

        // Find the vendor
        const vendor = await User.findByPk(withdrawal.vendorId, { transaction });
        if (!vendor) {
            await transaction.rollback();
            res.status(404).json({ message: "Vendor not found" });
            return;
        }

        // If already approved, return a message with no further action
        if (withdrawal.status === "approved") {
            await transaction.commit();
            res.status(200).json({ message: "Withdrawal has already been approved. No further action is required." });
            return;
        }

        // If status is "rejected", ensure a note is provided
        if (status === "rejected" && !note) {
            await transaction.rollback();
            res.status(400).json({ message: "Rejection note is required" });
            return;
        }

        // If rejected, refund money to the appropriate wallet
        if (status === "rejected") {
            const refundAmount = Number(withdrawal.amount); // Ensure it's a number

            if (withdrawal.currency === "USD") {
                vendor.dollarWallet = (Number(vendor.dollarWallet ?? 0)) + refundAmount;
            } else {
                vendor.wallet = (Number(vendor.wallet ?? 0)) + refundAmount;
            }
            
            await vendor.save({ transaction });
        }
        // Update withdrawal status
        withdrawal.status = status;
        withdrawal.paymentReceipt = paymentReceipt || withdrawal.paymentReceipt; // Update if provided
        withdrawal.note = note || withdrawal.note; // Store rejection note
        await withdrawal.save({ transaction });

        // Notify Vendor
        await Notification.create(
            {
                userId: vendor.id,
                title: `Withdrawal ${status === "approved" ? "Approved" : "Rejected"}`,
                type: "withdrawal_status",
                message: status === "approved"
                    ? `Your withdrawal request of ${withdrawal.currency} ${withdrawal.amount} has been approved.`
                    : `Your withdrawal request of ${withdrawal.currency} ${withdrawal.amount} was rejected. Reason: ${note}.`,
            },
            { transaction }
        );

        await transaction.commit(); // Commit transaction
        res.status(200).json({ message: `Withdrawal ${status}`, withdrawal });
    } catch (error) {
        await transaction.rollback(); // Rollback on error
        logger.error("Error updating withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getWithdrawals = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query; // Optional filter by status
  
      const whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }
  
      const withdrawals = await Withdrawal.findAll({
        where: whereClause,
        include: [
            { model: User, as: "vendor", attributes: ['id', 'firstName', 'lastName', 'email'] }
        ],
        order: [["createdAt", "DESC"]], // Latest withdrawals first
      });
  
      res.status(200).json({ message: "Withdrawals fetched successfully", data: withdrawals });
    } catch (error) {
      logger.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

export const getWithdrawalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.query.id as string;

        // Find withdrawal with associated Vendor details
        const withdrawal = await Withdrawal.findOne({
            where: { id },  // Correct placement of the ID filter
            include: [
                {
                    model: User,
                    as: "vendor",
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        if (!withdrawal) {
            res.status(404).json({ message: "Withdrawal not found" });
            return;
        }

        res.status(200).json({ message: "Withdrawal retrieved successfully", data: withdrawal });
    } catch (error) {
        logger.error("Error retrieving withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create a Banner
export const createBanner = async (req: Request, res: Response): Promise<void> => {
    const { image } = req.body;

    try {
        if (!image) {
            res.status(400).json({ message: "Image is required" });
            return;
        }

        const newBanner = await Banner.create({ image });

        res.status(200).json({
            message: "Banner created successfully",
            data: newBanner,
        });

    } catch (error: any) {
        logger.error(`Error creating banner: ${error.message}`);
        res.status(500).json({ message: "An unexpected error occurred while creating the banner. Please try again later." });
    }
};

// Update a banner
export const updateBanner = async (req: Request, res: Response): Promise<void> => {
    const { id, image } = req.body;

    try {
        const banner = await Banner.findByPk(id);

        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }

        await banner.update({ image });

        res.status(200).json({ message: "Banner updated successfully", data: banner });

    } catch (error: any) {
        logger.error(`Error updating banner ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while updating the banner. Please try again later." });
    }
};

// Get all banners
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const banners = await Banner.findAll();
        res.status(200).json({ data: banners });

    } catch (error: any) {
        logger.error(`Error retrieving banners: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving banners. Please try again later." });
    }
};

// Get a single banner
export const getBanner = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const banner = await Banner.findByPk(id);

        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }

        res.status(200).json({ data: banner });

    } catch (error: any) {
        logger.error(`Error fetching banner ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching the banner. Please try again later." });
    }
};

// Delete a banner
export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
    const id = req.query.id as string;

    try {
        const banner = await Banner.findByPk(id);

        if (!banner) {
            res.status(404).json({ message: "Banner not found" });
            return;
        }

        await banner.destroy();
        res.status(200).json({ message: "Banner deleted successfully" });

    } catch (error: any) {
        logger.error(`Error deleting banner ID ${id}: ${error.message}`);
        res.status(500).json({ message: "An error occurred while deleting the banner. Please try again later." });
    }
};