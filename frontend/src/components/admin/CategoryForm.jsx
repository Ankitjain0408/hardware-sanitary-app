import { useState, useEffect } from "react";
import axios from "axios";
import ErrorAlert from "../common/ErrorAlert";
import FormButtons from "../common/FormButtons";
import ActiveCheckbox from "../common/ActiveCheckbox";

const CategoryForm = ({ category, brands, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    brandId: category?.brandId?._id || category?.brandId || "",
    name: category?.name || "",
    isActive: category?.isActive !== undefined ? category.isActive : true
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = category
        ? `/api/admin/categories/${category._id}`
        : "/api/admin/categories";
      
      const method = category ? "put" : "post";

      const response = await axios[method](
        url,
        formData,
        { withCredentials: true }
      );

      if (response.data.msg) {
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
          Brand *
        </label>
        <select
          value={formData.brandId}
          onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
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
          Category Name *
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
        loading={loading}
        onCancel={onCancel}
        submitLabel={category ? "Update" : "Create"}
      />
    </form>
  );
};

export default CategoryForm;

