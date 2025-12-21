import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { apiFetch } from "../utils/httpClient";

const Login = ({ handleSignIn, onClose, onLoginSuccess, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email || !form.password) {
      return "All fields are required";
    }

    const trimmedEmail = form.email.trim().toLowerCase();
    
    if (trimmedEmail.includes(" ")) {
      return "Email cannot contain spaces";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return "Enter a valid email address";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const error = validate();
    if (error) {
      setMsg(error);
      return;
    }

    try {
      // Trim and lowercase email before sending
      const dataToSend = {
        email: form.email.trim().toLowerCase(),
        password: form.password // Don't trim password
      };

      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        // Store user data in session if provided
        if (data.user) {
          // User data will be fetched by checkAuth in App.jsx
        }
        if (onClose) onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setMsg(data.msg || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMsg("Unable to login at this time. Please try again later.");
    }
  };

  const handleGuestLogin = async () => {
    setMsg("");
    try {
      const res = await apiFetch("/api/auth/guest-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ msg: "Server error" }));
        setMsg(errorData.msg || "Unable to continue as guest");
        return;
      }

      const data = await res.json();

      if (data.user) {
        if (onClose) onClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setMsg("Failed to create guest session");
      }
    } catch (error) {
      console.error("Guest login error:", error);
      if (error.name === "TypeError" || error.message?.includes("fetch") || error.message?.includes("Failed to fetch")) {
        setMsg("Unable to connect to server. Please make sure the backend server is running.");
      } else {
        setMsg("Unable to continue as guest. Please try again later.");
      }
    }
  };

  return (
    <div className="w-full">
      {/* Centered Glass Box */}
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md 
        border border-slate-600 rounded-2xl shadow-xl p-6 sm:p-8">
        
        <h1 className="text-3xl font-bold text-center text-white drop-shadow-lg mb-6">
          Login
        </h1>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          
          {/* Email */}
          <div>
            <label className="text-white font-semibold">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              required
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-200 
              border border-slate-600 outline-none focus:ring-2 focus:ring-lime-300 text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-white font-semibold">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                required
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 
                placeholder-gray-200 border border-slate-600
                outline-none focus:ring-2 focus:ring-lime-300 pr-10 text-white"
              />

              {showPassword ? (
                <FaEye
                  className="text-white absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEyeSlash
                  className="text-white absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>

          {/* Login button */}
          <button className="w-full bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold py-2.5 
            rounded-lg shadow-md hover:shadow-lg transition">
            Login
          </button>
        </form>

        {/* Error Message */}
        {msg && <p className="text-center text-red-300 text-sm mt-3">{msg}</p>}

        {/* Forgot Password Link */}
        <p
          className="text-center text-white text-sm mt-3 cursor-pointer hover:text-lime-200 transition underline"
          onClick={() => {
            if (onForgotPassword) onForgotPassword();
          }}
        >
          Forgot Password?
        </p>

        {/* Guest Login Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 
              rounded-lg shadow-md hover:shadow-lg transition"
          >
            Continue as Guest
          </button>
        </div>

        {/* Switch */}
        <p
          className="text-center text-white text-sm mt-5 cursor-pointer hover:text-lime-200 transition"
          onClick={handleSignIn}
        >
          No account? <span className="underline">Create one here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;

