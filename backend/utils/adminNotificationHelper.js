import AdminNotification from "../models/AdminNotification.js";

// Create admin notification (helper function to be used by other controllers)
export const createAdminNotification = async (notificationData) => {
  try {
    console.log("Creating admin notification with data:", {
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedId: notificationData.relatedId,
      relatedType: notificationData.relatedType
    });

    const notification = new AdminNotification({
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      relatedId: notificationData.relatedId || null,
      relatedType: notificationData.relatedType || null,
      isRead: false
    });

    await notification.save();
    console.log("✅ Admin notification saved successfully:", notification._id);
    return notification;
  } catch (error) {
    console.error("❌ Create admin notification error:", error);
    console.error("Error details:", error.message, error.stack);
    return null;
  }
};

