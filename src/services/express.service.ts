// src/services/express.service.ts
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import globalErrorHandler from '../middlewares/errorMiddleware';
import apiRouter from '../routes/authRoute';
import userRouter from '../routes/userRoute';
import adminRouter from '../routes/adminRoute';
import vendorRouter from '../routes/vendorRoute';
import uploadRouter from '../routes/uploadRoute';
import logger from '../middlewares/logger';

dotenv.config();

const createExpressApp = () => {
    const app = express();

    app.use(cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    }));

    // **Force HTTPS Middleware**
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect("https://" + req.headers.host + req.url);
        }
        next();
    });

    // Serve static files from the public directory
    app.use(express.static(path.join(__dirname, "../public")));

    // Built-in JSON and URL-encoded middleware
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Compression, cookie parsing, and body parsing middleware
    app.use(compression());
    app.use(cookieParser());
    app.use(bodyParser.json());

    // Serve uploaded images
    app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

    // Use your routes
    app.use("/api", apiRouter);
    app.use("/api/user", userRouter);
    app.use("/api/vendor", vendorRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/upload", uploadRouter);

    // 404 handler (this should come after routes)
    app.use((req, res) => {
        logger.error(`404 error for path: ${req.path}`);
        res.status(404).json({ message: 'Route Not Found' });
    });

    // Global error handler
    app.use(globalErrorHandler);

    return app;
};

export default createExpressApp;
