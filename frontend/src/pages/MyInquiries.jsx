import { useState, useEffect } from "react";
import { FaBox, FaCheck, FaTimes, FaClock, FaSpinner } from "react-icons/fa";
import { apiFetch } from "../utils/httpClient";

const MyInquiries = ({ user }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/api/inquiries/my-inquiries", {});

      if (!res.ok) throw new Error("Failed to fetch inquiries");

      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (error) {
      console.error("Fetch inquiries error:", error);
      setError("Failed to load your inquiries");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-300", 
        icon: FaClock, 
        text: "Pending Review",
        message: "Your inquiry is being reviewed. Admin will check stock availability."
      },
      in_stock: { 
        color: "bg-green-100 text-green-800 border-green-300", 
        icon: FaCheck, 
        text: "In Stock",
        message: "Great news! The product is available in stock."
      },
      out_of_stock: { 
        color: "bg-red-100 text-red-800 border-red-300", 
        icon: FaTimes, 
        text: "Out of Stock",
        message: "The product is currently out of stock. We'll notify you when it's available."
      },
      available_soon: { 
        color: "bg-blue-100 text-blue-800 border-blue-300", 
        icon: FaClock, 
        text: "Available Soon",
        message: "The product will be available soon. We'll keep you updated."
      },
      cancelled: { 
        color: "bg-gray-100 text-gray-800 border-gray-300", 
        icon: FaTimes, 
        text: "Cancelled",
        message: "This inquiry has been cancelled."
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${config.color}`}>
        <Icon className="text-sm" />
        <span className="font-semibold">{config.text}</span>
      </div>
    );
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending: "Your inquiry is being reviewed. Admin will check stock availability.",
      in_stock: "Great news! The product is available in stock.",
      out_of_stock: "The product is currently out of stock. We'll notify you when it's available.",
      available_soon: "The product will be available soon. We'll keep you updated.",
      cancelled: "This inquiry has been cancelled."
    };
    return messages[status] || messages.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <FaSpinner className="text-4xl text-gray-400 mx-auto mb-4 animate-spin" />
            <div className="text-lg text-gray-600">Loading your inquiries...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">My Inquiries</h1>
          <p className="text-gray-600">View the status of your product inquiries</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBox className="text-gray-300 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Inquiries Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't submitted any product inquiries. Add products to your wishlist and click "Book Inquiry" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {inquiry.productName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Inquiry Date: {new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>

                  {/* Status Message */}
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    inquiry.status === 'in_stock' ? 'bg-green-50 border-green-200' :
                    inquiry.status === 'out_of_stock' ? 'bg-red-50 border-red-200' :
                    inquiry.status === 'available_soon' ? 'bg-blue-50 border-blue-200' :
                    inquiry.status === 'cancelled' ? 'bg-gray-50 border-gray-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <p className={`font-semibold ${
                      inquiry.status === 'in_stock' ? 'text-green-800' :
                      inquiry.status === 'out_of_stock' ? 'text-red-800' :
                      inquiry.status === 'available_soon' ? 'text-blue-800' :
                      inquiry.status === 'cancelled' ? 'text-gray-800' :
                      'text-yellow-800'
                    }`}>
                      {getStatusMessage(inquiry.status)}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  {inquiry.adminNotes && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Admin Notes:</p>
                      <p className="text-sm text-blue-800">{inquiry.adminNotes}</p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="text-lg font-semibold text-gray-900">{inquiry.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{inquiry.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ₹{inquiry.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {inquiry.productId?.stock || 0} units
                      </p>
                    </div>
                  </div>

                  {/* Last Updated */}
                  {inquiry.updatedAt && inquiry.updatedAt !== inquiry.createdAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(inquiry.updatedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInquiries;

