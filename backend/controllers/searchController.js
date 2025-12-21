import Brand from "../models/Brand.js";
import MainCategory from "../models/MainCategory.js";
import SubCategory from "../models/SubCategory.js";
import ProductCategory from "../models/ProductCategory.js";
import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";

function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const searchAll = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ brands: [], categories: [], products: [] });

    const regex = new RegExp(escapeRegex(q), "i");

    const [brands, mainCategories, subCategories, productCategories, products] = await Promise.all([
      Brand.find({ name: regex, isActive: true }).select("_id name").limit(5).lean(),
      MainCategory.find({ name: regex, isActive: true }).select("_id name").limit(5).lean(),
      SubCategory.find({ name: regex, isActive: true }).select("_id name mainCategoryId").limit(5).lean(),
      ProductCategory.find({ name: regex, isActive: true }).select("_id name brandId").limit(5).lean(),
      Product.find({ isActive: true, $or: [{ name: regex }, { description: regex }] })
        .select("_id name brandId mainCategoryId categoryId price stock")
        .populate("brandId", "name")
        .populate("mainCategoryId", "name")
        .populate("categoryId", "name")
        .limit(5)
        .lean(),
    ]);

    // Combine main categories, sub categories, and product categories for backward compatibility
    const categories = [...mainCategories, ...subCategories, ...productCategories];

    // attach primary image quickly for dropdown
    const productIds = products.map((p) => p._id);
    const images = await ProductImage.find({ productId: { $in: productIds } })
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();
    const firstImgByProduct = new Map();
    for (const img of images) {
      const key = img.productId.toString();
      if (!firstImgByProduct.has(key)) firstImgByProduct.set(key, img.imageUrl);
    }

    const productsWithImage = products.map((p) => ({
      ...p,
      primaryImageUrl: firstImgByProduct.get(p._id.toString()) || null,
    }));

    res.json({ brands, categories, products: productsWithImage });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};


