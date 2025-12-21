import { useState, useEffect, useRef } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const AdminNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchNotificationCount();
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotificationCount();
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const fetchNotificationCount = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/admin/notifications/count`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error("Fetch admin notification count error:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/admin/notifications`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Fetch admin notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/admin/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        await fetchNotificationCount();
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Mark admin notification as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/admin/notifications/read-all`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        await fetchNotificationCount();
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Mark all admin notifications as read error:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setShowDropdown(false);
  };

  const getNotificationLink = (notification) => {
    if (notification.relatedType === "ProductInquiry" && notification.relatedId) {
      return `/admin/inquiries`;
    }
    return null;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            fetchNotifications();
          }
        }}
        className={`relative p-2 rounded-lg transition ${
          isDark 
            ? "text-gray-300 hover:text-blue-400 hover:bg-gray-700" 
            : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
        }`}
        title="Notifications"
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden flex flex-col ${
          isDark 
            ? "bg-gray-800 border-gray-700" 
            : "bg-white border-gray-200"
        }`}>
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
          }`}>
            <h3 className={`font-semibold ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}>
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs font-semibold transition ${
                    isDark 
                      ? "text-blue-400 hover:text-blue-300" 
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className={`transition ${
                  isDark 
                    ? "text-gray-400 hover:text-gray-300" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className={`p-4 text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className={`p-8 text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                <FaBell className={`text-4xl mx-auto mb-2 ${
                  isDark ? "text-gray-600" : "text-gray-300"
                }`} />
                <p>No notifications</p>
              </div>
            ) : (
              <div className={`divide-y ${
                isDark ? "divide-gray-700" : "divide-gray-200"
              }`}>
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const content = (
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer transition ${
                        !notification.isRead 
                          ? (isDark ? "bg-blue-900/30" : "bg-blue-50") 
                          : (isDark ? "hover:bg-gray-700" : "hover:bg-gray-50")
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          !notification.isRead 
                            ? "bg-blue-600" 
                            : (isDark ? "bg-gray-600" : "bg-gray-300")
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${
                            !notification.isRead 
                              ? (isDark ? "text-gray-100" : "text-gray-900")
                              : (isDark ? "text-gray-300" : "text-gray-700")
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-2 ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}>
                            {new Date(notification.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                  return link ? (
                    <Link key={notification._id} to={link} onClick={() => setShowDropdown(false)}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notification._id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className={`p-3 border-t text-center ${
              isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-gray-50"
            }`}>
              <Link
                to="/admin/inquiries"
                onClick={() => setShowDropdown(false)}
                className={`text-sm font-semibold transition ${
                  isDark 
                    ? "text-blue-400 hover:text-blue-300" 
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                View All Inquiries
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;

