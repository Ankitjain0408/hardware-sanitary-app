import { Link, useLocation } from "react-router-dom";
import { 
  FaHome, 
  FaBox, 
  FaTags, 
  FaShoppingBag, 
  FaSignOutAlt, 
  FaWarehouse, 
  FaInbox, 
  FaUser, 
  FaLayerGroup,
  FaTimes
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const AdminSidebar = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: "/admin", icon: FaHome, label: "Dashboard" },
    { path: "/admin/brands", icon: FaBox, label: "Brands" },
    { path: "/admin/main-categories", icon: FaLayerGroup, label: "Main Categories" },
    { path: "/admin/categories", icon: FaTags, label: "Categories" },
    { path: "/admin/products", icon: FaShoppingBag, label: "Products" },
    { path: "/admin/stock", icon: FaWarehouse, label: "Stock" },
    { path: "/admin/inquiries", icon: FaInbox, label: "Inquiries" },
    { path: "/admin/profile", icon: FaUser, label: "Profile" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 shadow-lg border-r flex flex-col z-50 transform transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <Link to="/admin" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SK</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}>
                SHRI KRISHNA
              </h1>
              <p className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Admin Panel
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className={`lg:hidden p-2 rounded-lg transition ${
              isDark 
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm font-semibold"
                      : isDark
                      ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isDark
                ? "text-gray-300 hover:bg-red-900/30 hover:text-red-400"
                : "text-gray-700 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <FaSignOutAlt className="text-lg" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

