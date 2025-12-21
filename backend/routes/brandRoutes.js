import express from "express";
import {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  deleteBrandImage,
  uploadBrandCatalog,
  deleteBrandCatalog,
  trackCatalogDownload
} from "../controllers/brandController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", createBrand);
router.get("/", getAllBrands);
router.put("/:id", updateBrand);
router.post("/:id/image", upload.single("image"), uploadBrandImage);
router.delete("/:id/image", deleteBrandImage);
router.post("/:id/catalog", upload.single("catalog"), uploadBrandCatalog);
router.delete("/:id/catalog", deleteBrandCatalog);
// Note: GET /:id/catalog/download is handled as a public route in server.js
router.delete("/:id", deleteBrand);

export default router;

