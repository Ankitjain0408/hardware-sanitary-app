import AdminNotification from "../models/AdminNotification.js";

// Get unread notification count for admin
export const getAdminNotificationCount = async (req, res) => {
  try {
    const adminId = req.session.userId;
    if (!adminId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    // Count notifications that this admin hasn't read
    // A notification is unread if:
    // 1. It's globally marked as unread (isRead: false), OR
    // 2. This admin is not in the readBy array
    const allNotifications = await AdminNotification.find().lean();
    const count = allNotifications.filter(notif => {
      if (notif.isRead) return false; // Globally read
      const hasRead = notif.readBy?.some(r => String(r.adminId) === String(adminId));
      return !hasRead; // This admin hasn't read it
    }).length;

    res.json({ count });
  } catch (error) {
    console.error("Get admin notification count error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.session.userId;
    if (!adminId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Mark which notifications this admin has read
    const notificationsWithReadStatus = notifications.map(notif => {
      const hasRead = notif.readBy?.some(r => String(r.adminId) === String(adminId));
      return {
        ...notif,
        isRead: hasRead || notif.isRead
      };
    });

    res.json({ notifications: notificationsWithReadStatus });
  } catch (error) {
    console.error("Get admin notifications error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark notification as read by current admin
export const markAdminNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.userId;
    
    if (!adminId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const notification = await AdminNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Check if this admin has already read it
    const alreadyRead = notification.readBy?.some(r => String(r.adminId) === String(adminId));
    
    if (!alreadyRead) {
      notification.readBy = notification.readBy || [];
      notification.readBy.push({
        adminId: adminId,
        readAt: new Date()
      });
      
      // If all admins have read it, mark as globally read
      const adminCount = await require("mongoose").model("User").countDocuments({ isAdmin: true });
      if (notification.readBy.length >= adminCount) {
        notification.isRead = true;
      }
      
      await notification.save();
    }

    res.json({ msg: "Notification marked as read" });
  } catch (error) {
    console.error("Mark admin notification as read error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark all notifications as read by current admin
export const markAllAdminNotificationsAsRead = async (req, res) => {
  try {
    const adminId = req.session.userId;
    
    if (!adminId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    // Get all notifications
    const notifications = await AdminNotification.find();

    // Add this admin to readBy for all notifications
    for (const notification of notifications) {
      const alreadyRead = notification.readBy?.some(r => String(r.adminId) === String(adminId));
      if (!alreadyRead) {
        notification.readBy = notification.readBy || [];
        notification.readBy.push({
          adminId: adminId,
          readAt: new Date()
        });
        await notification.save();
      }
    }

    res.json({ msg: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all admin notifications as read error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


