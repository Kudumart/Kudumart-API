// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import JwtService from "../services/jwt.service";
import User from "../models/user";
import { AuthenticatedRequest } from "../types/index";

interface DecodedToken {
  id: string; // ID from JWT payload
}

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (process.env.SERVER_JWT === "false") {
      return next();
    }

    const token = JwtService.jwtGetToken(req);

    if (!token) {
      res.status(401).json({ message: "Token not provided" });
      return;
    }

    if (JwtService.jwtIsTokenBlacklisted(token)) {
      res
        .status(401)
        .json({ message: "Token is blacklisted. Please log in again." });
      return;
    }

    const decoded = JwtService.jwtVerify(token) as DecodedToken;
    (req as AuthenticatedRequest).userId = decoded.id;

    const user = await User.findOne({
      where: { id: (req as AuthenticatedRequest).userId },
    });

    if (!user) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    return next();
  } catch (error: any) {
    console.error("Authentication error:", error.message);
    if (error.name === "TokenExpiredError") {
      res
        .status(401)
        .json({ message: "Token has expired. Please log in again." });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token. Please log in again." });
      return;
    }

    res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
