import mongoose from "mongoose";

const ProductImageSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ProductImage = mongoose.model("ProductImage", ProductImageSchema);

export default ProductImage;

