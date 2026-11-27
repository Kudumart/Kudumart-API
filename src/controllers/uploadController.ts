// src/controllers/uploadController.ts
import { Request, Response } from "express";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import multer from "multer";
import logger from "../middlewares/logger";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration (store file in memory)
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: Request, file, cb) => {
        const allowedImageTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/svg+xml",
        ];
        const allowedPdfType = "application/pdf";
        const allowedVideoTypes = [
            "video/mp4",
            "video/mkv",
            "video/x-matroska",
            "video/avi",
            "video/x-msvideo",
            "video/webm",
            "video/mov",
            "video/quicktime",
            "video/flv",
        ];

        if (
            allowedImageTypes.includes(file.mimetype) ||
            file.mimetype === allowedPdfType ||
            allowedVideoTypes.includes(file.mimetype)
        ) {
            cb(null, true); // ✅ Allow upload
        } else {
            cb(null, false); // ❌ Reject file
            (req as any).fileValidationError =
                "Only images (JPG, PNG, WEBP, GIF, BMP, TIFF, SVG), PDFs, and videos (MP4, MKV, AVI, WEBM, MOV, FLV) are allowed.";
        }
    },
});

// Upload and process file (PDF, image and video)
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
        // If the validation fails
        if ((req as any).fileValidationError) {
            res.status(400).json({ message: (req as any).fileValidationError });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }

        let filename = `${process.env.APP_NAME?.toLowerCase()}-${Date.now()}`;
        let filePath: string;

        // Handle PDF file
        if (req.file.mimetype === "application/pdf") {
            filename += ".pdf";
            filePath = path.join(uploadDir, filename);
            await fs.promises.writeFile(filePath, req.file.buffer);
        } 
        // Handle image file (convert to WebP)
        else if (
            req.file.mimetype === "image/jpeg" ||
            req.file.mimetype === "image/jpg" ||
            req.file.mimetype === "image/png" ||
            req.file.mimetype === "image/gif" ||
            req.file.mimetype === "image/bmp" ||
            req.file.mimetype === "image/tiff" ||
            req.file.mimetype === "image/webp" ||
            req.file.mimetype === "image/svg+xml"
        ) {
            filename += ".webp";
            filePath = path.join(uploadDir, filename);

            await sharp(req.file.buffer)
                .resize({ width: 800 }) // Resize width to 800px
                .webp({ quality: 20 }) // Compress to lowest quality
                .toFile(filePath);
        } 
        // Handle video file (no conversion needed, just store the file)
        else if (
            req.file.mimetype === "video/mp4" ||
            req.file.mimetype === "video/mkv" ||
            req.file.mimetype === "video/x-matroska" ||
            req.file.mimetype === "video/avi" ||
            req.file.mimetype === "video/x-msvideo" ||
            req.file.mimetype === "video/webm" ||
            req.file.mimetype === "video/mov" ||
            req.file.mimetype === "video/quicktime" ||
            req.file.mimetype === "video/flv"
        ) {
            const ext = path.extname(req.file.originalname) || ".mp4"; // Get the original file extension
            filename += ext; // Use original file extension (e.g., .mp4, .mov, .webm)
            filePath = path.join(uploadDir, filename);

            await fs.promises.writeFile(filePath, req.file.buffer); // Save the video as-is
        } else {
            res.status(400).json({ message: "Invalid file type" });
            return;
        }

        // The app is served over HTTPS in production, but Express sits behind
        // a reverse proxy that isn't (reliably) forwarding X-Forwarded-Proto,
        // so req.protocol reports the proxy's plain-HTTP connection to Node.
        // That produced http:// upload URLs, which browsers flag as mixed
        // content on the HTTPS site. Force https in production rather than
        // trusting proxy headers that may not be set correctly.
        const protocol =
            process.env.NODE_ENV === "production"
                ? "https"
                : req.headers["x-forwarded-proto"] || req.protocol;
        const fileUrl = `${protocol}://${req.get("host")}/uploads/${filename}`;

        res.json({ message: "File uploaded successfully", data: fileUrl });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error processing file" });
    }
};

// Dedicated disk-backed multer uploader for auction videos (up to 50MB)
const ALLOWED_VIDEO_MIMES = new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/mov",
    "video/x-matroska",
    "video/mkv",
    "video/avi",
    "video/x-msvideo",
]);

const videoDiskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const rawExt = path.extname(file.originalname || "").toLowerCase();
        const safeExt = /^\.(mp4|webm|mov|mkv|avi)$/.test(rawExt) ? rawExt : ".mp4";
        const prefix = (process.env.APP_NAME || "kudumart").toLowerCase();
        cb(null, `${prefix}-video-${Date.now()}${safeExt}`);
    },
});

export const uploadVideo = multer({
    storage: videoDiskStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for pre-recorded auction videos
    fileFilter: (req: Request, file, cb) => {
        if (ALLOWED_VIDEO_MIMES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            (req as any).fileValidationError =
                "Only MP4, WebM, MOV, MKV, or AVI videos up to 50MB are allowed.";
        }
    },
});

export const uploadVideoFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if ((req as any).fileValidationError) {
            res.status(400).json({ message: (req as any).fileValidationError });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: "No video file uploaded." });
            return;
        }
        const protocol =
            process.env.NODE_ENV === "production"
                ? "https"
                : req.headers["x-forwarded-proto"] || req.protocol;
        const fileUrl = `${protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.json({ message: "Video uploaded successfully", data: fileUrl });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error uploading video" });
    }
};

// Function to delete an image
export const deleteImage = (filename: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Extract only the filename in case a URL is passed
        const cleanFilename = path.basename(filename);
        const filePath = path.join(__dirname, "../../uploads", cleanFilename);

        fs.unlink(filePath, (err) => {
            if (err) {
                reject(new Error("Error deleting the image"));
            } else {
                resolve();
            }
        });
    });
};

// Example: Delete image by filename
export const deleteImageByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const filename = req.query.filename as string; // Assuming filename is passed as a URL parameter

        await deleteImage(filename);  // Call the delete function

        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to delete image" });
    }
};