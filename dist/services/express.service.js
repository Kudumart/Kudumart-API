"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/express.service.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorMiddleware_1 = __importDefault(require("../middlewares/errorMiddleware"));
const authRoute_1 = __importDefault(require("../routes/authRoute"));
const userRoute_1 = __importDefault(require("../routes/userRoute"));
const adminRoute_1 = __importDefault(require("../routes/adminRoute"));
const vendorRoute_1 = __importDefault(require("../routes/vendorRoute"));
const uploadRoute_1 = __importDefault(require("../routes/uploadRoute"));
const logger_1 = __importDefault(require("../middlewares/logger"));
const Sentry = __importStar(require("@sentry/node"));
const ApiError_1 = require("../utils/ApiError");
dotenv_1.default.config();
const createExpressApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    }));
    // Serve static files from the public directory
    app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
    // Built-in JSON and URL-encoded middleware
    app.use(express_1.default.json({ limit: "50mb" }));
    app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
    // Compression, cookie parsing, and body parsing middleware
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use(body_parser_1.default.json());
    // Serve uploaded images
    app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../../uploads")));
    // Healthcheck
    app.get("/api/healthcheck", (_req, res) => {
        res.status(200).json({ message: "Kudumart server up and running" });
    });
    // Use your routes
    app.use("/api", authRoute_1.default);
    app.use("/api/user", userRoute_1.default);
    app.use("/api/vendor", vendorRoute_1.default);
    app.use("/api/admin", adminRoute_1.default);
    app.use("/api/upload", uploadRoute_1.default);
    // Initialize Sentry for error tracking
    // This should be done before any middleware
    // and after every controller
    Sentry.setupExpressErrorHandler(app, {
        shouldHandleError(error) {
            // capture all errors except ApiError
            return !(0, ApiError_1.IsApiError)(error);
        },
    });
    // 404 handler (this should come after routes)
    app.use((req, res) => {
        logger_1.default.error(`404 error for path: ${req.path}`);
        res.status(404).json({ message: "Route Not Found" });
    });
    // Global error handler
    app.use(errorMiddleware_1.default);
    return app;
};
exports.default = createExpressApp;
//# sourceMappingURL=express.service.js.map