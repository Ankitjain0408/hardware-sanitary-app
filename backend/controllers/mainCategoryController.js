import MainCategory from "../models/MainCategory.js";
import crypto from "crypto";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create Main Category
export const createMainCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Category name is required" });
    }

    const slug = generateSlug(name);

    // Check if category already exists
    const existingCategory = await MainCategory.findOne({
      $or: [
        { name: name.trim() },
        { slug: slug }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ msg: "Category with this name already exists" });
    }

    const category = new MainCategory({
      name: name.trim(),
      slug: slug,
      description: description?.trim() || "",
      imageUrl: imageUrl || null,
      displayOrder: displayOrder || 0
    });

    await category.save();

    res.status(201).json({ msg: "Main category created successfully", category });
  } catch (error) {
    console.error("Create main category error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Category with this name already exists" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Get All Main Categories
export const getAllMainCategories = async (req, res) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await MainCategory.find(query)
      .sort({ displayOrder: 1, name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error("Get main categories error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Single Main Category
export const getMainCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MainCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    res.json({ category });
  } catch (error) {
    console.error("Get main category error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Main Category
export const updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, displayOrder, isActive } = req.body;

    const category = await MainCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    const updateData = {};

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name);
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    if (displayOrder !== undefined) {
      updateData.displayOrder = parseInt(displayOrder);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedCategory = await MainCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ msg: "Main category updated successfully", category: updatedCategory });
  } catch (error) {
    console.error("Update main category error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Category with this name already exists" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Main Category (Soft Delete)
export const deleteMainCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MainCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.json({ msg: "Main category deleted successfully" });
  } catch (error) {
    console.error("Delete main category error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload/Replace Main Category Image (Admin)
export const uploadMainCategoryImage = async (req, res) => {
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

    const category = await MainCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    // Remove old image from Cloudinary (best-effort)
    if (category.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(category.cloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete old main category image from Cloudinary:", e);
      }
    }

    const publicId = `main-category_${id}_${crypto.randomUUID()}`;
    const uploadResult = await uploadToCloudinary(file.buffer, "hardware-sanitary-main-categories", {
      public_id: publicId,
      overwrite: false,
    });

    category.imageUrl = uploadResult.secure_url;
    category.cloudinaryPublicId = uploadResult.public_id;
    await category.save();

    res.json({
      msg: "Main category image updated",
      category,
    });
  } catch (error) {
    console.error("Upload main category image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Main Category Image (Admin)
export const deleteMainCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MainCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    if (category.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(category.cloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete main category image from Cloudinary:", e);
      }
    }

    category.imageUrl = null;
    category.cloudinaryPublicId = null;
    await category.save();

    res.json({ msg: "Main category image removed", category });
  } catch (error) {
    console.error("Delete main category image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
