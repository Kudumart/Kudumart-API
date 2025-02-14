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
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/svg+xml",
        ];
        const allowedPdfType = "application/pdf";

        if (allowedImageTypes.includes(file.mimetype) || file.mimetype === allowedPdfType) {
            cb(null, true); // ✅ Allow upload
        } else {
            cb(null, false); // ❌ Reject file
            (req as any).fileValidationError = "Only images (JPG, PNG, WEBP, GIF, BMP, TIFF, SVG) and PDFs are allowed.";
        }
    },
});

// Upload and process file (image or PDF)
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

        if (req.file.mimetype === "application/pdf") {
            // Handle PDF file
            filename += ".pdf";
            filePath = path.join(uploadDir, filename);
            await fs.promises.writeFile(filePath, req.file.buffer);
        } else {
            // Handle image file (convert to WebP)
            filename += ".webp";
            filePath = path.join(uploadDir, filename);

            await sharp(req.file.buffer)
                .resize({ width: 800 }) // Resize width to 800px
                .webp({ quality: 20 }) // Compress to lowest quality
                .toFile(filePath);
        }

        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

        res.json({ message: "File uploaded successfully", data: fileUrl });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error processing file" });
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