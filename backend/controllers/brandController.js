import Brand from "../models/Brand.js";
import crypto from "crypto";
import { uploadToCloudinary, deleteFromCloudinary, uploadPDFToCloudinary } from "../utils/cloudinaryUpload.js";
import { createAdminNotification } from "../utils/adminNotificationHelper.js";
import User from "../models/user.js";

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create Brand
export const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Brand name is required" });
    }

    const slug = generateSlug(name);

    // Check if brand with same name or slug exists
    const existingBrand = await Brand.findOne({
      $or: [{ name: name.trim() }, { slug }]
    });

    if (existingBrand) {
      return res.status(400).json({ msg: "Brand with this name already exists" });
    }

    const brand = new Brand({
      name: name.trim(),
      slug
    });

    await brand.save();

    res.status(201).json({ msg: "Brand created successfully", brand });
  } catch (error) {
    console.error("Create brand error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Brand with this name or slug already exists" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Get All Brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json({ brands });
  } catch (error) {
    console.error("Get all brands error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Brand name is required" });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    const slug = generateSlug(name);

    // Check if another brand with same name or slug exists
    const existingBrand = await Brand.findOne({
      _id: { $ne: id },
      $or: [{ name: name.trim() }, { slug }]
    });

    if (existingBrand) {
      return res.status(400).json({ msg: "Brand with this name already exists" });
    }

    brand.name = name.trim();
    brand.slug = slug;
    await brand.save();

    res.json({ msg: "Brand updated successfully", brand });
  } catch (error) {
    console.error("Update brand error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Brand with this name or slug already exists" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    // Delete image from Cloudinary if exists
    if (brand.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(brand.cloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete brand image from Cloudinary:", e);
      }
    }

    // Delete catalog from Cloudinary if exists
    if (brand.catalogCloudinaryPublicId) {
      try {
        await deleteFromCloudinary(brand.catalogCloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete brand catalog from Cloudinary:", e);
      }
    }

    await Brand.findByIdAndDelete(id);

    res.json({ msg: "Brand deleted successfully" });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload/Replace Brand Image (Admin)
export const uploadBrandImage = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "Image file is required" });
    }

    const hasCloudinary =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      return res.status(500).json({ msg: "Cloudinary is not configured on the server" });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    // Remove old image from Cloudinary (best-effort)
    if (brand.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(brand.cloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete old brand image from Cloudinary:", e);
      }
    }

    const publicId = `brand_${id}_${crypto.randomUUID()}`;
    const uploadResult = await uploadToCloudinary(file.buffer, "hardware-sanitary-brands", {
      public_id: publicId,
      overwrite: false,
    });

    brand.imageUrl = uploadResult.secure_url;
    brand.cloudinaryPublicId = uploadResult.public_id;
    await brand.save();

    res.json({
      msg: "Brand image updated",
      brand,
    });
  } catch (error) {
    console.error("Upload brand image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Brand Image (Admin)
export const deleteBrandImage = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    if (brand.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(brand.cloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete brand image from Cloudinary:", e);
      }
    }

    brand.imageUrl = null;
    brand.cloudinaryPublicId = null;
    await brand.save();

    res.json({ msg: "Brand image removed", brand });
  } catch (error) {
    console.error("Delete brand image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload/Replace Brand Catalog (Admin)
export const uploadBrandCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "PDF file is required" });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ msg: "Only PDF files are allowed" });
    }

    const hasCloudinary =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      return res.status(500).json({ msg: "Cloudinary is not configured on the server" });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    // Remove old catalog from Cloudinary (best-effort)
    if (brand.catalogCloudinaryPublicId) {
      try {
        await deleteFromCloudinary(brand.catalogCloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete old brand catalog from Cloudinary:", e);
      }
    }

    const publicId = `brand_catalog_${id}_${crypto.randomUUID()}`;
    const uploadResult = await uploadPDFToCloudinary(file.buffer, "hardware-sanitary-brand-catalogs", {
      public_id: publicId,
      overwrite: false,
    });

    brand.catalogUrl = uploadResult.secure_url;
    brand.catalogCloudinaryPublicId = uploadResult.public_id;
    await brand.save();

    res.json({
      msg: "Brand catalog updated",
      brand,
    });
  } catch (error) {
    console.error("Upload brand catalog error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Brand Catalog (Admin)
export const deleteBrandCatalog = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    if (brand.catalogCloudinaryPublicId) {
      try {
        await deleteFromCloudinary(brand.catalogCloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete brand catalog from Cloudinary:", e);
      }
    }

    brand.catalogUrl = null;
    brand.catalogCloudinaryPublicId = null;
    await brand.save();

    res.json({ msg: "Brand catalog removed", brand });
  } catch (error) {
    console.error("Delete brand catalog error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Track catalog download and create admin notification
export const trackCatalogDownload = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    if (!brand.catalogUrl) {
      return res.status(404).json({ msg: "Catalog not available for this brand" });
    }

    // Get user info if logged in (optional - can be guest)
    let userInfo = "Guest user";
    if (req.session.userId) {
      const user = await User.findById(req.session.userId).select("username email");
      if (user) {
        userInfo = `${user.username} (${user.email})`;
      }
    }

    // Create admin notification
    try {
      const notification = await createAdminNotification({
        type: "catalog_download",
        title: "Catalog Downloaded",
        message: `${userInfo} downloaded the catalog for ${brand.name}`,
        relatedId: brand._id,
        relatedType: "Brand"
      });
      if (notification) {
        console.log("✅ Admin notification created for catalog download:", notification._id);
      } else {
        console.error("❌ Failed to create admin notification (returned null)");
      }
    } catch (notifError) {
      console.error("❌ Failed to create admin notification:", notifError);
      // Don't fail the request if notification creation fails
    }

    // Return the catalog URL
    res.json({ 
      catalogUrl: brand.catalogUrl,
      brandName: brand.name
    });
  } catch (error) {
    console.error("Track catalog download error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
