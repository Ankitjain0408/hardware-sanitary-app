import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../utils/httpClient";
import { FaArrowLeft, FaShoppingBag, FaHeart, FaSearch, FaDownload } from "react-icons/fa";
import { GridSkeleton } from "../components/Skeletons";
import { enhanceImageUrl } from "../utils/imageUtils";
import { apiFetch } from "../utils/httpClient";

const ExploreByProduct = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brandId") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") || "");
  const [selectedMainCategory, setSelectedMainCategory] = useState(searchParams.get("mainCategoryId") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("inStock") === "true" || searchParams.get("inStock") === "1"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [wishlistQtyByProductId, setWishlistQtyByProductId] = useState({});
  const [selectedBrandData, setSelectedBrandData] = useState(null);
  const [showCatalogNotification, setShowCatalogNotification] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProducts();
  }, [selectedBrand, selectedCategory, selectedMainCategory, searchQuery, sortBy, inStockOnly]);

  // Fetch selected brand data for catalog
  useEffect(() => {
    if (selectedBrand) {
      const brand = brands.find(b => b._id === selectedBrand);
      setSelectedBrandData(brand || null);
    } else {
      setSelectedBrandData(null);
    }
  }, [selectedBrand, brands]);

  const fetchWishlist = async () => {
    try {
      const res = await apiFetch("/api/wishlist", {});
      if (!res.ok) return;
      const data = await res.json();
      const items = data.wishlist || [];
      const map = {};
      for (const it of items) {
        if (it?.productId) map[it.productId] = Number(it.quantity) || 0;
      }
      setWishlistQtyByProductId(map);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchWishlist();
    const onRefresh = () => fetchWishlist();
    window.addEventListener("wishlist:refresh", onRefresh);
    return () => window.removeEventListener("wishlist:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync (so search works via link sharing and admin dashboard search param)
  useEffect(() => {
    const next = {};
    if (selectedBrand) next.brandId = selectedBrand;
    if (selectedCategory) next.categoryId = selectedCategory;
    if (selectedMainCategory) next.mainCategoryId = selectedMainCategory;
    if (searchQuery.trim()) next.search = searchQuery.trim();
    if (sortBy && sortBy !== "newest") next.sort = sortBy;
    if (inStockOnly) next.inStock = "true";
    setSearchParams(next, { replace: true });
  }, [selectedBrand, selectedCategory, selectedMainCategory, searchQuery, sortBy, inStockOnly, setSearchParams]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/brands?isActive=true", {
        withCredentials: true
      });
      setBrands(response.data.brands || []);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories?isActive=true", {
        withCredentials: true
      });
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = "/api/products?isActive=true";
      const params = [];
      if (selectedBrand) params.push(`brandId=${selectedBrand}`);
      if (selectedCategory) params.push(`categoryId=${selectedCategory}`);
      if (selectedMainCategory) params.push(`mainCategoryId=${selectedMainCategory}`);
      if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (sortBy) params.push(`sort=${encodeURIComponent(sortBy)}`);
      if (inStockOnly) params.push(`inStock=true`);
      if (params.length > 0) url += "&" + params.join("&");

      const response = await axios.get(url, {
        withCredentials: true
      });
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    setAddingToWishlist({ ...addingToWishlist, [product._id]: true });
    try {
      const response = await apiFetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.primaryImageUrl || product.images?.[0]?.imageUrl || null,
          brandName: product.brandId?.name || null,
          categoryName: product.categoryId?.name || null,
        }),
      });

      if (response.ok) {
        // Show notification and refresh wishlist data (without opening modal)
        window.dispatchEvent(
          new CustomEvent("wishlist:added", {
            detail: { message: `"${product.name}" added to wishlist` },
          })
        );
        window.dispatchEvent(new Event("wishlist:refresh"));
        setWishlistQtyByProductId((prev) => ({
          ...prev,
          [product._id]: (Number(prev[product._id]) || 0) + 1,
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.msg || "Failed to add to wishlist");
      }
    } catch (err) {
      console.error("Add to wishlist error:", err);
      setError("Unable to add to wishlist");
    } finally {
      setAddingToWishlist({ ...addingToWishlist, [product._id]: false });
    }
  };

  const setWishlistQuantity = async (product, nextQty) => {
    const pid = product._id;
    setAddingToWishlist((prev) => ({ ...prev, [pid]: true }));
    try {
      if (nextQty <= 0) {
        const res = await apiFetch(`/api/wishlist/${pid}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.msg || "Failed to remove from wishlist");
          return;
        }
        setWishlistQtyByProductId((prev) => {
          const copy = { ...prev };
          delete copy[pid];
          return copy;
        });
        window.dispatchEvent(new Event("wishlist:refresh"));
        return;
      }

      const res = await apiFetch(`/api/wishlist/${pid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQty }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.msg || "Failed to update wishlist");
        return;
      }
      setWishlistQtyByProductId((prev) => ({ ...prev, [pid]: nextQty }));
      window.dispatchEvent(new Event("wishlist:refresh"));
    } catch {
      setError("Unable to update wishlist");
    } finally {
      setAddingToWishlist((prev) => ({ ...prev, [pid]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-slate-700 mb-6"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Explore Products</h1>
            {selectedBrandData && (
              <button
                onClick={async () => {
                  if (selectedBrandData.catalogUrl) {
                    try {
                      // Track download in backend
                      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
                      try {
                        const trackRes = await fetch(`${apiBase}/api/admin/brands/${selectedBrandData._id}/catalog/download`, {
                          method: 'GET',
                          credentials: 'include'
                        });
                        if (!trackRes.ok) {
                          console.warn('Catalog download tracking failed:', trackRes.status, trackRes.statusText);
                        }
                      } catch (trackError) {
                        console.warn('Catalog download tracking error:', trackError);
                        // Still allow download even if tracking fails
                      }

                      // Download the catalog
                      const response = await fetch(selectedBrandData.catalogUrl);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${selectedBrandData.name.replace(/\s+/g, '_')}_Catalog.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error downloading catalog:', error);
                      // Fallback: open in new tab
                      window.open(selectedBrandData.catalogUrl, '_blank', 'noopener,noreferrer');
                    }
                  } else {
                    setShowCatalogNotification(true);
                    setTimeout(() => setShowCatalogNotification(false), 3000);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-semibold"
              >
                <FaDownload /> Download Catalog
              </button>
            )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLoading(true);
                }}
                placeholder="Search by product, brand, or category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(searchQuery || selectedBrand || selectedCategory) && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing <span className="font-semibold">{products.length}</span> result{products.length !== 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBrand("");
                    setSelectedCategory("");
                    setSortBy("newest");
                    setInStockOnly(false);
                    setLoading(true);
                  }}
                  className="text-slate-700 hover:text-slate-900 font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sort + Filters - All in one line with corner alignment */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          {/* Left side - Sort and In stock checkbox */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setLoading(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Stock: High to Low</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setLoading(true);
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              In stock only
            </label>
          </div>

          {/* Right side - Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedCategory("");
              setLoading(true);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
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
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedBrand}
          >
            <option value="">All Categories</option>
            {categories
              .filter((cat) => !selectedBrand || cat.brandId?._id === selectedBrand || cat.brandId === selectedBrand)
              .map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Catalog Notification Popup */}
        {showCatalogNotification && (
          <div 
            className="fixed top-20 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-w-sm"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-lg">⚠</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Catalog Not Available</h3>
                <p className="text-sm text-gray-600">
                  {selectedBrandData?.name ? `No catalog available for ${selectedBrandData.name}` : "No catalog available for this brand"}
                </p>
              </div>
              <button
                onClick={() => setShowCatalogNotification(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <GridSkeleton items={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingBag className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No products found</p>
            <p className="mt-2 text-sm text-gray-500">
              Try searching <span className="font-semibold">tap</span>, <span className="font-semibold">basin</span>,{" "}
              <span className="font-semibold">pipe</span>, or clear filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all block"
              >
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {product.primaryImageUrl || product.images?.[0]?.imageUrl ? (
                    <img
                      src={enhanceImageUrl(product.primaryImageUrl || product.images?.[0]?.imageUrl, { width: 1200, quality: 100, format: 'auto', dpr: 2 })}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        // Show text fallback instead of broken image
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector("[data-img-fallback='true']")) {
                          const div = document.createElement("div");
                          div.setAttribute("data-img-fallback", "true");
                          div.className =
                            "absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700 bg-gray-100";
                          div.textContent = "Image not available";
                          parent.classList.add("relative");
                          parent.appendChild(div);
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700 bg-gray-100">
                      Image not available
                    </div>
                  )}
                  {/* Soft overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none"></div>
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {product.brandId?.imageUrl ? (
                        <img
                          src={product.brandId.imageUrl}
                          alt={product.brandId?.name || "Brand"}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                    </div>
                    <span className="text-xs text-gray-500">{product.brandId?.name || "N/A"}</span>
                    <span className="text-xs text-gray-400 mx-2">•</span>
                    <span className="text-xs text-gray-500">{product.categoryId?.name || "N/A"}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{product.price?.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        product.stock > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {product.stock > 0 ? `In Stock` : "Out of Stock"}
                      </span>
                    </div>
                    {/* Show size info if available */}
                    {product.variants && product.variants.length > 0 ? (
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold">Sizes:</span>{" "}
                        {product.variants.slice(0, 3).map((v, i) => (
                          <span key={i}>
                            {v.size} {v.unit || 'mm'}
                            {i < Math.min(product.variants.length, 3) - 1 && ", "}
                          </span>
                        ))}
                        {product.variants.length > 3 && (
                          <span className="text-gray-500"> +{product.variants.length - 3} more</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 mt-1">
                        Size: {product.size ? (
                          <span className="font-semibold">{product.size} {product.sizeUnit || 'mm'}</span>
                        ) : (
                          <span className="text-gray-500">No variant</span>
                        )}
                      </div>
                    )}
                  </div>
                  {wishlistQtyByProductId[product._id] > 0 ? (
                    <div className="mt-3 flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-sm font-semibold text-gray-800">Wishlist Qty</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const current = wishlistQtyByProductId[product._id] || 0;
                            setWishlistQuantity(product, current - 1);
                          }}
                          disabled={addingToWishlist[product._id]}
                          className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-800 font-bold hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease wishlist quantity"
                        >
                          −
                        </button>
                        <div className="min-w-8 text-center font-bold text-gray-900">
                          {wishlistQtyByProductId[product._id]}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const current = wishlistQtyByProductId[product._id] || 0;
                            setWishlistQuantity(product, current + 1);
                          }}
                          disabled={addingToWishlist[product._id]}
                          className="h-9 w-9 rounded-lg bg-white border border-gray-200 text-gray-800 font-bold hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Increase wishlist quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToWishlist(product);
                      }}
                      disabled={addingToWishlist[product._id] || product.stock <= 0}
                      className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition shadow-sm"
                    >
                      <FaHeart />
                      {addingToWishlist[product._id] ? "Adding..." : "Add to Wishlist"}
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreByProduct;

