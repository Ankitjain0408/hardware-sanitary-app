import { useState, useEffect } from "react";
import axios from "axios";
import ErrorAlert from "../common/ErrorAlert";
import ActiveCheckbox from "../common/ActiveCheckbox";

const ProductForm = ({ product, brands, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    mainCategoryId: product?.mainCategoryId?._id || product?.mainCategoryId || "",
    brandId: product?.brandId?._id || product?.brandId || "",
    categoryId: product?.categoryId?._id || product?.categoryId || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    stock: product?.stock || 0,
    size: product?.size || "",
    sizeUnit: product?.sizeUnit || "mm",
    isActive: product?.isActive !== undefined ? product.isActive : true
  });
  const [variants, setVariants] = useState(
    product?.variants?.map(v => ({ ...v, unit: v.unit || 'mm' })) || []
  );
  const [mainCategories, setMainCategories] = useState([]);
  const [brandCategories, setBrandCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);

  // Fetch existing images if editing
  useEffect(() => {
    if (product?._id) {
      fetchExistingImages();
    }
  }, [product?._id]);

  // Fetch main categories on mount
  useEffect(() => {
    fetchMainCategories();
  }, []);

  // Fetch brand categories when brand changes
  useEffect(() => {
    if (formData.brandId) {
      fetchBrandCategories(formData.brandId);
      // Reset category if brand changes
      setFormData({ ...formData, categoryId: "" });
    } else {
      setBrandCategories([]);
      setFormData({ ...formData, categoryId: "" });
    }
  }, [formData.brandId]);

  const fetchMainCategories = async () => {
    try {
      const response = await axios.get("/api/admin/main-categories?isActive=true", {
        withCredentials: true
      });
      setMainCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch main categories:", err);
    }
  };

  const fetchBrandCategories = async (brandId) => {
    try {
      const response = await axios.get(`/api/admin/categories?brandId=${brandId}&isActive=true`, {
        withCredentials: true
      });
      setBrandCategories(response.data.categories || []);
    } catch (err) {
      console.error("Failed to fetch brand categories:", err);
      setBrandCategories([]);
    }
  };

  const fetchExistingImages = async () => {
    try {
      const response = await axios.get(
        `/api/admin/products/${product._id}/images`,
        { withCredentials: true }
      );
      setExistingImages(response.data.images || []);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    }
  };

  const handleDeleteExistingImage = async (imageId) => {
    const imageToDelete = existingImages.find(img => img._id === imageId);
    const isPrimaryImage = imageToDelete?.isPrimary;
    const isOnlyImage = existingImages.length === 1;
    
    if (isOnlyImage) {
      if (!window.confirm("This is the only image. Are you sure you want to delete it?")) return;
    } else if (isPrimaryImage) {
      if (!window.confirm("This is the primary image. After deletion, another image will be set as primary automatically. Continue?")) return;
    } else {
      if (!window.confirm("Are you sure you want to delete this image?")) return;
    }

    setDeletingImageId(imageId);
    setError("");
    try {
      await axios.delete(
        `/api/admin/products/${product._id}/images/${imageId}`,
        { withCredentials: true }
      );
      await fetchExistingImages();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete image");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSetPrimaryExisting = async (imageId) => {
    setSettingPrimaryId(imageId);
    setError("");
    try {
      await axios.put(
        `/api/admin/products/${product._id}/images/${imageId}/primary`,
        {},
        { withCredentials: true }
      );
      await fetchExistingImages();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to set primary image");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError("Please select valid image files");
      return;
    }

    // Limit to 10 images
    if (selectedImages.length + imageFiles.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    setSelectedImages([...selectedImages, ...imageFiles]);
    
    // Create previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (productId) => {
    if (selectedImages.length === 0) return;

    setUploadingImages(true);
    try {
      // Check if there's already a primary image
      const hasExistingPrimary = existingImages.some(img => img.isPrimary);
      
      // Upload images one by one
      for (let i = 0; i < selectedImages.length; i++) {
        const formData = new FormData();
        formData.append('image', selectedImages[i]);
        // Only set as primary if no existing primary image and this is the first new image
        formData.append('isPrimary', (!hasExistingPrimary && i === 0) ? 'true' : 'false');

        await axios.post(
          `/api/admin/products/${productId}/images`,
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            // Prevent UI from getting stuck forever if a request hangs
            timeout: 60000
          }
        );
      }
      
      // Refresh existing images after upload
      if (product?._id) {
        await fetchExistingImages();
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      throw err;
    } finally {
      setUploadingImages(false);
      // Clear local selections after attempt (success or fail) to avoid stuck UI
      setSelectedImages([]);
      setImagePreviews([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = product
        ? `/api/admin/products/${product._id}`
        : "/api/admin/products";
      
      const method = product ? "put" : "post";

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        variants: variants.length > 0 ? variants : undefined
      };
      
      // Remove price/stock if variants exist (they'll be calculated from variants)
      if (variants.length > 0) {
        // Price will be calculated from first variant or base price
        // Stock will be calculated from sum of variant stocks
      }

      const response = await axios[method](
        url,
        submitData,
        { withCredentials: true }
      );

      if (response.data.msg) {
        const productId = product?._id || response.data.product._id;
        
        // Upload images if any selected
        if (selectedImages.length > 0) {
          try {
            await uploadImages(productId);
          } catch (imageErr) {
            setError("Product created but failed to upload some images. You can add them later.");
            // Still call onSuccess to refresh the list
            setTimeout(() => onSuccess(), 2000);
            return;
          }
        }
        
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(false);
      // Extra safety: ensure we never keep the button stuck on "Uploading Images..."
      setUploadingImages(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Main Category *
        </label>
        <select
          value={formData.mainCategoryId}
          onChange={(e) => setFormData({ ...formData, mainCategoryId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a main category</option>
          {mainCategories
            .filter((cat) => cat.isActive)
            .map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand *
        </label>
        <select
          value={formData.brandId}
          onChange={(e) => setFormData({ ...formData, brandId: e.target.value, categoryId: "" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a brand</option>
          {brands
            .filter((brand) => brand.isActive)
            .map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Category *
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={!formData.brandId || brandCategories.length === 0}
        >
          <option value="">
            {!formData.brandId
              ? "Select a brand first"
              : brandCategories.length === 0
              ? "No categories available for this brand"
              : "Select a brand category"}
          </option>
          {brandCategories
            .filter((cat) => cat.isActive)
            .map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
        {!formData.brandId && (
          <p className="text-xs text-gray-500 mt-1">Select a brand to see its categories</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Size (Optional)
          </label>
          <input
            type="text"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            placeholder="e.g., 15, 20, 25"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            value={formData.sizeUnit}
            onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="inch">inch</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">Use this if product has only one size, or leave empty if using variants below</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Price *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={variants.length === 0}
          />
          <p className="text-xs text-gray-500 mt-1">
            {variants.length > 0 ? "Used as default for variants without specific price" : "Required if no variants"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Stock *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={variants.length === 0}
            disabled={variants.length > 0}
          />
          <p className="text-xs text-gray-500 mt-1">
            {variants.length > 0 ? "Auto-calculated from variants" : "Required if no variants"}
          </p>
        </div>
      </div>

      {/* Product Variants (Sizes) */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Variants (Different Sizes)
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Add multiple sizes for the same product. Each size can have its own unit (mm/cm/inch), price and stock.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVariants([...variants, { size: "", unit: "mm", price: formData.price || "", stock: 0, sku: "" }])}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            + Add Variant
          </button>
        </div>

        {variants.length > 0 && (
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Size *
                    </label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].size = e.target.value;
                        setVariants(newVariants);
                      }}
                      placeholder="e.g., 15, 20, 25"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={variant.unit || 'mm'}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].unit = e.target.value;
                        setVariants(newVariants);
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].price = e.target.value;
                        setVariants(newVariants);
                      }}
                      placeholder="Base price"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].stock = parseInt(e.target.value) || 0;
                        setVariants(newVariants);
                        // Auto-update total stock
                        const totalStock = newVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
                        setFormData({ ...formData, stock: totalStock });
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].sku = e.target.value;
                        setVariants(newVariants);
                      }}
                      placeholder="SKU"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newVariants = variants.filter((_, i) => i !== index);
                        setVariants(newVariants);
                        // Recalculate total stock
                        const totalStock = newVariants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
                        setFormData({ ...formData, stock: totalStock });
                      }}
                      className="w-full px-2 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ActiveCheckbox
        checked={formData.isActive}
        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
      />

      {/* Image Upload Section */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload up to 10 images. The first image will be set as primary.
        </p>
        
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={loading || uploadingImages}
        />

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-contain p-2 bg-gray-50 rounded border border-gray-300"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Existing Images (when editing) */}
        {existingImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {existingImages.map((image) => (
                <div 
                  key={image._id} 
                  className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                    image.isPrimary ? "border-blue-500 shadow-lg" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {image.isPrimary && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded z-10">
                      Primary
                    </div>
                  )}
                  <div 
                    className={`cursor-pointer ${!image.isPrimary ? 'hover:opacity-90' : ''}`}
                    onClick={() => !image.isPrimary && handleSetPrimaryExisting(image._id)}
                    title={!image.isPrimary ? "Click to set as primary" : "Primary image"}
                  >
                    <img
                      src={image.imageUrl}
                      alt="Product"
                      className="w-full h-24 object-contain p-2 bg-gray-50 pointer-events-none"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x300?text=Image+Error";
                      }}
                    />
                  </div>
                  <div className="p-1 bg-gray-50">
                    <div className="flex gap-1">
                      {image.isPrimary ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 px-1 py-0.5 text-xs bg-gray-400 text-white rounded cursor-not-allowed"
                        >
                          Primary
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryExisting(image._id)}
                          disabled={settingPrimaryId === image._id || deletingImageId === image._id}
                          className="flex-1 px-1 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingPrimaryId === image._id ? "..." : "Set"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(image._id)}
                        disabled={deletingImageId === image._id || settingPrimaryId === image._id}
                        className="flex-1 px-1 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingImageId === image._id ? "..." : "×"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || uploadingImages}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {uploadingImages 
            ? "Uploading Images..." 
            : loading 
            ? "Saving..." 
            : product 
            ? "Update" 
            : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;

