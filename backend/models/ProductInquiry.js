import mongoose from "mongoose";

const ProductInquirySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending", "in_stock", "out_of_stock", "available_soon", "cancelled"],
    default: "pending"
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ""
  },
  stockUpdated: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ProductInquirySchema.index({ userId: 1, createdAt: -1 });
ProductInquirySchema.index({ status: 1, createdAt: -1 });
ProductInquirySchema.index({ productId: 1 });

const ProductInquiry = mongoose.model("ProductInquiry", ProductInquirySchema);

export default ProductInquiry;

