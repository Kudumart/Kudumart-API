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
exports.deleteImageByName = exports.deleteImage = exports.uploadFile = exports.upload = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const logger_1 = __importDefault(require("../middlewares/logger"));
// Ensure uploads directory exists
const uploadDir = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer configuration (store file in memory)
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
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
        if (allowedImageTypes.includes(file.mimetype) || file.mimetype === allowedPdfType) {
            cb(null, true); // ✅ Allow upload
        }
        else {
            cb(null, false); // ❌ Reject file
            req.fileValidationError = "Only images (JPG, PNG, WEBP, GIF, BMP, TIFF, SVG) and PDFs are allowed.";
        }
    },
});
// Upload and process file (image or PDF)
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // If the validation fails
        if (req.fileValidationError) {
            res.status(400).json({ message: req.fileValidationError });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        let filename = `${(_a = process.env.APP_NAME) === null || _a === void 0 ? void 0 : _a.toLowerCase()}-${Date.now()}`;
        let filePath;
        if (req.file.mimetype === "application/pdf") {
            // Handle PDF file
            filename += ".pdf";
            filePath = path_1.default.join(uploadDir, filename);
            yield fs_1.default.promises.writeFile(filePath, req.file.buffer);
        }
        else {
            // Handle image file (convert to WebP)
            filename += ".webp";
            filePath = path_1.default.join(uploadDir, filename);
            yield (0, sharp_1.default)(req.file.buffer)
                .resize({ width: 800 }) // Resize width to 800px
                .webp({ quality: 20 }) // Compress to lowest quality
                .toFile(filePath);
        }
        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const fileUrl = `${protocol}://${req.get("host")}/uploads/${filename}`;
        res.json({ message: "File uploaded successfully", data: fileUrl });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Error processing file" });
    }
});
exports.uploadFile = uploadFile;
// Function to delete an image
const deleteImage = (filename) => {
    return new Promise((resolve, reject) => {
        // Extract only the filename in case a URL is passed
        const cleanFilename = path_1.default.basename(filename);
        const filePath = path_1.default.join(__dirname, "../../uploads", cleanFilename);
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                reject(new Error("Error deleting the image"));
            }
            else {
                resolve();
            }
        });
    });
};
exports.deleteImage = deleteImage;
// Example: Delete image by filename
const deleteImageByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filename = req.query.filename; // Assuming filename is passed as a URL parameter
        yield (0, exports.deleteImage)(filename); // Call the delete function
        res.status(200).json({ message: "Image deleted successfully" });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete image" });
    }
});
exports.deleteImageByName = deleteImageByName;
//# sourceMappingURL=uploadController.js.map