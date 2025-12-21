import express from "express";
import {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,
  deleteAdminProfileImage
} from "../controllers/adminProfileController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Get admin profile
router.get("/", getAdminProfile);

// Update admin profile (aboutUs)
router.put("/", updateAdminProfile);

// Upload admin profile image
router.post("/image", upload.single('image'), uploadAdminProfileImage);

// Delete admin profile image
router.delete("/image", deleteAdminProfileImage);

export default router;
