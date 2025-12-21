import { useState } from "react";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { apiFetch } from "../utils/httpClient";

const ForgotPassword = ({ onBack, onOTPSent }) => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setMsg("Email is required");
      setLoading(false);
      return;
    }

    // Email validation
    if (trimmedEmail.includes(" ")) {
      setMsg("Email cannot contain spaces");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setMsg("Enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(data.msg);
        if (onOTPSent) {
          setTimeout(() => {
            onOTPSent(trimmedEmail);
          }, 1500);
        }
      } else {
        setMsg(data.msg || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setMsg(`Unable to process request: ${error.message}. Please check if the server is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md 
        border border-slate-600 rounded-2xl shadow-xl p-6 sm:p-8">
        
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="text-white hover:text-gray-200 transition"
            >
              <FaArrowLeft className="text-xl" />
            </button>
          )}
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Forgot Password
          </h1>
        </div>

        <p className="text-white/90 text-sm mb-6">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-white font-semibold">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 p-3 rounded-lg bg-white/20 placeholder-gray-200 
                border border-slate-600 outline-none focus:ring-2 focus:ring-lime-300 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold py-2.5 
            rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Getting OTP..." : "Get OTP"}
          </button>
        </form>

        {msg && (
          <p className={`text-center text-sm mt-3 ${
            msg.includes("sent") || msg.includes("OTP") 
              ? "text-green-300" 
              : "text-red-300"
          }`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

