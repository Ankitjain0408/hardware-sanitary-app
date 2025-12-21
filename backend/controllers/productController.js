import Product from "../models/Product.js";
import Brand from "../models/Brand.js";
import MainCategory from "../models/MainCategory.js";
import ProductCategory from "../models/ProductCategory.js";
import ProductImage from "../models/ProductImage.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const { mainCategoryId, categoryId, brandId, name, description, price, stock, variants, size } = req.body;

    if (!mainCategoryId || !categoryId || !brandId || !name) {
      return res.status(400).json({ msg: "Main Category ID, Category ID, Brand ID, and name are required" });
    }

    // If no variants and no base price, require price
    if ((!variants || variants.length === 0) && price === undefined) {
      return res.status(400).json({ msg: "Price is required when no variants are provided" });
    }

    // Validate main category exists
    const mainCategory = await MainCategory.findById(mainCategoryId);
    if (!mainCategory) {
      return res.status(404).json({ msg: "Main category not found" });
    }

    // Validate brand category exists and belongs to brand
    const brandCategory = await ProductCategory.findById(categoryId);
    if (!brandCategory) {
      return res.status(404).json({ msg: "Brand category not found" });
    }

    if (brandCategory.brandId.toString() !== brandId) {
      return res.status(400).json({ msg: "Category does not belong to the selected brand" });
    }

    // Validate brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ msg: "Brand not found" });
    }

    // Validate base price and stock
    if (price !== undefined && price < 0) {
      return res.status(400).json({ msg: "Price must be greater than or equal to 0" });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ msg: "Stock must be greater than or equal to 0" });
    }

    // Validate and process variants
    let processedVariants = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      processedVariants = variants.map(variant => {
        if (!variant.size) {
          throw new Error("Variant size is required");
        }
        return {
          size: variant.size.trim(),
          unit: variant.unit && ['mm', 'cm', 'inch'].includes(variant.unit) ? variant.unit : 'mm',
          price: variant.price !== undefined ? parseFloat(variant.price) : (price !== undefined ? parseFloat(price) : 0),
          stock: variant.stock !== undefined ? parseInt(variant.stock) : 0,
          sku: variant.sku?.trim() || ""
        };
      });
    }

    // Calculate total stock from variants if they exist
    const totalStock = processedVariants.length > 0
      ? processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : (stock !== undefined ? parseInt(stock) : 0);

    // Use first variant price as base price if no base price provided
    const basePrice = price !== undefined 
      ? parseFloat(price) 
      : (processedVariants.length > 0 ? processedVariants[0].price : 0);

    const product = new Product({
      mainCategoryId,
      categoryId,
      brandId,
      name: name.trim(),
      description: description?.trim() || "",
      price: basePrice,
      stock: totalStock,
      variants: processedVariants,
      size: size?.trim() || "",
      sizeUnit: req.body.sizeUnit && ['mm', 'cm', 'inch'].includes(req.body.sizeUnit) ? req.body.sizeUnit : 'mm'
    });

    await product.save();
    await product.populate('mainCategoryId', 'name');
    await product.populate('categoryId', 'name');
    await product.populate('brandId', 'name imageUrl');

    res.status(201).json({ msg: "Product created successfully", product });
  } catch (error) {
    console.error("Create product error:", error);
    if (error.message.includes("Variant")) {
      return res.status(400).json({ msg: error.message });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const { brandId, mainCategoryId, categoryId, isActive, search, sort, inStock } = req.query;

    const query = {};
    if (brandId) query.brandId = brandId;
    if (mainCategoryId) query.mainCategoryId = mainCategoryId;
    if (categoryId) query.categoryId = categoryId;
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (inStock === "true" || inStock === "1") {
      query.stock = { $gt: 0 };
    }

    // Search by product name/description OR brand name OR category name
    if (search && String(search).trim()) {
      const term = String(search).trim();
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      const [matchingBrands, matchingMainCategories, matchingCategories] = await Promise.all([
        Brand.find({ name: regex }).select("_id").lean(),
        MainCategory.find({ name: regex }).select("_id").lean(),
        ProductCategory.find({ name: regex }).select("_id").lean(),
      ]);

      const brandIds = matchingBrands.map((b) => b._id);
      const mainCategoryIds = matchingMainCategories.map((c) => c._id);
      const categoryIds = matchingCategories.map((c) => c._id);

      query.$or = [
        { name: regex },
        { description: regex },
        ...(brandIds.length ? [{ brandId: { $in: brandIds } }] : []),
        ...(mainCategoryIds.length ? [{ mainCategoryId: { $in: mainCategoryIds } }] : []),
        ...(categoryIds.length ? [{ categoryId: { $in: categoryIds } }] : []),
      ];
    }

    let sortSpec = { createdAt: -1 };
    if (sort === "price_asc") sortSpec = { price: 1 };
    if (sort === "price_desc") sortSpec = { price: -1 };
    if (sort === "stock_desc") sortSpec = { stock: -1 };
    if (sort === "newest") sortSpec = { createdAt: -1 };

    const products = await Product.find(query)
      .populate('brandId', 'name imageUrl')
      .populate('mainCategoryId', 'name')
      .populate('categoryId', 'name')
      .sort(sortSpec)
      .lean();

    // Attach images (primary first) so normal frontend can show product images
    const productIds = products.map((p) => p._id);
    const images = await ProductImage.find({ productId: { $in: productIds } })
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();

    const imagesByProductId = new Map();
    for (const img of images) {
      const key = img.productId.toString();
      if (!imagesByProductId.has(key)) imagesByProductId.set(key, []);
      imagesByProductId.get(key).push(img);
    }

    const productsWithImages = products.map((p) => {
      const imgs = imagesByProductId.get(p._id.toString()) || [];
      return {
        ...p,
        images: imgs,
        primaryImageUrl: imgs.find((i) => i.isPrimary)?.imageUrl || imgs[0]?.imageUrl || null,
      };
    });

    res.json({ products: productsWithImages });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Single Product (with images)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Get product by id: ${id}, user: ${req.user?._id || 'none'}, isGuest: ${req.session?.isGuest || false}`);

    const product = await Product.findById(id)
      .populate("brandId", "name imageUrl")
      .populate("mainCategoryId", "name")
      .populate("categoryId", "name")
      .lean();

    if (!product) {
      console.log(`Product not found: ${id}`);
      return res.status(404).json({ msg: "Product not found" });
    }

    const images = await ProductImage.find({ productId: id })
      .sort({ isPrimary: -1, createdAt: -1 })
      .lean();

    const primaryImageUrl =
      images.find((i) => i.isPrimary)?.imageUrl || images[0]?.imageUrl || null;

    console.log(`Product found: ${product.name}, images: ${images.length}`);
    res.json({
      product: {
        ...product,
        images,
        primaryImageUrl,
      },
    });
  } catch (error) {
    console.error("Get product by id error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainCategoryId, categoryId, brandId, name, description, price, stock, isActive, variants, size } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const updateData = {};

    if (brandId !== undefined) {
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ msg: "Brand not found" });
      }
      updateData.brandId = brandId;
    }

    if (mainCategoryId !== undefined) {
      const mainCategory = await MainCategory.findById(mainCategoryId);
      if (!mainCategory) {
        return res.status(404).json({ msg: "Main category not found" });
      }
      updateData.mainCategoryId = mainCategoryId;
    }

    if (categoryId !== undefined) {
      const brandCategory = await ProductCategory.findById(categoryId);
      if (!brandCategory) {
        return res.status(404).json({ msg: "Brand category not found" });
      }
      
      // Validate category belongs to brand
      const finalBrandId = brandId || product.brandId;
      if (brandCategory.brandId.toString() !== finalBrandId.toString()) {
        return res.status(400).json({ msg: "Category does not belong to the selected brand" });
      }
      
      updateData.categoryId = categoryId;
    }

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (size !== undefined) updateData.size = size.trim();
    
    // Handle variants
    if (variants !== undefined) {
      if (Array.isArray(variants)) {
        if (variants.length > 0) {
          const processedVariants = variants.map(variant => {
            if (!variant.size) {
              throw new Error("Variant size is required");
            }
            return {
              size: variant.size.trim(),
              unit: variant.unit && ['mm', 'cm', 'inch'].includes(variant.unit) ? variant.unit : 'mm',
              price: variant.price !== undefined ? parseFloat(variant.price) : (price !== undefined ? parseFloat(price) : product.price),
              stock: variant.stock !== undefined ? parseInt(variant.stock) : 0,
              sku: variant.sku?.trim() || ""
            };
          });
          updateData.variants = processedVariants;
          // Recalculate total stock from variants
          updateData.stock = processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else {
          updateData.variants = [];
        }
      }
    }
    
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ msg: "Price must be greater than or equal to 0" });
      }
      updateData.price = parseFloat(price);
      // If variants exist and no variant prices set, update variant prices
      if (updateData.variants && updateData.variants.length > 0) {
        updateData.variants = updateData.variants.map(v => ({
          ...v,
          price: v.price || parseFloat(price)
        }));
      }
    }
    
    if (stock !== undefined && (!variants || variants.length === 0)) {
      if (stock < 0) {
        return res.status(400).json({ msg: "Stock must be greater than or equal to 0" });
      }
      updateData.stock = parseInt(stock);
    }
    
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('brandId', 'name imageUrl')
      .populate('mainCategoryId', 'name')
      .populate('categoryId', 'name');

    res.json({ msg: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

