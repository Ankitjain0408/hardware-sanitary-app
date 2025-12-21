import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ContactUs from "./components/ContactUs";
import ServiceSupport from "./components/ServiceSupport";
import LoginPage from "./components/LoginPage";
import LoginPopup from "./components/LoginPopup";
import PageLayout from "./components/layouts/PageLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ThemeProvider } from "./contexts/ThemeContext";
import BrandPage from "./pages/admin/BrandPage";
import CategoryPage from "./pages/admin/CategoryPage";
import MainCategoryPage from "./pages/admin/MainCategoryPage";
import ProductPage from "./pages/admin/ProductPage";
import ManageStockPage from "./pages/admin/ManageStockPage";
import AdminProfile from "./pages/admin/AdminProfile";
import InquiryManagementPage from "./pages/admin/InquiryManagementPage";
import ExploreByBrand from "./pages/ExploreByBrand";
import ExploreByCategory from "./pages/ExploreByCategory";
import ExploreByProduct from "./pages/ExploreByProduct";
import ProductDetails from "./pages/ProductDetails";
import AboutUs from "./pages/AboutUs";
import ReviewsAndRatings from "./pages/ReviewsAndRatings";
import HomePage from "./pages/HomePage";
import Wishlist from "./components/Wishlist";
import MyInquiries from "./pages/MyInquiries";

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showServiceSupport, setShowServiceSupport] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [apiUp, setApiUp] = useState(true);
  const [apiBannerVisible, setApiBannerVisible] = useState(false);

  // Basic page titles (SEO polish)
  useEffect(() => {
    const path = location.pathname || "/";
    const titleMap = [
      { prefix: "/admin", title: "Admin • SHRI KRISHNA" },
      { prefix: "/explore/brands", title: "Explore Brands • SHRI KRISHNA" },
      { prefix: "/explore/categories", title: "Explore Categories • SHRI KRISHNA" },
      { prefix: "/explore/products", title: "Explore Products • SHRI KRISHNA" },
      { prefix: "/product", title: "Product • SHRI KRISHNA" },
      { prefix: "/reviews", title: "Reviews & Ratings • SHRI KRISHNA" },
      { prefix: "/about", title: "About Us • SHRI KRISHNA" },
      { prefix: "/contact", title: "Contact Us • SHRI KRISHNA" },
      { prefix: "/", title: "SHRI KRISHNA Hardware & Sanitary" },
    ];
    const matched = titleMap.find((t) => path === t.prefix || path.startsWith(t.prefix));
    document.title = matched?.title || "SHRI KRISHNA Hardware & Sanitary";
  }, [location.pathname]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Global API up/down banner (axios interceptor dispatches api:status)
  useEffect(() => {
    const onStatus = (e) => {
      const up = !!e?.detail?.up;
      setApiUp(up);
      setApiBannerVisible(!up);
    };
    window.addEventListener("api:status", onStatus);
    return () => window.removeEventListener("api:status", onStatus);
  }, []);

  // Allow any page/component to open the wishlist (e.g., after "Add to Wishlist")
  useEffect(() => {
    const handleOpenWishlist = () => setShowWishlist(true);
    window.addEventListener("wishlist:open", handleOpenWishlist);
    return () => window.removeEventListener("wishlist:open", handleOpenWishlist);
  }, []);

  const refreshWishlistCount = async () => {
    try {
      const res = await fetch("/api/wishlist", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const items = data.wishlist || [];
      const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setWishlistCount(count);
    } catch {
      // ignore
    }
  };

  // Keep wishlist count in sync (add/remove/update)
  useEffect(() => {
    refreshWishlistCount();
    const onRefresh = () => refreshWishlistCount();
    window.addEventListener("wishlist:refresh", onRefresh);
    window.addEventListener("wishlist:changed", onRefresh);
    return () => {
      window.removeEventListener("wishlist:refresh", onRefresh);
      window.removeEventListener("wishlist:changed", onRefresh);
    };
  }, []);

  // Global toast notifications (e.g., wishlist added)
  useEffect(() => {
    let timer;
    const onWishlistAdded = (e) => {
      const message = e?.detail?.message || "Added to wishlist";
      setToast({ visible: true, message });
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setToast({ visible: false, message: "" }), 2500);
    };
    window.addEventListener("wishlist:added", onWishlistAdded);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("wishlist:added", onWishlistAdded);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/profile", {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        // Ensure isAdmin and isGuest are set correctly
        setUser({
          ...data.user,
          isAdmin: data.user.isAdmin || false,
          isGuest: data.user.isGuest || false
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      // Logout error handled silently
    }
  };

  // Memoize common handlers to avoid recreating on each render
  const commonHandlers = useMemo(() => ({
    onContactUsClick: () => setShowContactUs(true),
    onServiceSupportClick: () => setShowServiceSupport(true),
    onLoginClick: () => setShowLoginPopup(true),
    onWishlistClick: () => {
      setShowWishlist(true);
      window.dispatchEvent(new Event("wishlist:refresh"));
    },
    onLogout: handleLogout
  }), []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main page if authenticated
  // If user is admin, redirect to admin dashboard
  if (user?.isAdmin) {
    return (
      <ThemeProvider>
        <AdminLayout user={user} onLogout={handleLogout}>
      <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/brands" element={<BrandPage />} />
            <Route path="/admin/main-categories" element={<MainCategoryPage />} />
            <Route path="/admin/categories" element={<CategoryPage />} />
            <Route path="/admin/products" element={<ProductPage />} />
            <Route path="/admin/stock" element={<ManageStockPage />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/inquiries" element={<InquiryManagementPage />} />
        <Route path="/*" element={<Navigate to="/admin" replace />} />
      </Routes>
        </AdminLayout>
      </ThemeProvider>
    );
  }

  // Normal user routes
  return (
    <div className="relative">
      {apiBannerVisible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10050]">
          <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-2xl ring-1 ring-white/10 flex items-center gap-4">
            <div className="text-sm">
              <div className="font-semibold">Server not reachable</div>
              <div className="text-white/75">Check backend / internet, then retry.</div>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setApiBannerVisible(false)}
              className="px-3 py-2 rounded-xl bg-white/0 hover:bg-white/10 transition text-sm font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route
          path="/about"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <AboutUs />
            </PageLayout>
          }
        />
        <Route
          path="/reviews"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <ReviewsAndRatings user={user} />
            </PageLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <ContactUs />
            </PageLayout>
          }
        />
        <Route
          path="/explore/brands"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <ExploreByBrand />
            </PageLayout>
          }
        />
        <Route
          path="/explore/categories"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <ExploreByCategory />
            </PageLayout>
          }
        />
        <Route
          path="/explore/products"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <ExploreByProduct />
            </PageLayout>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <ProductDetails />
            </PageLayout>
          }
        />
        <Route
          path="/my-inquiries"
          element={
            <PageLayout
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            >
              <MyInquiries user={user} />
            </PageLayout>
          }
        />

        {/* Main Page Route */}
        <Route
          path="/*"
          element={
            <>
              <HomePage
              user={user}
              wishlistCount={wishlistCount}
              {...commonHandlers}
            />
            {/* Contact Us Overlay */}
            {showContactUs && (
              <div className="fixed inset-0 z-[10000] bg-white overflow-y-auto">
                <ContactUs onClose={() => setShowContactUs(false)} />
              </div>
            )}

            {/* Service & Support Overlay */}
            {showServiceSupport && (
              <div className="fixed inset-0 z-[10000] bg-white overflow-y-auto">
                <ServiceSupport onClose={() => setShowServiceSupport(false)} />
              </div>
            )}

            {/* Login Popup (for profile/logout) */}
            <LoginPopup 
              loginPopup={showLoginPopup} 
              handleLoginPopup={setShowLoginPopup} 
            />
            </>
          }
        />
      </Routes>

      {/* Wishlist (global for ALL normal-user pages) */}
      {showWishlist && (
        <Wishlist onClose={() => setShowWishlist(false)} />
      )}

      {/* Toast notification */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001]">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-full shadow-lg text-sm font-semibold">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
