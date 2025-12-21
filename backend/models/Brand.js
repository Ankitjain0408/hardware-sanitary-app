import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
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
  imageUrl: {
    type: String,
    default: null,
  },
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  catalogUrl: {
    type: String,
    default: null,
  },
  catalogCloudinaryPublicId: {
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

const Brand = mongoose.model("Brand", BrandSchema);

export default Brand;

