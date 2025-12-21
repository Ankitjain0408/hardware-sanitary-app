import express from "express";
import {
  uploadProductImage,
  getProductImages,
  setPrimaryImage,
  deleteImage
} from "../controllers/imageController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Upload image (supports both file upload and URL)
router.post("/:productId/images", upload.single('image'), uploadProductImage);
router.get("/:productId/images", getProductImages);
router.put("/:productId/images/:imageId/primary", setPrimaryImage);
router.delete("/:productId/images/:imageId", deleteImage);

export default router;

