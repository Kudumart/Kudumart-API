import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import * as imageController from "../controllers/uploadController";
import {
  upload,
  uploadFile,
  uploadVideo,
  uploadVideoFile,
} from "../controllers/uploadController"; // Import multer and uploadImage function

const uploadRoutes = Router();

// New upload route
uploadRoutes.post("/file", upload.single("image"), uploadFile);

// Dedicated video upload route (up to 50MB, disk-backed)
uploadRoutes.post(
  "/video",
  (req: Request, res: Response, next: NextFunction) => {
    uploadVideo.single("video")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            message: "Video file is too large. Maximum allowed size is 50MB.",
          });
          return;
        }
        res.status(400).json({ message: err.message });
        return;
      }
      if (err) {
        res.status(400).json({ message: err.message || "Video upload failed." });
        return;
      }
      next();
    });
  },
  uploadVideoFile,
);

// Delete image route
uploadRoutes.delete("/delete", imageController.deleteImageByName); // File name passed in the URL

export default uploadRoutes;
