import ProductCategory from "../models/ProductCategory.js";
import Brand from "../models/Brand.js";

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { brandId, name } = req.body;

    if (!brandId || !name) {
      return res.status(400).json({ msg: "Brand ID and category name are required" });
    }

    // Check if brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    const slug = generateSlug(name);

    // Check if category with same name exists for this brand
    const existingCategory = await ProductCategory.findOne({
      brandId,
      $or: [{ name: name.trim() }, { slug }]
    });

    if (existingCategory) {
      return res.status(400).json({ msg: "Category with this name already exists for this brand" });
    }

    const category = new ProductCategory({
      brandId,
      name: name.trim(),
      slug
    });

    await category.save();
    await category.populate('brandId', 'name imageUrl');

    res.status(201).json({ msg: "Category created successfully", category });
  } catch (error) {
    console.error("Create category error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Category with this name already exists for this brand" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Categories by Brand
export const getCategoriesByBrand = async (req, res) => {
  try {
    const { brandId } = req.query;
    const { isActive } = req.query;

    const query = {};
    if (brandId) {
      query.brandId = brandId;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await ProductCategory.find(query)
      .populate('brandId', 'name imageUrl')
      .sort({ createdAt: -1 });

    res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('brandId', 'name imageUrl');

    res.json({ msg: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    console.error("Update category error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Category with this name already exists for this brand" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ProductCategory.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.json({ msg: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

