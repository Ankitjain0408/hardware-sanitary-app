import Product from "../models/Product.js";
import Brand from "../models/Brand.js";
import ProductCategory from "../models/ProductCategory.js";
import { parse } from "csv-parse/sync";

// CSV columns supported:
// brandId, categoryId, name, description, price, stock, isActive
export const bulkUploadProductsCsv = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ msg: "CSV file is required" });

    const csvText = file.buffer.toString("utf-8");
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ msg: "CSV has no rows" });
    }

    const errors = [];
    const docs = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i] || {};
      const rowNum = i + 2; // header is line 1

      const brandId = String(row.brandId || "").trim();
      const categoryId = String(row.categoryId || "").trim();
      const name = String(row.name || "").trim();
      const description = String(row.description || "").trim();
      const priceRaw = row.price;
      const stockRaw = row.stock;
      const isActiveRaw = row.isActive;

      if (!brandId || !categoryId || !name || priceRaw === undefined || priceRaw === "") {
        errors.push({ row: rowNum, error: "brandId, categoryId, name, and price are required" });
        continue;
      }

      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price < 0) {
        errors.push({ row: rowNum, error: "price must be a non-negative number" });
        continue;
      }

      const stock = stockRaw === undefined || stockRaw === "" ? 0 : Number(stockRaw);
      if (!Number.isFinite(stock) || stock < 0) {
        errors.push({ row: rowNum, error: "stock must be a non-negative number" });
        continue;
      }

      const isActive =
        isActiveRaw === undefined || isActiveRaw === ""
          ? true
          : String(isActiveRaw).toLowerCase() === "true" || String(isActiveRaw) === "1";

      docs.push({
        brandId,
        categoryId,
        name,
        description,
        price,
        stock: Math.floor(stock),
        isActive,
      });
    }

    // Validate referenced brand/category exist & relationship matches
    const brandIds = [...new Set(docs.map((d) => d.brandId))];
    const categoryIds = [...new Set(docs.map((d) => d.categoryId))];

    const [brands, categories] = await Promise.all([
      Brand.find({ _id: { $in: brandIds } }).select("_id").lean(),
      ProductCategory.find({ _id: { $in: categoryIds } }).select("_id brandId").lean(),
    ]);

    const brandSet = new Set(brands.map((b) => String(b._id)));
    const categoryMap = new Map(categories.map((c) => [String(c._id), String(c.brandId)]));

    const validDocs = [];
    for (let i = 0; i < docs.length; i++) {
      const d = docs[i];
      const rowNum = i + 2;
      if (!brandSet.has(String(d.brandId))) {
        errors.push({ row: rowNum, error: "brandId not found" });
        continue;
      }
      const catBrand = categoryMap.get(String(d.categoryId));
      if (!catBrand) {
        errors.push({ row: rowNum, error: "categoryId not found" });
        continue;
      }
      if (String(catBrand) !== String(d.brandId)) {
        errors.push({ row: rowNum, error: "categoryId does not belong to brandId" });
        continue;
      }

      validDocs.push({
        brandId: d.brandId,
        categoryId: d.categoryId,
        name: d.name.trim(),
        description: d.description || "",
        price: d.price,
        stock: d.stock,
        isActive: d.isActive,
      });
    }

    if (validDocs.length === 0) {
      return res.status(400).json({ msg: "No valid rows to import", errors });
    }

    const inserted = await Product.insertMany(validDocs, { ordered: false });

    res.status(201).json({
      msg: "CSV import completed",
      insertedCount: inserted.length,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
    });
  } catch (error) {
    console.error("Bulk CSV upload error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


