import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  // Category-first structure
  mainCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategory",
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
    required: true
  },
  // Brand kept for filtering (optional in future, but required now for backward compatibility)
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Product variants (e.g., different sizes)
  variants: [{
    size: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      enum: ['mm', 'cm', 'inch'],
      default: 'mm',
      trim: true
    },
    price: {
      type: Number,
      min: 0
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      trim: true,
      default: ""
    }
  }],
  // Base size (for backward compatibility and default display)
  size: {
    type: String,
    trim: true,
    default: ""
  },
  // Base size unit
  sizeUnit: {
    type: String,
    enum: ['mm', 'cm', 'inch'],
    default: 'mm',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ProductSchema.index({ mainCategoryId: 1, isActive: 1 });
ProductSchema.index({ categoryId: 1, isActive: 1 });
ProductSchema.index({ brandId: 1, isActive: 1 });
ProductSchema.index({ mainCategoryId: 1, categoryId: 1, brandId: 1, isActive: 1 });

const Product = mongoose.model("Product", ProductSchema);

export default Product;

