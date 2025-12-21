import { useState } from "react";
import AdminSidebar from "../admin/AdminSidebar";
import AdminHeader from "../admin/AdminHeader";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const AdminLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  const handleSearch = (query) => {
    // Navigate to products page with search query
    navigate(`/admin/products?search=${encodeURIComponent(query)}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? "bg-gray-900" 
        : "bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50"
    }`}>
      <AdminSidebar onLogout={onLogout} isOpen={sidebarOpen} onClose={closeSidebar} />
      <AdminHeader user={user} onSearch={handleSearch} onMenuToggle={toggleSidebar} />
      <main className="lg:ml-64 mt-16 p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
