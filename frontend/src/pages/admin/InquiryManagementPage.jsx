import { useState, useEffect } from "react";
import { FaSearch, FaCheck, FaTimes, FaClock, FaBox, FaEdit } from "react-icons/fa";
import { apiFetch } from "../../utils/httpClient";

const InquiryManagementPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    stockQuantity: ""
  });

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const url = statusFilter === "all" 
        ? `${apiBase}/api/inquiries` 
        : `${apiBase}/api/inquiries?status=${statusFilter}`;
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch inquiries");

      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error("Fetch inquiries error:", error);
      setError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    try {
      setUpdating(true);
      setError("");

      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/inquiries/${selectedInquiry._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: updateForm.status,
          adminNotes: updateForm.adminNotes,
          stockQuantity: updateForm.stockQuantity || undefined
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedInquiry(null);
        setUpdateForm({ status: "", adminNotes: "", stockQuantity: "" });
        await fetchInquiries();
      } else {
        setError(data.msg || "Failed to update inquiry");
      }
    } catch (error) {
      console.error("Update inquiry error:", error);
      setError("Unable to update inquiry");
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setUpdateForm({
      status: inquiry.status,
      adminNotes: inquiry.adminNotes || "",
      stockQuantity: inquiry.productId?.stock?.toString() || ""
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock, text: "Pending" },
      in_stock: { color: "bg-green-100 text-green-800", icon: FaCheck, text: "In Stock" },
      out_of_stock: { color: "bg-red-100 text-red-800", icon: FaTimes, text: "Out of Stock" },
      available_soon: { color: "bg-blue-100 text-blue-800", icon: FaClock, text: "Available Soon" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: FaTimes, text: "Cancelled" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="text-xs" />
        {config.text}
      </span>
    );
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      inquiry.productName?.toLowerCase().includes(query) ||
      inquiry.username?.toLowerCase().includes(query) ||
      inquiry.userEmail?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading inquiries...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Inquiries</h1>
          <p className="text-gray-600">Manage customer product inquiries and stock availability</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, customer name, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="available_soon">Available Soon</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

        {/* Inquiries Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <FaBox className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inquiry.username}</div>
                      <div className="text-sm text-gray-500">{inquiry.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{inquiry.productName}</div>
                      <div className="text-sm text-gray-500">
                        Current Stock: {inquiry.productId?.stock || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inquiry.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{inquiry.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inquiry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openUpdateModal(inquiry)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <FaEdit />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Update Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Inquiry Status</h2>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Inquiry Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Customer:</span> {selectedInquiry.username}</div>
                  <div><span className="text-gray-600">Email:</span> {selectedInquiry.userEmail}</div>
                  <div><span className="text-gray-600">Product:</span> {selectedInquiry.productName}</div>
                  <div><span className="text-gray-600">Quantity:</span> {selectedInquiry.quantity}</div>
                  <div><span className="text-gray-600">Current Stock:</span> {selectedInquiry.productId?.stock || 0}</div>
                  <div><span className="text-gray-600">Total Amount:</span> ₹{selectedInquiry.totalAmount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="available_soon">Available Soon</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {updateForm.status === "in_stock" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Update Stock Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={updateForm.stockQuantity}
                      onChange={(e) => setUpdateForm({ ...updateForm, stockQuantity: e.target.value })}
                      placeholder="Enter stock quantity"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to keep current stock. Enter new value to update product stock.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes (Optional)</label>
                  <textarea
                    value={updateForm.adminNotes}
                    onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                    rows={4}
                    placeholder="Add any notes for the customer..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition shadow-sm hover:shadow-md"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInquiry(null);
                      setUpdateForm({ status: "", adminNotes: "", stockQuantity: "" });
                    }}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryManagementPage;

