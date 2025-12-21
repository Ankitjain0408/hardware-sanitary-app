import mongoose from "mongoose";

const AdminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["new_inquiry", "inquiry_update", "system_alert", "catalog_download"],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // Can reference ProductInquiry or other entities
  },
  relatedType: {
    type: String,
    enum: ["ProductInquiry", "Product", "User", "Brand"],
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
AdminNotificationSchema.index({ isRead: 1, createdAt: -1 });
AdminNotificationSchema.index({ type: 1, createdAt: -1 });
AdminNotificationSchema.index({ relatedId: 1 });

const AdminNotification = mongoose.model("AdminNotification", AdminNotificationSchema);

export default AdminNotification;

