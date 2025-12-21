import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TrustedBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrandsWithImages();
  }, []);

  const fetchBrandsWithImages = async () => {
    try {
      const response = await axios.get("/api/brands?isActive=true", {
        withCredentials: true
      });
      // Filter only brands that have images
      const brandsWithImages = (response.data.brands || []).filter(
        (brand) => brand.imageUrl && brand.imageUrl.trim() !== ""
      );
      setBrands(brandsWithImages);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandId) => {
    navigate(`/explore/products?brandId=${brandId}`);
  };

  if (loading) {
    return (
      <div className="mt-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Trusted Brands
          </h2>
        </div>
        <div className="flex justify-center gap-5 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-28 h-28 md:w-36 md:h-36 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return null; // Don't show section if no brands with images
  }

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Trusted Brands
        </h2>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          Partnering with leading manufacturers for quality assurance
        </p>
      </div>
      <div className="bg-gradient-to-r from-white via-gray-50/50 to-white rounded-3xl shadow-lg ring-2 ring-gray-200/80 p-8 md:p-10">
        <div className="flex justify-center gap-5 md:gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {brands.map((brand, index) => (
            <button
              key={brand._id}
              onClick={() => handleBrandClick(brand._id)}
              className="shrink-0 group hover:scale-110 transition-all duration-300"
              title={brand.name}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-2xl p-4 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-400 group-hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100 group-hover:ring-blue-200">
                <img
                  src={brand.imageUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
