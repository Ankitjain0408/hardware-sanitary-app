import SubCategory from "../models/SubCategory.js";
import MainCategory from "../models/MainCategory.js";

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create Sub Category
export const createSubCategory = async (req, res) => {
  try {
    const { mainCategoryId, name, description, imageUrl } = req.body;

    if (!mainCategoryId || !name || !name.trim()) {
      return res.status(400).json({ msg: "Main category ID and subcategory name are required" });
    }

    // Check if main category exists
    const mainCategory = await MainCategory.findById(mainCategoryId);
    if (!mainCategory) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    const slug = generateSlug(name);

    // Check if subcategory already exists for this main category
    const existingSubCategory = await SubCategory.findOne({
      mainCategoryId,
      $or: [
        { name: name.trim() },
        { slug: slug }
      ]
    });

    if (existingSubCategory) {
      return res.status(400).json({ msg: "Subcategory with this name already exists for this main category" });
    }

    const subCategory = new SubCategory({
      mainCategoryId,
      name: name.trim(),
      slug: slug,
      description: description?.trim() || "",
      imageUrl: imageUrl || null
    });

    await subCategory.save();
    await subCategory.populate('mainCategoryId', 'name');

    res.status(201).json({ msg: "Subcategory created successfully", subCategory });
  } catch (error) {
    console.error("Create subcategory error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Subcategory with this name already exists for this main category" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Sub Categories by Main Category
export const getSubCategoriesByMainCategory = async (req, res) => {
  try {
    const { mainCategoryId, isActive } = req.query;

    const query = {};
    if (mainCategoryId) {
      query.mainCategoryId = mainCategoryId;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subCategories = await SubCategory.find(query)
      .populate('mainCategoryId', 'name')
      .sort({ name: 1 });

    res.json({ subCategories });
  } catch (error) {
    console.error("Get subcategories error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get All Sub Categories
export const getAllSubCategories = async (req, res) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subCategories = await SubCategory.find(query)
      .populate('mainCategoryId', 'name')
      .sort({ name: 1 });

    res.json({ subCategories });
  } catch (error) {
    console.error("Get all subcategories error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Single Sub Category
export const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id)
      .populate('mainCategoryId', 'name');
    
    if (!subCategory) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }

    res.json({ subCategory });
  } catch (error) {
    console.error("Get subcategory error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Sub Category
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, isActive } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ msg: "Subcategory not found" });
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

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('mainCategoryId', 'name');

    res.json({ msg: "Subcategory updated successfully", subCategory: updatedSubCategory });
  } catch (error) {
    console.error("Update subcategory error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Subcategory with this name already exists for this main category" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Sub Category (Soft Delete)
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }

    // Soft delete
    subCategory.isActive = false;
    await subCategory.save();

    res.json({ msg: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
