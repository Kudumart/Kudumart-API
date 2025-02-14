import { Router } from "express";
import * as imageController from "../controllers/uploadController";
import { upload, uploadImage } from "../controllers/uploadController"; // Import multer and uploadImage function

const uploadRoutes = Router();

// New upload route
uploadRoutes.post("/image", upload.single("image"), uploadImage);
// Delete image route
uploadRoutes.delete("/delete", imageController.deleteImageByName); // File name passed in the URL

export default uploadRoutes;
