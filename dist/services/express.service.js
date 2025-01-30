"use strict";
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
const logger_1 = __importDefault(require("../middlewares/logger"));
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
    app.use(express_1.default.json({ limit: '50mb' }));
    app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
    // Compression, cookie parsing, and body parsing middleware
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use(body_parser_1.default.json());
    // Use your routes
    app.use("/api", authRoute_1.default);
    app.use("/api/user", userRoute_1.default);
    app.use("/api/vendor", vendorRoute_1.default);
    app.use("/api/admin", adminRoute_1.default);
    // 404 handler (this should come after routes)
    app.use((req, res) => {
        logger_1.default.error(`404 error for path: ${req.path}`);
        res.status(404).json({ message: 'Route Not Found' });
    });
    // Global error handler
    app.use(errorMiddleware_1.default);
    return app;
};
exports.default = createExpressApp;
//# sourceMappingURL=express.service.js.map