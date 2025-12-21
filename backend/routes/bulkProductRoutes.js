import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { bulkUploadProductsCsv } from "../controllers/bulkProductController.js";

const router = express.Router();

router.post("/csv", upload.single("file"), bulkUploadProductsCsv);

export default router;


