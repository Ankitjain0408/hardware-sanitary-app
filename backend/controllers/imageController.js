import ProductImage from "../models/ProductImage.js";
import Product from "../models/Product.js";
import crypto from "crypto";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// Upload Product Image (supports both file upload and URL)
export const uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrl, isPrimary } = req.body;
    const file = req.file; // File from multer

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    let finalImageUrl = imageUrl;

    let cloudinaryPublicId = null;

    const hasCloudinary =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    // If file is uploaded, upload to Cloudinary (preferred) or fallback to local /uploads
    if (file) {
      if (!hasCloudinary) {
        return res.status(500).json({ msg: "Cloudinary is not configured on the server" });
      }
      try {
        // Ensure unique public_id for multi-image uploads (avoid collisions)
        const publicId = `product_${productId}_${crypto.randomUUID()}`;
        const uploadResult = await uploadToCloudinary(file.buffer, "hardware-sanitary-products", {
          public_id: publicId,
          overwrite: false,
        });
        finalImageUrl = uploadResult.secure_url;
        cloudinaryPublicId = uploadResult.public_id;
      } catch (cloudErr) {
        console.error("Cloudinary upload error:", cloudErr);
        return res.status(500).json({ msg: "Failed to upload image to Cloudinary" });
      }
    } else if (!imageUrl) {
      return res.status(400).json({ msg: "Image file or URL is required" });
    }

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await ProductImage.updateMany(
        { productId, isPrimary: true },
        { isPrimary: false }
      );
    }

    const productImage = new ProductImage({
      productId,
      imageUrl: finalImageUrl,
      isPrimary: isPrimary || false,
      cloudinaryPublicId: cloudinaryPublicId
    });

    await productImage.save();
    await productImage.populate('productId', 'name');

    res.status(201).json({ msg: "Image uploaded successfully", image: productImage });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Product Images
export const getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const images = await ProductImage.find({ productId })
      .populate('productId', 'name')
      .sort({ isPrimary: -1, createdAt: -1 });

    res.json({ images });
  } catch (error) {
    console.error("Get images error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Set Primary Image
export const setPrimaryImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Validate image exists and belongs to product
    const image = await ProductImage.findOne({ _id: imageId, productId });
    if (!image) {
      return res.status(404).json({ msg: "Image not found" });
    }

    // Unset all other primary images for this product
    await ProductImage.updateMany(
      { productId, isPrimary: true },
      { isPrimary: false }
    );

    // Set this image as primary
    image.isPrimary = true;
    await image.save();

    res.json({ msg: "Primary image set successfully", image });
  } catch (error) {
    console.error("Set primary image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Image
export const deleteImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOne({ _id: imageId, productId });
    if (!image) {
      return res.status(404).json({ msg: "Image not found" });
    }

    const wasPrimary = image.isPrimary;

    // Delete from Cloudinary if present
    if (image.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(image.cloudinaryPublicId);
      } catch (cloudErr) {
        console.error("Failed to delete from Cloudinary:", cloudErr);
      }
    }

    await ProductImage.findByIdAndDelete(imageId);

    // If the deleted image was primary, set the first remaining image as primary
    if (wasPrimary) {
      const remainingImages = await ProductImage.find({ productId })
        .sort({ createdAt: 1 })
        .limit(1);
      
      if (remainingImages.length > 0) {
        remainingImages[0].isPrimary = true;
        await remainingImages[0].save();
      }
    }

    res.json({ msg: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

