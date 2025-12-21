import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/httpClient";

function AppFooter({ onContactUsClick, onServiceSupportClick }) {
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    fetchMainCategories();
  }, []);

  const fetchMainCategories = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await axios.get(`${apiBase}/api/main-categories?isActive=true`, {
        withCredentials: true
      });
      // Limit to first 5 categories for footer
      const categories = (response.data.categories || []).slice(0, 5);
      setMainCategories(categories);
    } catch (err) {
      // Silently fail - footer will show "View All Categories" link instead
    }
  };

  return (
    <footer className="bg-gray-900/90 backdrop-blur-md text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <h3 className="text-white text-3xl font-extrabold tracking-[0.15em] mb-1 uppercase" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.12em' }}>SHRI KRISHNA</h3>
              <p className="text-gray-400 text-sm tracking-wide">Hardware & Sanitary</p>
            </div>
            <p className="text-sm text-gray-400">
              Your one-stop shop for premium hardware and sanitary products.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/NfFXifFgZvyJqhiL8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Store Location
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onServiceSupportClick) {
                      onServiceSupportClick();
                    }
                  }}
                  className="hover:text-white transition cursor-pointer"
                >
                  Service & Support
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {mainCategories.length > 0 ? (
                mainCategories.map((category) => (
                  <li key={category._id}>
                    <Link 
                      to={`/explore/products?mainCategoryId=${category._id}`}
                      className="hover:text-white transition"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link to="/explore/categories" className="hover:text-white transition">
                    View All Categories
                  </Link>
                </li>
              )}
              {mainCategories.length > 0 && (
                <li>
                  <Link to="/explore/categories" className="hover:text-white transition text-gray-400">
                    View All →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>Copyright © SHRI KRISHNA Hardware & Sanitary. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;

