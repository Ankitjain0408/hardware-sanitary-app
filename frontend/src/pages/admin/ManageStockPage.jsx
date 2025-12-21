import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaMinus, FaPlus, FaSearch } from "react-icons/fa";

const ManageStockPage = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingById, setSavingById] = useState({});
  const [error, setError] = useState("");

  // Local editable stock values
  const [stockDraftById, setStockDraftById] = useState({});

  const fetchBrands = async () => {
    const res = await axios.get("/api/admin/brands", { withCredentials: true });
    setBrands(res.data.brands || []);
  };

  const fetchCategories = async (brandId) => {
    const url = brandId ? `/api/admin/categories?brandId=${brandId}` : "/api/admin/categories";
    const res = await axios.get(url, { withCredentials: true });
    setCategories(res.data.categories || []);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/api/admin/products?isActive=true";
      const params = [];
      if (selectedBrand) params.push(`brandId=${selectedBrand}`);
      if (selectedCategory) params.push(`categoryId=${selectedCategory}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (params.length) url += "&" + params.join("&");

      const res = await axios.get(url, { withCredentials: true });
      const items = res.data.products || [];
      setProducts(items);

      // Initialize drafts for new items only (preserve current typing)
      setStockDraftById((prev) => {
        const next = { ...prev };
        for (const p of items) {
          if (next[p._id] === undefined) next[p._id] = Number(p.stock) || 0;
        }
        // Drop drafts for items no longer shown
        for (const id of Object.keys(next)) {
          if (!items.some((p) => p._id === id)) delete next[id];
        }
        return next;
      });
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchBrands();
        await fetchCategories("");
      } catch (e) {
        setError(e?.response?.data?.msg || "Failed to load filters");
      }
    })();
  }, []);

  useEffect(() => {
    fetchCategories(selectedBrand);
    // Reset category when brand changes
    setSelectedCategory("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand]);

  // Fetch products whenever filters change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedCategory, search]);

  const filteredCategories = useMemo(() => {
    if (!selectedBrand) return categories;
    return categories.filter((c) => String(c.brandId?._id || c.brandId) === String(selectedBrand));
  }, [categories, selectedBrand]);

  const setDraft = (productId, nextVal) => {
    const safe = Number.isFinite(nextVal) ? Math.max(0, Math.floor(nextVal)) : 0;
    setStockDraftById((prev) => ({ ...prev, [productId]: safe }));
  };

  const saveStock = async (product) => {
    const id = product._id;
    const nextStock = Number(stockDraftById[id]) || 0;
    setSavingById((prev) => ({ ...prev, [id]: true }));
    setError("");
    try {
      const res = await axios.put(
        `/api/admin/products/${id}`,
        { stock: nextStock },
        { withCredentials: true }
      );
      const updated = res.data.product;
      setProducts((prev) => prev.map((p) => (p._id === id ? updated : p)));
      setStockDraftById((prev) => ({ ...prev, [id]: Number(updated.stock) || 0 }));
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to update stock");
    } finally {
      setSavingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Manage Stock</h1>
            <p className="text-gray-600 mt-1">Filter products and adjust stock using + / – then Save.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedBrand}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
              >
                <option value="">{selectedBrand ? "All Categories" : "Select a brand first"}</option>
                {filteredCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Product</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by product name..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> product
              {products.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-600">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-gray-600">No products found for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Brand / Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((p) => {
                    const draft = stockDraftById[p._id] ?? (Number(p.stock) || 0);
                    const saving = !!savingById[p._id];
                    return (
                      <tr key={p._id}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">₹{Number(p.price || 0).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>{p.brandId?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{p.categoryId?.name || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={saving || draft <= 0}
                              onClick={() => setDraft(p._id, draft - 1)}
                              className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-800 font-bold hover:bg-gray-100 disabled:opacity-50"
                              aria-label="Decrease stock"
                            >
                              <FaMinus className="mx-auto text-xs" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={draft}
                              disabled={saving}
                              onChange={(e) => setDraft(p._id, parseInt(e.target.value || "0", 10))}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => setDraft(p._id, draft + 1)}
                              className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-800 font-bold hover:bg-gray-100 disabled:opacity-50"
                              aria-label="Increase stock"
                            >
                              <FaPlus className="mx-auto text-xs" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            disabled={saving || Number(p.stock) === Number(draft)}
                            onClick={() => saveStock(p)}
                            className="px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageStockPage;


