import mongoose from "mongoose";

const MainCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
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
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const MainCategory = mongoose.model("MainCategory", MainCategorySchema);

export default MainCategory;
