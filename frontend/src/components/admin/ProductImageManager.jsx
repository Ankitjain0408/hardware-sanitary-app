import { useState, useEffect } from "react";
import axios from "axios";

const ProductImageManager = ({ productId }) => {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchImages();
    }
  }, [productId]);

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        `/api/admin/products/${productId}/images`,
        { withCredentials: true }
      );
      setImages(response.data.images || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch images");
    } finally {
      setFetching(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError("Image URL is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `/api/admin/products/${productId}/images`,
        { imageUrl: imageUrl.trim(), isPrimary },
        { withCredentials: true }
      );
      setImageUrl("");
      setIsPrimary(false);
      fetchImages();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (imageId) => {
    setSettingPrimaryId(imageId);
    setError("");
    try {
      await axios.put(
        `/api/admin/products/${productId}/images/${imageId}/primary`,
        {},
        { withCredentials: true }
      );
      await fetchImages();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to set primary image");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = async (imageId) => {
    const imageToDelete = images.find(img => img._id === imageId);
    const isPrimaryImage = imageToDelete?.isPrimary;
    const isOnlyImage = images.length === 1;
    
    if (isOnlyImage) {
      if (!window.confirm("This is the only image. Are you sure you want to delete it?")) return;
    } else if (isPrimaryImage) {
      if (!window.confirm("This is the primary image. After deletion, another image will need to be set as primary. Continue?")) return;
    } else {
      if (!window.confirm("Are you sure you want to delete this image?")) return;
    }

    setDeletingId(imageId);
    setError("");
    try {
      await axios.delete(
        `/api/admin/products/${productId}/images/${imageId}`,
        { withCredentials: true }
      );
      await fetchImages();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  if (fetching) {
    return <div className="text-center py-8">Loading images...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Product Images</h3>

      <form onSubmit={handleUpload} className="bg-white p-4 rounded-lg shadow-md space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL *
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrimary"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
            Set as primary image
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No images uploaded yet
          </div>
        ) : (
          images.map((image) => (
            <div
              key={image._id}
              className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                image.isPrimary ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              {image.isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                  Primary
                </div>
              )}
              <div 
                className={`cursor-pointer ${!image.isPrimary ? 'hover:opacity-90' : ''}`}
                onClick={() => !image.isPrimary && handleSetPrimary(image._id)}
                title={!image.isPrimary ? "Click to set as primary" : "Primary image"}
              >
                <img
                  src={image.imageUrl}
                  alt="Product"
                  className="w-full h-48 object-contain p-2 bg-gray-50 pointer-events-none"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300?text=Image+Error";
                  }}
                />
              </div>
              <div className="p-2 bg-gray-50">
                <div className="flex gap-2">
                  {image.isPrimary ? (
                    <button
                      disabled
                      className="flex-1 px-2 py-1 text-xs bg-gray-400 text-white rounded cursor-not-allowed"
                    >
                      Primary
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetPrimary(image._id)}
                      disabled={settingPrimaryId === image._id || deletingId === image._id}
                      className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {settingPrimaryId === image._id ? "Setting..." : "Set Primary"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image._id)}
                    disabled={deletingId === image._id || settingPrimaryId === image._id}
                    className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === image._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductImageManager;

