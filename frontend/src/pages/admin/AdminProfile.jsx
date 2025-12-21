import { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaImage, FaTrash, FaSave, FaBuilding } from "react-icons/fa";

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    aboutUs: "",
    profileImageUrl: null,
    businessName: "",
    businessAddress: "",
    proprietorName: "",
    gstNumber: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/admin/profile", {
        withCredentials: true
      });
      setProfile(response.data.profile);
      setImagePreview(response.data.profile.profileImageUrl);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch profile");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      setError("Please select an image file");
      return;
    }

    setUploadingImage(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axios.post("/api/admin/profile/image", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setProfile(response.data.profile);
      setImageFile(null);
      setSuccess("Profile image updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await axios.delete("/api/admin/profile/image", {
        withCredentials: true
      });

      setProfile(response.data.profile);
      setImagePreview(null);
      setImageFile(null);
      setSuccess("Profile image deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete image");
    }
  };

  const handleSaveAboutUs = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(
        "/api/admin/profile",
        { aboutUs: profile.aboutUs },
        { withCredentials: true }
      );

      setProfile(response.data.profile);
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusinessDetails = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.put(
        "/api/admin/profile",
        {
          businessName: profile.businessName,
          businessAddress: profile.businessAddress,
          proprietorName: profile.proprietorName,
          gstNumber: profile.gstNumber
        },
        { withCredentials: true }
      );

      setProfile(response.data.profile);
      setSuccess("Business details updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update business details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="mt-2 text-gray-600">Manage your profile information displayed on the About Us page</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Profile Image Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaImage className="text-blue-600" />
              Profile Image
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-200"
                    />
                    {profile.profileImageUrl && !imageFile && (
                      <button
                        onClick={handleDeleteImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition"
                        title="Delete image"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <FaUser className="text-4xl md:text-5xl text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, at least 400x400 pixels
                  </p>
                </div>

                {imageFile && (
                  <button
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              About Us Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Us Description
                </label>
                <textarea
                  value={profile.aboutUs}
                  onChange={(e) => setProfile({ ...profile, aboutUs: e.target.value })}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter information about yourself or your business that will be displayed on the About Us page..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This content will be displayed on the public About Us page
                </p>
              </div>

              <button
                onClick={handleSaveAboutUs}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Business Details Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              Business Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shri Krishna Sanitary And Hardware"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <textarea
                  value={profile.businessAddress}
                  onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Rd Number 2, Kantabanji, Odisha 767039"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proprietor Name *
                </label>
                <input
                  type="text"
                  value={profile.proprietorName}
                  onChange={(e) => setProfile({ ...profile, proprietorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mr Varun Agrawal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number *
                </label>
                <input
                  type="text"
                  value={profile.gstNumber}
                  onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="e.g., 21CYKPA5593A1ZU"
                  maxLength={15}
                />
              </div>

              <button
                onClick={handleSaveBusinessDetails}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave />
                {loading ? "Saving..." : "Save Business Details"}
              </button>
            </div>
          </div>

          {/* Account Info (Read-only) */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
