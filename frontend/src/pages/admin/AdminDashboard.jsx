import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaBox, 
  FaShoppingBag, 
  FaWarehouse, 
  FaInbox,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaClock,
  FaEdit,
  FaChartLine
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    brands: 0,
    products: 0,
    inquiries: 0,
    pendingInquiries: 0
  });
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRecentInquiries();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch brands count
      const brandsRes = await fetch("/api/admin/brands", { credentials: "include" });
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setStats(prev => ({ ...prev, brands: brandsData.brands?.length || 0 }));
      }

      // Fetch products count
      const productsRes = await fetch("/api/admin/products", { credentials: "include" });
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setStats(prev => ({ ...prev, products: productsData.products?.length || 0 }));
      }

      // Fetch inquiries count
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const inquiriesRes = await fetch(`${apiBase}/api/inquiries`, { credentials: "include" });
      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        const inquiriesList = inquiriesData.inquiries || [];
        setStats(prev => ({ 
          ...prev, 
          inquiries: inquiriesList.length,
          pendingInquiries: inquiriesList.filter(i => i.status === "pending").length
        }));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentInquiries = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/inquiries`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const allInquiries = data.inquiries || [];
        // Get the 10 most recent inquiries
        const recentInquiries = allInquiries
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 10);
        setInquiries(recentInquiries);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock, text: "Pending" },
      in_stock: { color: "bg-green-100 text-green-800", icon: FaCheck, text: "In Stock" },
      out_of_stock: { color: "bg-red-100 text-red-800", icon: FaTimes, text: "Out of Stock" },
      available_soon: { color: "bg-blue-100 text-blue-800", icon: FaClock, text: "Available Soon" },
      fulfilled: { color: "bg-gray-100 text-gray-800", icon: FaCheck, text: "Fulfilled" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: FaTimes, text: "Cancelled" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="text-xs" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}>
                Admin Dashboard
              </h1>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Manage your e-commerce store efficiently
              </p>
            </div>
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border ${
              isDark 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-200"
            }`}>
              <FaChartLine className="text-blue-600" />
              <span className={`text-sm font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Control Center
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg shadow-md border p-6 transition-colors ${
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaBox className="text-2xl text-blue-600" />
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}>
                  {stats.brands}
                </p>
                <p className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                  Brands
                </p>
              </div>
            </div>
            <Link 
              to="/admin/brands" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className={`rounded-lg shadow-md border p-6 transition-colors ${
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDark ? "bg-blue-900/30" : "bg-blue-50"
              }`}>
                <FaShoppingBag className="text-2xl text-blue-600" />
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}>
                  {stats.products}
                </p>
                <p className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                  Products
                </p>
              </div>
            </div>
            <Link 
              to="/admin/products" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className={`rounded-lg shadow-md border p-6 transition-colors ${
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDark ? "bg-blue-900/30" : "bg-blue-50"
              }`}>
                <FaInbox className="text-2xl text-blue-600" />
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}>
                  {stats.inquiries}
                </p>
                <p className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                  Inquiries
                </p>
              </div>
            </div>
            {stats.pendingInquiries > 0 && (
              <div className="mb-2">
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.pendingInquiries} Pending
                </span>
              </div>
            )}
            <Link 
              to="/admin/inquiries" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className={`rounded-lg shadow-md border p-6 transition-colors ${
            isDark 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDark ? "bg-blue-900/30" : "bg-blue-50"
              }`}>
                <FaWarehouse className="text-2xl text-blue-600" />
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}>
                  —
                </p>
                <p className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                  Stock Management
                </p>
              </div>
            </div>
            <Link 
              to="/admin/stock" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Manage <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>


        {/* Recent Inquiries */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}>
                Recent Inquiries
              </h2>
              <p className={`text-sm mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                Latest customer product inquiries
              </p>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {loading ? (
            <div className={`rounded-lg shadow-md border p-8 text-center transition-colors ${
              isDark 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-200"
            }`}>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Loading inquiries...
              </p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className={`rounded-lg shadow-md border p-8 text-center transition-colors ${
              isDark 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-200"
            }`}>
              <FaInbox className={`text-4xl mx-auto mb-3 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`} />
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                No inquiries found
              </p>
            </div>
          ) : (
            <div className={`rounded-lg shadow-md border overflow-hidden transition-colors ${
              isDark 
                ? "bg-gray-800 border-gray-700" 
                : "bg-white border-gray-200"
            }`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`border-b ${
                    isDark 
                      ? "bg-gray-700 border-gray-600" 
                      : "bg-gray-50 border-gray-200"
                  }`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        ID
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Customer
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Product
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Quantity
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDark 
                      ? "bg-gray-800 divide-gray-700" 
                      : "bg-white divide-gray-200"
                  }`}>
                    {inquiries.map((inquiry) => {
                      if (!inquiry || !inquiry._id) return null;
                      return (
                        <tr key={inquiry._id} className={`transition ${
                          isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              isDark ? "text-gray-100" : "text-gray-900"
                            }`}>
                              #{inquiry._id ? inquiry._id.slice(-6) : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${
                              isDark ? "text-gray-100" : "text-gray-900"
                            }`}>
                              {inquiry.userId?.username || inquiry.userId?.email || "N/A"}
                            </div>
                            {inquiry.userId?.email && inquiry.userId.email !== (inquiry.userId?.username || "") && (
                              <div className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-500"}>
                                {inquiry.userId.email}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${
                              isDark ? "text-gray-100" : "text-gray-900"
                            }`}>
                              {inquiry.productSnapshot?.name || inquiry.productId?.name || "N/A"}
                            </div>
                            {inquiry.productSnapshot?.brandName && (
                              <div className={isDark ? "text-xs text-gray-400" : "text-xs text-gray-500"}>
                                {inquiry.productSnapshot.brandName}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={isDark ? "text-sm text-gray-100" : "text-sm text-gray-900"}>
                              {inquiry.quantity || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(inquiry.status || "pending")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={isDark ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                              {formatDate(inquiry.createdAt)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/admin/inquiries`)}
                              className={`text-blue-600 hover:text-blue-700 p-2 rounded-lg transition ${
                                isDark 
                                  ? "hover:bg-blue-900/30" 
                                  : "hover:bg-blue-50"
                              }`}
                              title="View Details"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

