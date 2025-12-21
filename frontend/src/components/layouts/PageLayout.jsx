import AppNavbar from "../AppNavbar";
import AppFooter from "../AppFooter";

const PageLayout = ({ 
  children, 
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
      <AppNavbar
        onContactUsClick={onContactUsClick}
        onServiceSupportClick={onServiceSupportClick}
        onLoginClick={onLoginClick}
        onWishlistClick={onWishlistClick}
        user={user}
        onLogout={onLogout}
        wishlistCount={wishlistCount}
      />
      {children}
      <AppFooter
        onContactUsClick={onContactUsClick}
        onServiceSupportClick={onServiceSupportClick}
      />
    </div>
  );
};

export default PageLayout;
