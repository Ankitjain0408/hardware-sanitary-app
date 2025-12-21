import { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUser, FaHome, FaBars, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import AdminNotificationBell from "./AdminNotificationBell";

const AdminHeader = ({ user, onSearch, onMenuToggle }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark, toggleTheme } = useTheme();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <header className={`fixed top-0 left-0 lg:left-64 right-0 h-16 shadow-sm border-b z-40 transition-colors ${
      isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className={`lg:hidden p-2 rounded-lg transition ${
              isDark 
                ? "text-gray-300 hover:text-blue-400 hover:bg-gray-700" 
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            }`}
            title="Toggle Menu"
          >
            <FaBars className="text-lg" />
          </button>
          
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-700"
          }`}>
            Admin
          </span>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                isDark ? "text-gray-400" : "text-gray-400"
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors ${
                  isDark 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-gray-50 border border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition ${
              isDark 
                ? "text-yellow-400 hover:bg-gray-700" 
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
          </button>

          {/* Website Link */}
          <Link
            to="/"
            className={`p-2 rounded-lg transition ${
              isDark 
                ? "text-gray-300 hover:text-blue-400 hover:bg-gray-700" 
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            }`}
            title="View Website"
          >
            <FaHome className="text-lg" />
          </Link>

          {/* Notifications */}
          <AdminNotificationBell />

          {/* User Info */}
          {user && (
            <div className={`flex items-center gap-3 pl-4 border-l ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-xs" />
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-semibold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}>
                  {user.username || "Admin User"}
                </p>
                <p className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  {user.email || "admin@shrikrishna.com"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

