import { Request, Response, NextFunction } from "express";
import JwtService from "../services/jwt.service";
import Admin from "../models/admin"; // Assuming this is your Sequelize model

// Extend the Express Request interface to include adminId and admin
interface AuthenticatedRequest extends Request {
  adminId?: string;
  admin?: Admin; // This is the instance type of the Admin model
}

interface DecodedToken {
  id: string; // Assuming `id` is the admin's ID in the JWT payload
}

const adminAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // If the server JWT handling is disabled, skip the middleware
    if (process.env.SERVER_JWT === "false") {
      return next();
    }

    // Extract the JWT token from the request headers
    const token = JwtService.jwtGetToken(req);

    if (!token) {
      res.status(401).json({ message: "Token not provided" });
      return;
    }

    // Check if the token is blacklisted
    if (JwtService.jwtIsTokenBlacklisted(token)) {
      res.status(401).json({ message: "Token is blacklisted. Please log in again." });
      return;
    }

    // Verify the token and decode the payload
    const decoded = JwtService.jwtVerify(token) as DecodedToken; // Type assertion to `DecodedToken`
    req.adminId = decoded.id; // Assuming `id` is the admin ID in the token payload

    // Find the admin by ID
    const admin = await Admin.findOne({
      where: { id: req.adminId },
    });

    if (!admin) {
      res.status(401).json({ message: "Admin not authorized" });
      return;
    }

    // Attach the admin instance to the request object
    req.admin = admin;
    return next(); // Proceed to the next middleware or route handler
  } catch (error: any) {
    console.error("Authentication error:", error.message);

    // Handle specific JWT-related errors
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token has expired. Please log in again." });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token. Please log in again." });
      return;
    }

    // Handle all other unexpected errors
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default adminAuthMiddleware;
