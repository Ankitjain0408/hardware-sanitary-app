import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";

function AboutUs() {
  const [adminProfile, setAdminProfile] = useState({
    aboutUs: "",
    profileImageUrl: null,
    username: "",
    businessName: "",
    businessAddress: "",
    proprietorName: "",
    gstNumber: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get("/api/admin-profile");
      setAdminProfile(response.data.profile || {});
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">About Us</h1>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 md:p-12 shadow-lg space-y-8">
          {/* Business Information - Primary Section */}
          {(adminProfile.businessName || adminProfile.businessAddress || adminProfile.proprietorName || adminProfile.gstNumber) ? (
            <>
              {adminProfile.businessName && (
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{adminProfile.businessName}</h2>
                </div>
              )}
              {adminProfile.businessAddress && (
                <p className="text-gray-700 mt-2 text-lg">{adminProfile.businessAddress}</p>
              )}
              {adminProfile.proprietorName && (
                <p className="text-gray-700 mt-2 text-lg">
                  <span className="font-semibold text-gray-900">Proprietor:</span> {adminProfile.proprietorName}
                </p>
              )}

              {adminProfile.gstNumber && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">GST Number</h3>
                  <p className="text-gray-700 font-mono text-lg">{adminProfile.gstNumber}</p>
                </div>
              )}
            </>
          ) : (
            /* Fallback to default values if admin hasn't set them */
            <>
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Shri Krishna Sanitary And Hardware</h2>
                <p className="text-gray-700 mt-2 text-lg">Rd Number 2, Kantabanji, Odisha 767039</p>
                <p className="text-gray-700 mt-2 text-lg">
                  <span className="font-semibold text-gray-900">Proprietor:</span> Mr Varun Agrawal
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">GST Number</h3>
                <p className="text-gray-700 font-mono text-lg">21CYKPA5593A1ZU</p>
              </div>
            </>
          )}

          {/* Admin Profile Section - Optional/Secondary */}
          {(adminProfile.profileImageUrl || adminProfile.aboutUs) && (
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {adminProfile.profileImageUrl && (
                  <div className="shrink-0">
                    <img
                      src={adminProfile.profileImageUrl}
                      alt={adminProfile.proprietorName || "Mr Varun Agrawal"}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-300"
                    />
                  </div>
                )}
                {!adminProfile.profileImageUrl && adminProfile.aboutUs && (
                  <div className="shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                      <FaUser className="text-4xl md:text-5xl text-gray-400" />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {adminProfile.proprietorName || "Mr Varun Agrawal"}
                  </h3>
                  {adminProfile.aboutUs && (
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {adminProfile.aboutUs}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Need help?</h3>
            <p className="text-gray-700">
              For pricing, availability, or product guidance, please reach out on the{" "}
              <Link to="/contact" className="text-slate-700 hover:text-slate-900 font-semibold">
                Contact Us
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;


