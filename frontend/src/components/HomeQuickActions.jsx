import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTags, FaCheckCircle, FaRupeeSign, FaHeadset } from "react-icons/fa";
import TrustedBrands from "./TrustedBrands";

export default function HomeQuickActions() {
  const navigate = useNavigate();
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMainCategories();
  }, []);

  const fetchMainCategories = async () => {
    try {
      const response = await axios.get("/api/main-categories?isActive=true", {
        withCredentials: true
      });
      setMainCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch main categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/explore/products?mainCategoryId=${categoryId}`);
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* Quick Shop - Main Categories */}
        <div>
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Quick Shop
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
              Explore our wide range of premium sanitary and hardware products
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 p-6 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-200 mb-4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : mainCategories.length === 0 ? (
            <div className="text-center py-12">
              <FaTags className="mx-auto text-6xl text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
              {mainCategories.map((category, index) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  className="group bg-white rounded-3xl shadow-md ring-1 ring-gray-200/80 p-6 md:p-7 hover:shadow-2xl hover:-translate-y-2 hover:ring-blue-300 transition-all duration-300 text-center relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-green-50/0 group-hover:from-blue-50/50 group-hover:to-green-50/50 transition-all duration-300 rounded-3xl" />
                  
                  <div className="relative flex flex-col items-center gap-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-blue-50 via-green-50 to-slate-50 flex items-center justify-center group-hover:from-blue-100 group-hover:via-green-100 group-hover:to-slate-100 transition-all duration-300 overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-300 group-hover:scale-110 shadow-inner">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <FaTags className="text-3xl md:text-4xl text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                    <div className="w-full">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors duration-300">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trusted Brands Section */}
        <TrustedBrands />

        {/* Trust strip */}
        <div className="mt-12 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-3xl ring-2 ring-gray-200/80 shadow-lg p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300 shadow-sm">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-green-700 transition-colors">
                  Genuine products
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Trusted brands & quality assurance
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300 shadow-sm">
                <FaRupeeSign className="text-blue-600 text-2xl" />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">
                  Best pricing
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Competitive rates for every budget
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300 shadow-sm">
                <FaHeadset className="text-purple-600 text-2xl" />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                  Expert support
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  We help you choose the right products
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


