import express from "express";
import { createReview, listReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", listReviews);
router.post("/", createReview);

export default router;

