import express from "express";
import {
  createCategory,
  getCategoriesByBrand,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategoriesByBrand);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;

