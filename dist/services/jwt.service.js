"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
let jwtidCounter = 0;
const blacklistSet = new Set();
const JwtService = {
    jwtSign: (_payload) => {
        try {
            if (process.env.SERVER_JWT !== "true") {
                throw new Error("[JWT] Fastify JWT flag is not set");
            }
            console.log("[JWT] Generating fastify JWT sign");
            const payload = {
                id: _payload,
            };
            jwtidCounter += 1;
            return jsonwebtoken_1.default.sign(payload, process.env.SERVER_JWT_SECRET, {
                expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
                jwtid: jwtidCounter.toString(),
            });
        }
        catch (error) {
            console.error("[JWT] Error during fastify JWT sign", error);
            throw error;
        }
    },
    generateRefreshToken: (payload) => {
        try {
            return jsonwebtoken_1.default.sign(payload, process.env.SERVER_JWT_SECRET, { expiresIn: '7d' });
        }
        catch (error) {
            console.error("[JWT] Error during refresh token generation", error);
            throw error;
        }
    },
    jwtGetToken: (request) => {
        try {
            if (process.env.SERVER_JWT !== "true") {
                throw new Error("[JWT] JWT flag is not set");
            }
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new Error("[JWT] JWT token not provided");
            }
            return authHeader.split(" ")[1]; // Return the token part
        }
        catch (error) {
            console.error("[JWT] Error getting JWT token", error);
            throw error;
        }
    },
    jwtVerify: (token) => {
        try {
            if (process.env.SERVER_JWT !== "true") {
                throw new Error("[JWT] JWT flag is not set");
            }
            return jsonwebtoken_1.default.verify(token, process.env.SERVER_JWT_SECRET);
        }
        catch (error) {
            console.error("[JWT] Error verifying JWT token", error);
            if (error.name === "TokenExpiredError") {
                throw new Error("Token has expired");
            }
            else if (error.name === "JsonWebTokenError") {
                throw new Error("Invalid token");
            }
            else {
                throw error;
            }
        }
    },
    jwtBlacklistToken: (token) => {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.jti) {
                console.error("[JWT] Token is invalid or does not have a 'jti' claim.");
                throw new Error("Token is invalid or does not have a 'jti' claim.");
            }
            console.log(`[JWT] Adding JWT with id ${decoded.jti} to blacklist`);
            blacklistSet.add(decoded.jti);
        }
        catch (error) {
            console.error("[JWT] Error blacklisting JWT token", error);
            throw error;
        }
    },
    jwtIsTokenBlacklisted: (token) => {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.jti) {
                return false;
            }
            return blacklistSet.has(decoded.jti);
        }
        catch (error) {
            console.error("[JWT] Error checking if token is blacklisted", error);
            return false;
        }
    },
    jwtIsTokenExpired: (token) => {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded) {
                return true; // Token is invalid, consider expired
            }
            const now = (0, moment_1.default)().unix();
            return decoded.exp ? decoded.exp < now : true; // Check expiration
        }
        catch (error) {
            console.error("[JWT] Error checking if token is expired", error);
            return true; // In case of error, consider expired
        }
    },
    extractUserIdFromToken: (req) => {
        const token = req.headers.authorization; // Assuming Bearer token in the "Authorization" header
        if (!token) {
            return null; // Token not provided
        }
        try {
            const tokenWithoutBearer = token.replace("Bearer ", ""); // Remove 'Bearer ' prefix
            const decoded = jsonwebtoken_1.default.verify(tokenWithoutBearer, process.env.SERVER_JWT_SECRET);
            return decoded.id || null;
        }
        catch (error) {
            return null; // Invalid or expired token
        }
    },
};
exports.default = JwtService;
//# sourceMappingURL=jwt.service.js.map