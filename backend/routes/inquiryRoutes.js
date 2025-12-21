import express from "express";
import {
  createInquiry,
  getAllInquiries,
  getUserInquiries,
  updateInquiryStatus,
  getNotificationCount,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/inquiryController.js";
import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes (must come before admin routes to avoid collisions)
router.post("/", requireAuth, createInquiry);
router.get("/my-inquiries", requireAuth, getUserInquiries);
router.get("/notifications/count", requireAuth, getNotificationCount);
router.get("/notifications", requireAuth, getUserNotifications);
router.put("/notifications/:id/read", requireAuth, markNotificationAsRead);
router.put("/notifications/read-all", requireAuth, markAllNotificationsAsRead);

// Admin routes (must come after user routes)
// Note: GET / requires admin, but user routes above are more specific so no collision
router.get("/", requireAdmin, getAllInquiries);
router.put("/:id/status", requireAdmin, updateInquiryStatus);

export default router;

