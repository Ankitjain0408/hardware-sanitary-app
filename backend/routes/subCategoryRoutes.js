import express from "express";
import {
  createSubCategory,
  getSubCategoriesByMainCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.post("/", createSubCategory);
router.get("/", getAllSubCategories);
router.get("/by-main-category", getSubCategoriesByMainCategory);
router.get("/:id", getSubCategoryById);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;
