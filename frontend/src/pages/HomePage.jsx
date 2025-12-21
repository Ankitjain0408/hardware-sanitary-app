import { lazy, Suspense } from "react";
import AppNavbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";
import HomeSearchHero from "../components/HomeSearchHero";
import { GridSkeleton, SkeletonBlock } from "../components/Skeletons";

const HomeGallerySlider = lazy(() => import("../components/HomeGallerySlider"));
const HomeBannerSlider = lazy(() => import("../components/HomeBannerSlider"));
const HomeQuickActions = lazy(() => import("../components/HomeQuickActions"));

const HomePage = ({ 
  user, 
  wishlistCount,
  onContactUsClick,
  onServiceSupportClick,
  onLoginClick,
  onWishlistClick,
  onLogout
}) => {
  return (
    <div className="relative">
      {/* Full Screen Background Image Section */}
      <div 
        className="h-screen bg-cover bg-center bg-fixed relative" 
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          backgroundAttachment: 'fixed',
          filter: 'contrast(1.08) saturate(1.08)'
        }}
      >
        <div className="absolute inset-0 bg-white/20 backdrop-blur-0"></div>
        <div className="relative z-10 h-full flex flex-col">
          <AppNavbar 
            onContactUsClick={onContactUsClick} 
            onServiceSupportClick={onServiceSupportClick}
            onLoginClick={onLoginClick}
            onWishlistClick={onWishlistClick}
            user={user}
            onLogout={onLogout}
            wishlistCount={wishlistCount}
          />
          <HomeSearchHero />
        </div>
      </div>

      {/* Scroll-down gallery section */}
      <Suspense fallback={<div className="bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"><GridSkeleton items={4} /></div></div>}>
        <HomeGallerySlider />
      </Suspense>

      {/* Second slider (single banner) */}
      <Suspense fallback={<div className="bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14"><SkeletonBlock className="w-full aspect-[16/6] rounded-3xl" /></div></div>}>
        <HomeBannerSlider />
      </Suspense>

      {/* Quick actions + trust strip */}
      <Suspense fallback={<div className="bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><GridSkeleton items={3} /></div></div>}>
        <HomeQuickActions />
      </Suspense>

      {/* Footer Section */}
      <AppFooter 
        onContactUsClick={onContactUsClick} 
        onServiceSupportClick={onServiceSupportClick}
      />
    </div>
  );
};

export default HomePage;
