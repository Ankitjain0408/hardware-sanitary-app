import express from "express";
import {
  getAdminNotificationCount,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead
} from "../controllers/adminNotificationController.js";

const router = express.Router();

// Get unread notification count
router.get("/count", getAdminNotificationCount);

// Get all notifications
router.get("/", getAdminNotifications);

// Mark notification as read
router.put("/:id/read", markAdminNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", markAllAdminNotificationsAsRead);

export default router;

