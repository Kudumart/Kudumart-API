import { Request, Response, NextFunction } from "express";
import Admin from "../models/admin"; // Import your Admin model
import Role from "../models/role"; // Import your Role model
import RolePermission from "../models/rolepermission"; // Import your RolePermission model
import Permission from "../models/permission";

// Extend the Express Request interface to include adminId and admin
interface AuthenticatedRequest extends Request {
  adminId?: string;
  admin?: Admin; // This is the instance type of the Admin model
}

// Middleware to check if admin has the required permission
const checkPermission = (requiredPermission: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Fetch the admin instance based on the adminId from the request
      const admin = await Admin.findByPk(req.adminId, {
        include: [{ model: Role, as: "role" }], // Include the role relationship
      });

      // Check if the admin exists
      if (!admin) {
        res.status(404).json({ message: "Sub Admin not found" });
        return;
      }

      // Fetch the permissions associated with the admin's role from the role_permissions table
      const rolePermissions = await RolePermission.findAll({
        where: { roleId: admin.roleId }, // Assuming roleId is stored in the admin model
        include: [{ model: Permission, as: "permission" }], // Include permission details
      });

      // Check if the admin has the required permission
      const hasPermission = rolePermissions.some(
        (rolePermission: any) =>
          rolePermission.permission.name === requiredPermission
      );

      if (hasPermission) {
        next(); // Allow the request to proceed
      } else {
        res.status(403).json({ message: "Permission denied" }); // Forbidden access
        return;
      }
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

export default checkPermission;
