import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { enhanceImageUrl } from "../utils/imageUtils";
import { apiFetch } from "../utils/httpClient";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [wishlistQty, setWishlistQty] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("Loading product with id:", id);
        if (!id) {
          setError("Product ID is missing");
          setLoading(false);
          return;
        }
        const res = await apiFetch(`/api/products/${id}`, {});
        console.log("Product API response status:", res.status);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("Product load error:", res.status, data);
          if (res.status === 401) {
            setError("Please login or continue as guest to view products");
          } else if (res.status === 404) {
            setError("Product not found");
          } else {
            setError(data.msg || `Failed to load product (${res.status})`);
          }
          setProduct(null);
          return;
        }
        const data = await res.json();
        setProduct(data.product);
        setActiveIdx(0);
        setWishlistQty(0);
        setMainImageError(false);
        setThumbErrors({});
      } catch (error) {
        console.error("Product load error:", error);
        setError("Failed to load product. Please check your connection.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const fetchWishlistQty = async () => {
    try {
      const res = await apiFetch("/api/wishlist", {});
      if (!res.ok) return;
      const data = await res.json();
      const items = data.wishlist || [];
      const found = items.find((it) => String(it.productId) === String(id));
      setWishlistQty(Number(found?.quantity) || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchWishlistQty();
    const onRefresh = () => fetchWishlistQty();
    window.addEventListener("wishlist:refresh", onRefresh);
    return () => window.removeEventListener("wishlist:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const images = useMemo(() => product?.images || [], [product]);
  const currentImage = images[activeIdx]?.imageUrl || product?.primaryImageUrl || null;

  useEffect(() => {
    // Reset main image error when switching images
    setMainImageError(false);
  }, [activeIdx, currentImage]);

  const go = (nextIdx) => {
    if (!images.length) return;
    const bounded = ((nextIdx % images.length) + images.length) % images.length;
    setActiveIdx(bounded);
  };

  const addToWishlist = async () => {
    if (!product) return;
    setAdding(true);
    try {
      const res = await apiFetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          name: product.name + (selectedVariant 
            ? ` - ${selectedVariant.size} ${selectedVariant.unit || 'mm'}` 
            : product.size 
            ? ` - ${product.size} ${product.sizeUnit || 'mm'}` 
            : ""),
          price: selectedVariant?.price || product.price,
          imageUrl: product.primaryImageUrl || product.images?.[0]?.imageUrl || null,
          brandName: product.brandId?.name || null,
          categoryName: product.categoryId?.name || null,
          variantSize: selectedVariant ? `${selectedVariant.size} ${selectedVariant.unit || 'mm'}` : (product.size ? `${product.size} ${product.sizeUnit || 'mm'}` : null),
        }),
      });

      if (res.ok) {
        window.dispatchEvent(
          new CustomEvent("wishlist:added", {
            detail: { message: `"${product.name}" added to wishlist` },
          })
        );
        window.dispatchEvent(new Event("wishlist:refresh"));
        setWishlistQty((q) => (Number(q) || 0) + 1);
      } else {
        const data = await res.json().catch(() => ({}));
        window.dispatchEvent(
          new CustomEvent("wishlist:added", {
            detail: { message: data.msg || "Failed to add to wishlist" },
          })
        );
      }
    } finally {
      setAdding(false);
    }
  };

  const setWishlistQuantity = async (nextQty) => {
    if (!product) return;
    setAdding(true);
    try {
      if (nextQty <= 0) {
        const res = await apiFetch(`/api/wishlist/${product._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.msg || "Failed to remove from wishlist");
          return;
        }
        setWishlistQty(0);
        window.dispatchEvent(new Event("wishlist:refresh"));
        return;
      }

      const res = await apiFetch(`/api/wishlist/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQty }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.msg || "Failed to update wishlist");
        return;
      }
      setWishlistQty(nextQty);
      window.dispatchEvent(new Event("wishlist:refresh"));
    } catch {
      setError("Unable to update wishlist");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="w-full aspect-[4/3] bg-gray-200 rounded-3xl animate-pulse" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="h-10 w-3/4 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-6 w-1/2 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-24 w-full bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/explore/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-slate-700">
            <FaArrowLeft /> Back to Products
          </Link>
          <div className="mt-6 bg-red-100 border border-red-300 text-red-700 p-4 rounded-2xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/explore/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-slate-700">
            <FaArrowLeft /> Back to Products
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("wishlist:open"))}
            className="px-4 py-2 rounded-xl bg-white ring-1 ring-gray-200 shadow-sm hover:shadow transition text-gray-800 font-semibold"
          >
            View Wishlist
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Images */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-200/60 overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
                {currentImage && !mainImageError ? (
                  <img
                    src={enhanceImageUrl(currentImage, { width: 2000, quality: 100, format: 'auto', dpr: 2 })}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={() => setMainImageError(true)}
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700 bg-gray-100">
                    Image not available
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(activeIdx - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center"
                      aria-label="Previous image"
                    >
                      <FaChevronLeft className="text-gray-800" />
                    </button>
                    <button
                      type="button"
                      onClick={() => go(activeIdx + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/85 hover:bg-white shadow flex items-center justify-center"
                      aria-label="Next image"
                    >
                      <FaChevronRight className="text-gray-800" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-3 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={img._id || idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={`flex-shrink-0 w-20 aspect-[4/3] rounded-xl overflow-hidden ring-2 transition ${
                          idx === activeIdx ? "ring-blue-500" : "ring-transparent hover:ring-gray-200"
                        }`}
                      >
                        {thumbErrors[idx] ? (
                          <div className="w-full h-full flex items-center justify-center text-[11px] font-semibold text-gray-700 bg-gray-100">
                            No image
                          </div>
                        ) : (
                          <img
                            src={enhanceImageUrl(img.imageUrl, { width: 400, quality: 90, format: 'auto', dpr: 2 })}
                            alt=""
                            className="w-full h-full object-contain p-1 bg-gray-50"
                            onError={() => setThumbErrors((prev) => ({ ...prev, [idx]: true }))}
                            loading="lazy"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-200/60 p-6">
              <div className="text-sm text-gray-500">
                {product.brandId?.name || "N/A"} • {product.categoryId?.name || "N/A"}
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{product.name}</h1>

              {/* Price Display - Always visible */}
              <div className="mt-4">
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-extrabold text-blue-600">
                    ₹{(selectedVariant?.price || product.price)?.toFixed(2)}
                  </div>
                  {selectedVariant && selectedVariant.price !== product.price && (
                    <div className="text-xl text-gray-400 line-through">
                      ₹{product.price?.toFixed(2)}
                    </div>
                  )}
                </div>
                {selectedVariant && (
                  <p className="text-sm text-gray-600 mt-1">
                    Price for {selectedVariant.size} {selectedVariant.unit || 'mm'}
                  </p>
                )}
              </div>

              {/* Stock Status - Always visible */}
              <div className="mt-4 flex items-center justify-between">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    (selectedVariant ? (selectedVariant.stock || 0) : product.stock) > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {(selectedVariant ? (selectedVariant.stock || 0) : product.stock) > 0
                    ? `In Stock (${selectedVariant ? selectedVariant.stock : product.stock})`
                    : "Out of Stock"}
                </div>
              </div>

              {/* Size/Variant Selection */}
              {product.variants && product.variants.length > 0 ? (
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Select Size <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {product.variants.map((variant, idx) => {
                      const isSelected = selectedVariant?.size === variant.size && selectedVariant?.unit === variant.unit;
                      const isOutOfStock = (variant.stock || 0) <= 0;
                      const unit = variant.unit || 'mm';
                      const variantPrice = variant.price || product.price;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          disabled={isOutOfStock}
                          className={`relative p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-md scale-105"
                              : isOutOfStock
                              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                              : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 mb-1">
                              {variant.size} <span className="text-sm text-gray-600">{unit}</span>
                            </div>
                            <div className={`text-sm font-semibold ${
                              isSelected ? "text-blue-700" : "text-gray-600"
                            }`}>
                              ₹{variantPrice.toFixed(2)}
                            </div>
                            {isOutOfStock && (
                              <div className="text-xs text-red-500 mt-1 font-medium">Out of Stock</div>
                            )}
                            {(variant.stock || 0) > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                {variant.stock} available
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {!selectedVariant && (
                    <p className="mt-3 text-sm text-amber-600 font-medium">
                      ⚠ Please select a size to continue
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Size: </span>
                    {product.size ? (
                      <span className="text-sm font-bold text-gray-900">{product.size} {product.sizeUnit || 'mm'}</span>
                    ) : (
                      <span className="text-sm text-gray-600">No variant</span>
                    )}
                  </div>
                </div>
              )}

              {product.description ? (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-2">Description</div>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              ) : null}

              {/* Wishlist Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {wishlistQty > 0 ? (
                  <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-pink-50 to-blue-50 border-2 border-pink-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FaHeart className="text-pink-600 text-xl" />
                      <div>
                        <span className="text-sm font-semibold text-gray-800 block">In Wishlist</span>
                        {selectedVariant && (
                          <span className="text-xs text-gray-600">
                            {selectedVariant.size} {selectedVariant.unit || 'mm'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setWishlistQuantity(wishlistQty - 1)}
                        disabled={adding}
                        className="h-10 w-10 rounded-xl bg-white border-2 border-gray-300 text-gray-800 font-bold hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 transition"
                        aria-label="Decrease wishlist quantity"
                      >
                        −
                      </button>
                      <div className="min-w-12 text-center font-extrabold text-gray-900 text-lg">{wishlistQty}</div>
                      <button
                        type="button"
                        onClick={() => setWishlistQuantity(wishlistQty + 1)}
                        disabled={adding || (selectedVariant ? (selectedVariant.stock || 0) <= 0 : product.stock <= 0)}
                        className="h-10 w-10 rounded-xl bg-white border-2 border-gray-300 text-gray-800 font-bold hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 transition"
                        aria-label="Increase wishlist quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={addToWishlist}
                    disabled={adding || (product.variants && product.variants.length > 0 && !selectedVariant) || (selectedVariant ? (selectedVariant.stock || 0) <= 0 : product.stock <= 0)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <FaHeart className="text-lg" />
                    <span>
                      {adding
                        ? "Adding..."
                        : product.variants && product.variants.length > 0 && !selectedVariant
                        ? "Please Select a Size First"
                        : "Add to Wishlist"}
                    </span>
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Tip: Use the navbar search to find similar products by brand or category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


