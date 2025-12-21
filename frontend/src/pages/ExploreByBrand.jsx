import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaBox, FaDownload } from "react-icons/fa";
import { GridSkeleton } from "../components/Skeletons";

const ExploreByBrand = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/brands?isActive=true", {
        withCredentials: true
      });
      setBrands(response.data.brands || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch brands");
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

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Explore by Brand</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <GridSkeleton items={8} />
        ) : brands.length === 0 ? (
          <div className="text-center py-12">
            <FaBox className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">No brands available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="group bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Link
                  to={`/explore/products?brandId=${brand._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition overflow-hidden ring-1 ring-blue-100">
                      {brand.imageUrl ? (
                        <img
                          src={brand.imageUrl}
                          alt={brand.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <FaBox className="text-4xl text-blue-600" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-3">View Products</p>
                </Link>
                {brand.catalogUrl && (
                  <button
                    onClick={async () => {
                      try {
                        // Track download in backend
                        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
                        try {
                          const trackRes = await fetch(`${apiBase}/api/admin/brands/${brand._id}/catalog/download`, {
                            method: 'GET',
                            credentials: 'include'
                          });
                          if (!trackRes.ok) {
                            console.warn('Catalog download tracking failed:', trackRes.status, trackRes.statusText);
                          }
                        } catch (trackError) {
                          console.warn('Catalog download tracking error:', trackError);
                          // Still allow download even if tracking fails
                        }

                        // Download the catalog
                        const response = await fetch(brand.catalogUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${brand.name.replace(/\s+/g, '_')}_Catalog.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading catalog:', error);
                        // Fallback: open in new tab
                        window.open(brand.catalogUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="flex items-center justify-center gap-2 text-sm text-slate-700 hover:text-slate-900 font-semibold py-2 px-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition w-full"
                  >
                    <FaDownload /> Download Catalog
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreByBrand;

