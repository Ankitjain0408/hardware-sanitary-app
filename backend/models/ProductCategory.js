import mongoose from "mongoose";

const ProductCategorySchema = new mongoose.Schema({
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
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique category name per brand
ProductCategorySchema.index({ brandId: 1, name: 1 }, { unique: true });

const ProductCategory = mongoose.model("ProductCategory", ProductCategorySchema);

export default ProductCategory;

