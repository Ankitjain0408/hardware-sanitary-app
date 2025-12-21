import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/httpClient";
import { FaArrowLeft, FaTags } from "react-icons/fa";
import { GridSkeleton } from "../components/Skeletons";

const ExploreByCategory = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.msg || "Failed to fetch main categories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-slate-700 mb-6"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Explore by Category</h1>
        <p className="text-gray-600 mb-8">Browse products by main categories</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <GridSkeleton items={8} />
        ) : mainCategories.length === 0 ? (
          <div className="text-center py-12">
            <FaTags className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No main categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mainCategories.map((category) => (
              <Link
                key={category._id}
                to={`/explore/products?mainCategoryId=${category._id}`}
                className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition overflow-hidden ring-1 ring-green-100">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <FaTags className="text-4xl text-green-600" />
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-500 text-center mb-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-blue-600 text-center font-semibold">View Products</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreByCategory;

