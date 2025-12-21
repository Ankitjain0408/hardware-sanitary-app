import { useState } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = ({ email, onBack, onPasswordReset }) => {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ newPassword: "", confirmPassword: "" });

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password.includes(" ")) {
      return "Password cannot contain spaces";
    }
    if (!/[a-z]/.test(password)) {
      return "Must include a lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Must include an uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Must include a number";
    }
    if (!/[@#$!%*?&]/.test(password)) {
      return "Must include a special character (@#$%!*?&)";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setMsg("");

    // Real-time validation
    if (name === "newPassword") {
      const error = validatePassword(value);
      setFieldErrors({ ...fieldErrors, newPassword: error });
      
      // Re-validate confirm password if it has a value
      if (form.confirmPassword) {
        const confirmError = value !== form.confirmPassword ? "Passwords do not match" : "";
        setFieldErrors({ ...fieldErrors, newPassword: error, confirmPassword: confirmError });
      }
    } else if (name === "confirmPassword") {
      const error = value !== form.newPassword ? "Passwords do not match" : "";
      setFieldErrors({ ...fieldErrors, confirmPassword: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Validation
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      setMsg(passwordError);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          newPassword: form.newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Password reset successfully! Redirecting to login...");
        if (onPasswordReset) {
          setTimeout(() => {
            onPasswordReset();
          }, 2000);
        }
      } else {
        setMsg(data.msg || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMsg("Unable to reset password. Please try again later.");
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
            Reset Password
          </h1>
        </div>

        <p className="text-white/90 text-sm mb-6">
          Enter your new password for: <span className="font-semibold">{email}</span>
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-white font-semibold">New Password</label>
            <div className="relative">
              <input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                className={`w-full p-3 rounded-lg bg-white/20 placeholder-gray-200 
                border ${fieldErrors.newPassword ? "border-red-400" : "border-slate-600"}
                outline-none focus:ring-2 focus:ring-lime-300 pr-10 text-white`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="text-white font-semibold">Confirm Password</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                className={`w-full p-3 rounded-lg bg-white/20 placeholder-gray-200 
                border ${fieldErrors.confirmPassword ? "border-red-400" : "border-slate-600"}
                outline-none focus:ring-2 focus:ring-lime-300 pr-10 text-white`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!fieldErrors.newPassword || !!fieldErrors.confirmPassword || form.newPassword !== form.confirmPassword}
            className="w-full bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold py-2.5 
            rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        {msg && (
          <p className={`text-center text-sm mt-3 ${
            msg.includes("successfully") 
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

export default ResetPassword;

