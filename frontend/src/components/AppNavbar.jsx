import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaSearch, FaHeart, FaUserCircle, FaChevronDown, FaTimes, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

function AppNavbar({ onContactUsClick, onServiceSupportClick, onLoginClick, user, onLogout, onWishlistClick, wishlistCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ brands: [], categories: [], products: [] });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Debounced search suggestions (top matches)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestOpen(false);
      setSuggestions({ brands: [], categories: [], products: [] });
      return;
    }

    const t = setTimeout(async () => {
      try {
        setSuggestLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions({
          brands: data.brands || [],
          categories: data.categories || [],
          products: data.products || [],
        });
        setSuggestOpen(true);
      } catch {
        // ignore
      } finally {
        setSuggestLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsMenuOpen(false);
    setSuggestOpen(false);
    navigate(`/explore/products?search=${encodeURIComponent(q)}`);
  };

  const isActivePath = (path) => {
    if (!path || typeof path !== "string") return false;
    return location.pathname === path || location.pathname.startsWith(path + "/") || location.pathname.startsWith(path);
  };

  const goBrand = (brand) => {
    setSuggestOpen(false);
    setIsMenuOpen(false);
    navigate(`/explore/products?brandId=${brand._id}`);
  };

  const goCategory = (category) => {
    setSuggestOpen(false);
    setIsMenuOpen(false);
    navigate(`/explore/products?categoryId=${category._id}`);
  };

  const goProduct = (product) => {
    setSuggestOpen(false);
    setIsMenuOpen(false);
    navigate(`/product/${product._id}`);
  };

  const menuItems = {
    "Explore by Brand": "/explore/brands",
    "Explore by Category": "/explore/categories",
    "Explore by Products": "/explore/products",
    "Store Location": "https://maps.app.goo.gl/NfFXifFgZvyJqhiL8",
    "About Us": "/about",
    "Reviews & Ratings": "/reviews",
    "My Inquiries": "/my-inquiries",
    "Contact Us": "/contact",
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-gray-200 shadow-sm"
          : "bg-white/20 backdrop-blur-sm border-b border-white/30"
      }`}
    >
      {/* Top Bar */}
      <div className="w-full min-h-16 py-2 px-4 sm:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        {/* LEFT: MENU */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer hover:text-slate-900 transition"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
          <span className="hidden sm:inline">MENU</span>
        </button>

        {/* CENTER: BRAND (click to go home) */}
        <Link
          to="/"
          onClick={() => setIsMenuOpen(false)}
          className="text-center leading-tight cursor-pointer select-none"
          title="Go to Home"
        >
          <div
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-[0.14em] sm:tracking-[0.16em] text-slate-600 uppercase leading-none"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            SHRI KRISHNA
          </div>
          <div className="hidden md:block text-sm lg:text-base tracking-widest text-slate-500 font-semibold mt-1">
            Hardware &amp; Sanitary
          </div>
        </Link>

        {/* RIGHT: ICONS */}
        <div className="flex items-center justify-end gap-3 text-xl text-slate-700">
          {/* Search bar (desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-72 pl-9 pr-3 py-2 text-sm rounded-full border border-slate-400 bg-white/95 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 shadow-md hover:shadow-lg transition-shadow"
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setSuggestOpen(true);
                }}
              />

              {/* Suggestions dropdown */}
              {(suggestOpen || suggestLoading) && (
                <div className="absolute mt-2 w-full rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden z-50">
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs font-semibold text-gray-600">Top matches</span>
                      {suggestLoading && <span className="text-xs text-gray-500">Searching...</span>}
        </div>

                    {(suggestions.brands.length === 0 &&
                      suggestions.categories.length === 0 &&
                      suggestions.products.length === 0 &&
                      !suggestLoading) && (
                      <div className="px-2 py-3 text-sm text-gray-500">No matches</div>
                    )}

                    {suggestions.brands.length > 0 && (
                      <div className="mt-2">
                        <div className="px-2 text-xs font-semibold text-gray-500">Brands</div>
                        <div className="mt-1">
                          {suggestions.brands.map((b) => (
                            <button
                              key={b._id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => goBrand(b)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.categories.length > 0 && (
                      <div className="mt-2">
                        <div className="px-2 text-xs font-semibold text-gray-500">Categories</div>
                        <div className="mt-1">
                          {suggestions.categories.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => goCategory(c)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {suggestions.products.length > 0 && (
                      <div className="mt-2">
                        <div className="px-2 text-xs font-semibold text-gray-500">Products</div>
                        <div className="mt-1">
                          {suggestions.products.map((p) => (
                            <button
                              key={p._id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => goProduct(p)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800 flex items-center gap-3"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {p.primaryImageUrl ? (
                                  <img
                                    src={p.primaryImageUrl}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const parent = e.currentTarget.parentElement;
                                      if (parent && !parent.querySelector("[data-img-fallback='true']")) {
                                        const div = document.createElement("div");
                                        div.setAttribute("data-img-fallback", "true");
                                        div.className =
                                          "absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-700 bg-gray-100";
                                        div.textContent = "No image";
                                        parent.classList.add("relative");
                                        parent.appendChild(div);
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{p.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {p.brandId?.name || "N/A"} • {p.categoryId?.name || "N/A"}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
          <button
            type="button"
            className="relative cursor-pointer hover:text-red-500 transition"
            onClick={() => onWishlistClick && onWishlistClick()}
            title="Wishlist"
            aria-label="Wishlist"
          >
            <FaHeart />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </button>
          {user && !user.isGuest && <NotificationBell userId={user._id} />}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/my-inquiries"
                className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-blue-600 transition max-w-32 truncate"
                title="My Inquiries"
              >
                {user.isGuest ? "Guest" : (user.username || user.email || user.name)}
              </Link>
              <FaSignOutAlt 
                className="cursor-pointer hover:text-slate-500 transition" 
                onClick={() => onLogout && onLogout()}
                title="Logout"
              />
            </div>
          ) : (
            <FaUserCircle 
              className="cursor-pointer hover:text-slate-500 transition" 
              onClick={() => onLoginClick && onLoginClick()}
            />
          )}
        </div>
      </div>

      {/* Menu Overlay - Half Width, Full Height - Rendered via Portal */}
      {isMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Dark overlay on the right side */}
          <div
            className="fixed right-0 top-0 bottom-0 left-0 bg-black/40 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }}
          ></div>
          
          {/* Menu Panel - Left Quarter, Full Height */}
          <div className="fixed left-0 top-0 bottom-0 w-[85%] sm:w-[60%] md:w-[38%] lg:w-[28%] bg-white overflow-y-auto shadow-2xl" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, height: '100%' }}>
            <div className="min-h-screen">
              {/* Menu Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-600 hover:text-slate-700 transition p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Menu Content - Hindware Style */}
              <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
                {/* Search (side menu) */}
                <form onSubmit={handleSearchSubmit} className="mb-6">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-base" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, brands, categories..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-slate-400 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 shadow-md"
                      onFocus={() => {
                        if (searchQuery.trim().length >= 2) setSuggestOpen(true);
                      }}
                    />

                    {/* Suggestions dropdown (side menu) */}
                    {(suggestOpen || suggestLoading) && (
                      <div className="absolute mt-2 w-full rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden z-50">
                        <div className="p-2">
                          <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-xs font-semibold text-gray-600">Top matches</span>
                            {suggestLoading && <span className="text-xs text-gray-500">Searching...</span>}
                          </div>

                          {(suggestions.brands.length === 0 &&
                            suggestions.categories.length === 0 &&
                            suggestions.products.length === 0 &&
                            !suggestLoading) && (
                            <div className="px-2 py-3 text-sm text-gray-500">No matches</div>
                          )}

                          {suggestions.brands.length > 0 && (
                            <div className="mt-2">
                              <div className="px-2 text-xs font-semibold text-gray-500">Brands</div>
                              <div className="mt-1">
                                {suggestions.brands.map((b) => (
                                  <button
                                    key={b._id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => goBrand(b)}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                                  >
                                    {b.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {suggestions.categories.length > 0 && (
                            <div className="mt-2">
                              <div className="px-2 text-xs font-semibold text-gray-500">Categories</div>
                              <div className="mt-1">
                                {suggestions.categories.map((c) => (
                                  <button
                                    key={c._id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => goCategory(c)}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                                  >
                                    {c.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {suggestions.products.length > 0 && (
                            <div className="mt-2">
                              <div className="px-2 text-xs font-semibold text-gray-500">Products</div>
                              <div className="mt-1">
                                {suggestions.products.map((p) => (
                                  <button
                                    key={p._id}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => goProduct(p)}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800 flex items-center gap-3"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                      {p.primaryImageUrl ? (
                                        <img src={p.primaryImageUrl} alt={p.name} className="w-full h-full object-cover" />
                                      ) : null}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold truncate">{p.name}</div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {p.brandId?.name || "N/A"} • {p.categoryId?.name || "N/A"}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
                <nav className="space-y-1">
                  {Object.entries(menuItems).map(([menuItem, subItems]) => (
                    <div key={menuItem} className="border-b border-gray-100 last:border-0">
                      {subItems && typeof subItems === 'object' ? (
                        <div>
                          <button
                            onClick={() => setExpandedCategory(expandedCategory === menuItem ? null : menuItem)}
                            className="w-full flex items-center justify-between py-5 text-left text-gray-900 font-semibold text-lg md:text-xl hover:text-gray-600 transition group"
                          >
                            <span>{menuItem}</span>
                            <FaChevronRight
                              className={`text-sm transition-transform duration-200 ${
                                expandedCategory === menuItem ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                          
                          {expandedCategory === menuItem && (
                            <div className="pb-6 pt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {Object.entries(subItems).map(([subCategory, items]) => (
                                  <div key={subCategory} className="space-y-2">
                                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-3">
                                      {subCategory}
                                    </h3>
                                    <ul className="space-y-1.5">
                                      {items.map((item) => (
                                        <li key={item}>
                                          <a
                                            href="#"
                                            className="text-sm text-gray-600 hover:text-gray-800 transition block py-1"
                                          >
                                            {item}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        typeof subItems === 'string' && subItems.startsWith('/') ? (
                          <Link
                            to={subItems}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block py-5 font-semibold text-lg md:text-xl transition cursor-pointer ${
                              isActivePath(subItems) ? "text-gray-700" : "text-gray-900 hover:text-gray-600"
                            }`}
                          >
                            {menuItem}
                          </Link>
                        ) : (
                          <a
                            href={typeof subItems === 'string' ? subItems : '#'}
                            target={typeof subItems === 'string' && subItems.startsWith('http') ? '_blank' : undefined}
                            rel={typeof subItems === 'string' && subItems.startsWith('http') ? 'noopener noreferrer' : undefined}
                            onClick={(e) => {
                              if (typeof subItems === 'string' && subItems.startsWith('http')) {
                                window.open(subItems, '_blank', 'noopener,noreferrer');
                              } else if (typeof subItems === 'string' && !subItems.startsWith('/')) {
                                // Handle other string items
                              }
                            }}
                            className="block py-5 text-gray-900 font-semibold text-lg md:text-xl hover:text-gray-600 transition cursor-pointer"
                          >
                            {menuItem}
                          </a>
                        )
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

export default AppNavbar;

