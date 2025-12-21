import express from "express";
import {
  createMainCategory,
  getAllMainCategories,
  getMainCategoryById,
  updateMainCategory,
  deleteMainCategory,
  uploadMainCategoryImage,
  deleteMainCategoryImage
} from "../controllers/mainCategoryController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", createMainCategory);
router.get("/", getAllMainCategories);
router.get("/:id", getMainCategoryById);
router.put("/:id", updateMainCategory);
router.post("/:id/image", upload.single("image"), uploadMainCategoryImage);
router.delete("/:id/image", deleteMainCategoryImage);
router.delete("/:id", deleteMainCategory);

export default router;

