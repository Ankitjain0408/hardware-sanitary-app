import ProductInquiry from "../models/ProductInquiry.js";
import Notification from "../models/Notification.js";
import Product from "../models/Product.js";
import User from "../models/user.js";
import { sendInquiryNotificationToAdmin, sendInquiryStatusToUser } from "../utils/emailService.js";
import { createAdminNotification } from "../utils/adminNotificationHelper.js";

// Create inquiry from wishlist
export const createInquiry = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ msg: "Product ID and valid quantity are required" });
    }

    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get product details
    const product = await Product.findById(productId)
      .populate("brandId", "name")
      .populate("categoryId", "name")
      .populate("mainCategoryId", "name");

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ msg: "Product is not available" });
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Create inquiry
    const inquiry = new ProductInquiry({
      userId: user._id,
      username: user.username,
      userEmail: user.email,
      productId: product._id,
      productName: product.name,
      quantity: quantity,
      price: product.price,
      totalAmount: totalAmount,
      status: "pending"
    });

    await inquiry.save();

    // Create admin notification
    try {
      await createAdminNotification({
        type: "new_inquiry",
        title: "New Product Inquiry",
        message: `${user.username} (${user.email}) submitted an inquiry for ${product.name} - Quantity: ${quantity}`,
        relatedId: inquiry._id,
        relatedType: "ProductInquiry"
      });
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
      // Don't fail the request if notification creation fails
    }

    // Send email to admin
    try {
      await sendInquiryNotificationToAdmin({
        inquiryId: inquiry._id,
        username: user.username,
        userEmail: user.email,
        productName: product.name,
        brandName: product.brandId?.name || "N/A",
        categoryName: product.categoryId?.name || "N/A",
        quantity: quantity,
        price: product.price,
        totalAmount: totalAmount
      });
    } catch (emailError) {
      console.error("Failed to send inquiry email to admin:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      msg: "Inquiry submitted successfully. Admin will check stock and notify you.",
      inquiry: inquiry
    });
  } catch (error) {
    console.error("Create inquiry error:", error);
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

// Get all inquiries (Admin only)
export const getAllInquiries = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status && ["pending", "in_stock", "out_of_stock", "available_soon", "cancelled"].includes(status)) {
      query.status = status;
    }

    const inquiries = await ProductInquiry.find(query)
      .populate("productId", "name price stock isActive")
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ inquiries });
  } catch (error) {
    console.error("Get inquiries error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get user's inquiries
export const getUserInquiries = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const inquiries = await ProductInquiry.find({ userId })
      .populate("productId", "name price stock isActive")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ inquiries });
  } catch (error) {
    console.error("Get user inquiries error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update inquiry status (Admin only)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, stockQuantity } = req.body;

    if (!status || !["pending", "in_stock", "out_of_stock", "available_soon", "cancelled"].includes(status)) {
      return res.status(400).json({ msg: "Valid status is required" });
    }

    const inquiry = await ProductInquiry.findById(id)
      .populate("userId", "username email")
      .populate("productId");

    if (!inquiry) {
      return res.status(404).json({ msg: "Inquiry not found" });
    }

    // Update inquiry
    inquiry.status = status;
    if (adminNotes !== undefined) {
      inquiry.adminNotes = adminNotes.trim();
    }

    // If status is in_stock and stockQuantity is provided, update product stock
    if (status === "in_stock" && stockQuantity !== undefined) {
      const product = await Product.findById(inquiry.productId);
      if (product) {
        product.stock = Math.max(0, parseInt(stockQuantity));
        await product.save();
        inquiry.stockUpdated = true;
      }
    }

    inquiry.notified = false; // Reset notification flag
    await inquiry.save();

    // Create admin notification for status update
    try {
      await createAdminNotification({
        type: "inquiry_update",
        title: "Inquiry Status Updated",
        message: `Inquiry for ${inquiry.productName} by ${inquiry.userId.username} updated to: ${status}`,
        relatedId: inquiry._id,
        relatedType: "ProductInquiry"
      });
    } catch (notifError) {
      console.error("Failed to create admin notification:", notifError);
    }

    // Create notification for user
    let notificationTitle = "";
    let notificationMessage = "";

    switch (status) {
      case "in_stock":
        notificationTitle = "Product Available";
        notificationMessage = `Great news! ${inquiry.productName} is now in stock. You can proceed with your inquiry.`;
        break;
      case "out_of_stock":
        notificationTitle = "Product Out of Stock";
        notificationMessage = `We're sorry, but ${inquiry.productName} is currently out of stock. We'll notify you when it's available.`;
        break;
      case "available_soon":
        notificationTitle = "Product Available Soon";
        notificationMessage = `${inquiry.productName} will be available soon. We'll keep you updated.`;
        break;
      case "cancelled":
        notificationTitle = "Inquiry Cancelled";
        notificationMessage = `Your inquiry for ${inquiry.productName} has been cancelled.`;
        break;
      default:
        notificationTitle = "Inquiry Status Updated";
        notificationMessage = `Your inquiry for ${inquiry.productName} status has been updated.`;
    }

    // Create notification
    const notification = new Notification({
      userId: inquiry.userId._id,
      type: "inquiry_status",
      title: notificationTitle,
      message: notificationMessage,
      relatedId: inquiry._id
    });
    await notification.save();

    // Send email to user
    try {
      await sendInquiryStatusToUser({
        userEmail: inquiry.userId.email,
        username: inquiry.userId.username,
        productName: inquiry.productName,
        status: status,
        adminNotes: inquiry.adminNotes || "",
        quantity: inquiry.quantity,
        price: inquiry.price,
        totalAmount: inquiry.totalAmount
      });
      inquiry.notified = true;
      await inquiry.save();
    } catch (emailError) {
      console.error("Failed to send status email to user:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      msg: "Inquiry status updated successfully",
      inquiry: inquiry
    });
  } catch (error) {
    console.error("Update inquiry status error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get notification count for user
export const getNotificationCount = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.json({ count: 0 });
    }

    const count = await Notification.countDocuments({
      userId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error("Get notification count error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    const notification = await Notification.findOne({
      _id: id,
      userId: userId
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ msg: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ msg: "Authentication required" });
    }

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ msg: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

