import { useState, useEffect } from "react";
import { FaTimes, FaHeart, FaPlus, FaMinus, FaTrash, FaShoppingCart } from "react-icons/fa";
import { enhanceImageUrl } from "../utils/imageUtils";

const Wishlist = ({ onClose }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Allow other pages to force-refresh wishlist (e.g. after adding an item)
  useEffect(() => {
    const onRefresh = () => fetchWishlist();
    window.addEventListener("wishlist:refresh", onRefresh);
    return () => window.removeEventListener("wishlist:refresh", onRefresh);
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist || []);
        window.dispatchEvent(new Event("wishlist:changed"));
      } else {
        setError("Failed to load wishlist");
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      setError("Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist || []);
        window.dispatchEvent(new Event("wishlist:changed"));
      } else {
        const errorData = await res.json();
        setError(errorData.msg || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      setError("Unable to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist || []);
        window.dispatchEvent(new Event("wishlist:changed"));
      } else {
        setError("Failed to remove item");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      setError("Unable to remove item");
    }
  };

  const handleQuantityChange = (productId, currentQuantity, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateQuantity(productId, numValue);
    }
  };

  const calculateTotal = () => {
    return wishlist.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateItemCount = () => {
    return wishlist.reduce((count, item) => count + item.quantity, 0);
  };

  const handleBookInquiry = async (item) => {
    if (submittingInquiry[item.productId]) return;

    try {
      setSubmittingInquiry(prev => ({ ...prev, [item.productId]: true }));
      setError("");
      setSuccess("");

      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Inquiry submitted for ${item.name}! Admin will check stock and notify you.`);
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.msg || "Failed to submit inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Book inquiry error:", error);
      setError("Unable to submit inquiry. Please try again later.");
    } finally {
      setSubmittingInquiry(prev => ({ ...prev, [item.productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="text-lg">Loading wishlist...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaHeart className="text-red-500 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
            {wishlist.length > 0 && (
              <span className="bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded-full">
                {calculateItemCount()} {calculateItemCount() === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-full"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Wishlist Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your wishlist is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add products to your wishlist to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={enhanceImageUrl(item.imageUrl, { width: 600, quality: 90, format: 'auto', dpr: 2 })}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector("[data-img-fallback='true']")) {
                            const div = document.createElement("div");
                            div.setAttribute("data-img-fallback", "true");
                            div.className =
                              "absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-gray-700 bg-gray-100";
                            div.textContent = "Image not available";
                            parent.classList.add("relative");
                            parent.appendChild(div);
                          }
                        }}
                      />
                    ) : (
                      <div className="text-xs font-semibold text-gray-600 text-center px-2">
                        Image not available
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{item.name}</h3>
                    {item.brandName && (
                      <p className="text-sm text-gray-500">Brand: {item.brandName}</p>
                    )}
                    {item.categoryName && (
                      <p className="text-sm text-gray-500">Category: {item.categoryName}</p>
                    )}
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, item.quantity, e.target.value)}
                      onBlur={(e) => {
                        if (!e.target.value || parseInt(e.target.value) < 1) {
                          updateQuantity(item.productId, 1);
                        }
                      }}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[120px]">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleBookInquiry(item)}
                      disabled={submittingInquiry[item.productId]}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                      title="Book Inquiry"
                    >
                      <FaShoppingCart className="text-sm" />
                      {submittingInquiry[item.productId] ? "Submitting..." : "Book Inquiry"}
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                      title="Remove from wishlist"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Summary Footer */}
        {wishlist.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{calculateItemCount()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{calculateTotal().toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-500 text-center">
                * Prices are indicative and may vary. Contact us for final pricing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

