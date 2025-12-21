import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ErrorAlert from "../common/ErrorAlert";
import FormButtons from "../common/FormButtons";
import ActiveCheckbox from "../common/ActiveCheckbox";

const BrandForm = ({ brand, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: brand?.name || "",
    isActive: brand?.isActive !== undefined ? brand.isActive : true
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(brand?.imageUrl || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [catalogFile, setCatalogFile] = useState(null);
  const [catalogName, setCatalogName] = useState(brand?.catalogUrl ? "Catalog uploaded" : "");
  const [uploadingCatalog, setUploadingCatalog] = useState(false);

  useEffect(() => {
    setImagePreview(brand?.imageUrl || "");
    setCatalogName(brand?.catalogUrl ? "Catalog uploaded" : "");
  }, [brand?._id, brand?.catalogUrl]);

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

  const uploadBrandImage = async (brandId) => {
    if (!imageFile) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await axios.post(`/api/admin/brands/${brandId}/image`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res?.data?.brand?.imageUrl;
      if (newUrl) setImagePreview(newUrl);
      setImageFile(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeBrandImage = async () => {
    if (!brand?._id) return;
    setUploadingImage(true);
    setError("");
    try {
      const res = await axios.delete(`/api/admin/brands/${brand._id}/image`, { withCredentials: true });
      const newUrl = res?.data?.brand?.imageUrl || "";
      setImagePreview(newUrl);
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to remove brand image");
    } finally {
      setUploadingImage(false);
    }
  };

  const onPickCatalog = (file) => {
    setError("");
    if (!file) {
      setCatalogFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file");
      return;
    }
    setCatalogFile(file);
    setCatalogName(file.name);
  };

  const uploadBrandCatalog = async (brandId) => {
    if (!catalogFile) return;
    setUploadingCatalog(true);
    try {
      const fd = new FormData();
      fd.append("catalog", catalogFile);
      const res = await axios.post(`/api/admin/brands/${brandId}/catalog`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newUrl = res?.data?.brand?.catalogUrl;
      if (newUrl) setCatalogName("Catalog uploaded");
      setCatalogFile(null);
    } finally {
      setUploadingCatalog(false);
    }
  };

  const removeBrandCatalog = async () => {
    if (!brand?._id) return;
    setUploadingCatalog(true);
    setError("");
    try {
      const res = await axios.delete(`/api/admin/brands/${brand._id}/catalog`, { withCredentials: true });
      setCatalogName("");
      setCatalogFile(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to remove brand catalog");
    } finally {
      setUploadingCatalog(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = brand
        ? `/api/admin/brands/${brand._id}`
        : "/api/admin/brands";
      
      const method = brand ? "put" : "post";

      const response = await axios[method](
        url,
        formData,
        { withCredentials: true }
      );

      const savedBrand = response?.data?.brand;
      if (response.data.msg && savedBrand?._id) {
        try {
          await uploadBrandImage(savedBrand._id);
        } catch (imgErr) {
          setError(imgErr.response?.data?.msg || "Brand saved, but image upload failed");
          return;
        }
        try {
          await uploadBrandCatalog(savedBrand._id);
        } catch (catErr) {
          // Catalog upload failure shouldn't block success
          // Catalog upload failure handled silently
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Image (optional)</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Brand"
                className="w-full h-full object-cover"
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
                disabled={!brand?._id || uploadingImage}
                onClick={removeBrandImage}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                title={brand?._id ? "Remove current brand image" : "Save brand first to manage image"}
              >
                {uploadingImage ? "Working..." : "Remove image"}
              </button>
              <div className="text-xs text-gray-500 self-center">
                {brand?._id ? "You can replace image by selecting a new file and saving." : "Create brand first, then it will upload."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand Catalog (PDF) - Optional
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept="application/pdf"
            disabled={loading || uploadingCatalog}
            onChange={(e) => onPickCatalog(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-700"
          />
          {catalogName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{catalogName}</span>
            </div>
          )}
          {brand?._id && brand?.catalogUrl && (
            <button
              type="button"
              disabled={uploadingCatalog}
              onClick={removeBrandCatalog}
              className="px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm"
            >
              {uploadingCatalog ? "Working..." : "Remove catalog"}
            </button>
          )}
          <p className="text-xs text-gray-500">
            {brand?._id ? "You can replace catalog by selecting a new file and saving." : "Create brand first, then catalog will upload."}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <ActiveCheckbox
        checked={formData.isActive}
        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
      />

      <FormButtons
        loading={loading || uploadingImage || uploadingCatalog}
        onCancel={onCancel}
        submitLabel={brand ? "Update" : "Create"}
      />
    </form>
  );
};

export default BrandForm;

