import { Router } from "express";
import * as imageController from "../controllers/uploadController";
import { upload, uploadFile } from "../controllers/uploadController"; // Import multer and uploadImage function

const uploadRoutes = Router();

// New upload route
uploadRoutes.post("/file", upload.single("image"), uploadFile);
// Delete image route
uploadRoutes.delete("/delete", imageController.deleteImageByName); // File name passed in the URL

export default uploadRoutes;
