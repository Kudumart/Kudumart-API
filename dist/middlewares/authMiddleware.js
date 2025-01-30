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
const jwt_service_1 = __importDefault(require("../services/jwt.service"));
const user_1 = __importDefault(require("../models/user"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (process.env.SERVER_JWT === "false") {
            return next();
        }
        const token = jwt_service_1.default.jwtGetToken(req);
        if (!token) {
            res.status(401).json({ message: "Token not provided" });
            return;
        }
        if (jwt_service_1.default.jwtIsTokenBlacklisted(token)) {
            res
                .status(403)
                .json({ message: "Token is blacklisted. Please log in again." });
            return;
        }
        const decoded = jwt_service_1.default.jwtVerify(token);
        req.userId = decoded.id;
        const user = yield user_1.default.findOne({
            where: { id: req.userId },
        });
        if (!user) {
            res.status(401).json({ message: "User not authorized" });
            return;
        }
        req.user = user;
        return next();
    }
    catch (error) {
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
});
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map