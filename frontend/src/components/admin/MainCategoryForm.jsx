import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ErrorAlert from "../common/ErrorAlert";
import FormButtons from "../common/FormButtons";
import ActiveCheckbox from "../common/ActiveCheckbox";

const MainCategoryForm = ({ category, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    displayOrder: category?.displayOrder || 0,
    isActive: category?.isActive !== undefined ? category.isActive : true
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category?.imageUrl || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setImagePreview(category?.imageUrl || "");
  }, [category?._id]);

  const previewUrl = useMemo(() => {
    if (imagePreview) return imagePreview;
    return "";
  }, [imagePreview]);

  const onPickFile = (file) => {
    setError("");
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!file.type?.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const uploadMainCategoryImage = async (categoryId) => {
    if (!imageFile) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await axios.post(`/api/admin/main-categories/${categoryId}/image`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res?.data?.category?.imageUrl;
      if (newUrl) setImagePreview(newUrl);
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeMainCategoryImage = async () => {
    if (!category?._id) return;
    setUploadingImage(true);
    setError("");
    try {
      const res = await axios.delete(`/api/admin/main-categories/${category._id}/image`, { withCredentials: true });
      const newUrl = res?.data?.category?.imageUrl || "";
      setImagePreview(newUrl);
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to remove category image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = category
        ? `/api/admin/main-categories/${category._id}`
        : "/api/admin/main-categories";
      
      const method = category ? "put" : "post";

      const response = await axios[method](
        url,
        formData,
        { withCredentials: true }
      );

      const savedCategory = response?.data?.category;
      if (response.data.msg && savedCategory?._id) {
        try {
          await uploadMainCategoryImage(savedCategory._id);
        } catch (imgErr) {
          setError(imgErr.response?.data?.msg || "Category saved, but image upload failed");
          return;
        }
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          placeholder="e.g., Taps & Faucets, Pipes & Fittings"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Brief description of this category"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Image (optional)
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Category"
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="text-xs text-gray-500 text-center px-2">No image</div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              disabled={loading || uploadingImage}
              onChange={(e) => onPickFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!category?._id || uploadingImage}
                onClick={removeMainCategoryImage}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                title={category?._id ? "Remove current category image" : "Save category first to manage image"}
              >
                {uploadingImage ? "Working..." : "Remove image"}
              </button>
              <div className="text-xs text-gray-500 self-center">
                {category?._id ? "You can replace image by selecting a new file and saving." : "Create category first, then it will upload."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Order
        </label>
        <input
          type="number"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
        />
        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
      </div>

      <ActiveCheckbox
        checked={formData.isActive}
        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
      />

      <FormButtons
        loading={loading || uploadingImage}
        onCancel={onCancel}
        submitLabel={category ? "Update" : "Create"}
      />
    </form>
  );
};

export default MainCategoryForm;

