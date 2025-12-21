import { useState, useEffect } from "react";
import axios from "axios";
import ProductForm from "./ProductForm";
import { FaSearch } from "react-icons/fa";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMsg, setCsvMsg] = useState("");

  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProducts();
  }, [selectedBrand, selectedCategory]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/admin/brands", {
        withCredentials: true
      });
      setBrands(response.data.brands || []);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/admin/categories", {
        withCredentials: true
      });
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = "/api/admin/products";
      const params = [];
      if (selectedBrand) params.push(`brandId=${selectedBrand}`);
      if (selectedCategory) params.push(`categoryId=${selectedCategory}`);
      if (params.length > 0) url += "?" + params.join("&");

      const response = await axios.get(url, {
        withCredentials: true
      });
      const fetchedProducts = response.data.products || [];
      setAllProducts(fetchedProducts);
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const uploadCsv = async () => {
    if (!csvFile) return;
    setCsvUploading(true);
    setCsvMsg("");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", csvFile);
      const res = await axios.post("/api/admin/products/bulk/csv", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const inserted = res?.data?.insertedCount ?? 0;
      const errorCount = res?.data?.errorCount ?? 0;
      setCsvMsg(`CSV imported: ${inserted} added, ${errorCount} skipped`);
      setCsvFile(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.msg || "CSV upload failed");
    } finally {
      setCsvUploading(false);
    }
  };

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brandId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoryId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filtered);
    }
  }, [searchQuery, allProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`/api/admin/products/${id}`, {
        withCredentials: true
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      <div className="space-y-4">
        {/* CSV Upload */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">Bulk CSV Upload (optional)</div>
              <div className="text-xs text-gray-600 mt-1">
                Columns: <span className="font-mono">brandId, categoryId, name, description, price, stock, isActive</span>
              </div>
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={csvUploading}
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              type="button"
              disabled={!csvFile || csvUploading}
              onClick={uploadCsv}
              className="px-4 py-2 rounded-md bg-slate-700 text-white font-semibold hover:bg-slate-800 disabled:bg-gray-300 disabled:text-gray-600"
            >
              {csvUploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>
          {csvMsg && <div className="mt-2 text-sm text-green-700">{csvMsg}</div>}
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, description, brand, or category..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm font-semibold text-gray-600">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedCategory("");
              setLoading(true);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands
              .filter((brand) => brand.isActive)
              .map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setLoading(true);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedBrand}
          >
            <option value="">All Categories</option>
            {categories
              .filter((cat) => !selectedBrand || cat.brandId?._id === selectedBrand || cat.brandId === selectedBrand)
              .filter((cat) => cat.isActive)
              .map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <ProductForm
            product={editingProduct}
            brands={brands}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  <div className="text-lg">No products found</div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-blue-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.brandId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.categoryId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{product.price?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;

