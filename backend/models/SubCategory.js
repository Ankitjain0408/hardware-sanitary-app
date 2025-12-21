import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema({
  mainCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MainCategory",
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
  description: {
    type: String,
    trim: true,
    default: ""
  },
  imageUrl: {
    type: String,
    default: null,
  },
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique subcategory name per main category
SubCategorySchema.index({ mainCategoryId: 1, name: 1 }, { unique: true });

const SubCategory = mongoose.model("SubCategory", SubCategorySchema);

export default SubCategory;
