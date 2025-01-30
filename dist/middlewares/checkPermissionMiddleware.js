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
const admin_1 = __importDefault(require("../models/admin")); // Import your Admin model
const role_1 = __importDefault(require("../models/role")); // Import your Role model
const rolepermission_1 = __importDefault(require("../models/rolepermission")); // Import your RolePermission model
const permission_1 = __importDefault(require("../models/permission"));
// Middleware to check if admin has the required permission
const checkPermission = (requiredPermission) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Fetch the admin instance based on the adminId from the request
            const admin = yield admin_1.default.findByPk(req.adminId, {
                include: [{ model: role_1.default, as: "role" }], // Include the role relationship
            });
            // Check if the admin exists
            if (!admin) {
                res.status(404).json({ message: "Sub Admin not found" });
                return;
            }
            // Fetch the permissions associated with the admin's role from the role_permissions table
            const rolePermissions = yield rolepermission_1.default.findAll({
                where: { roleId: admin.roleId }, // Assuming roleId is stored in the admin model
                include: [{ model: permission_1.default, as: "permission" }], // Include permission details
            });
            // Check if the admin has the required permission
            const hasPermission = rolePermissions.some((rolePermission) => rolePermission.permission.name === requiredPermission);
            if (hasPermission) {
                next(); // Allow the request to proceed
            }
            else {
                res.status(403).json({ message: "Permission denied" }); // Forbidden access
                return;
            }
        }
        catch (error) {
            console.error("Error checking permission:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
};
exports.default = checkPermission;
//# sourceMappingURL=checkPermissionMiddleware.js.map