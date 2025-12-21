import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import OTPVerification from "./OTPVerification.jsx";
import { apiFetch } from "../utils/httpClient";

const Signin = ({ handleSignIn, onClose, onSignupSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [focusedField, setFocusedField] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  // Reserved words
  const reservedWords = ["admin", "root", "null", "undefined", "true", "false"];

  const getFieldRequirements = (name) => {
    if (name === "username") {
      return [
        "3-20 characters",
        "Must start with a letter",
        "Only letters, numbers, and underscores",
        "No spaces or special characters",
        "No consecutive underscores"
      ];
    } else if (name === "email") {
      return [
        "Valid email format (name@domain.com)",
        "No spaces",
        "One @ symbol only"
      ];
    } else if (name === "password") {
      return [
        "At least 8 characters",
        "One uppercase letter (A-Z)",
        "One lowercase letter (a-z)",
        "One number (0-9)",
        "One special character (@#$%!*?&)",
        "No spaces",
        "Cannot contain username or email"
      ];
    } else if (name === "confirmPassword") {
      return [
        "Must match password exactly"
      ];
    }
    return [];
  };

  const validateField = (name, value, currentForm = form) => {
    let error = "";

    if (name === "username") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        if (trimmed.length < 3 || trimmed.length > 20) {
          error = "Username must be 3-20 characters";
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(trimmed)) {
          error = "Must start with a letter, only letters, numbers, and underscores";
        } else if (trimmed.includes("__")) {
          error = "Cannot contain consecutive underscores";
        } else if (reservedWords.includes(trimmed.toLowerCase())) {
          error = "This username is reserved";
        }
      }
    } else if (name === "email") {
      const trimmed = value.trim().toLowerCase();
      if (trimmed.length > 0) {
        if (trimmed.includes(" ")) {
          error = "Email cannot contain spaces";
        } else if ((trimmed.match(/@/g) || []).length !== 1) {
          error = "Email must contain exactly one @ symbol";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
          error = "Enter a valid email address";
        } else if (trimmed.includes("@.") || trimmed.endsWith("@")) {
          error = "Enter a valid email address";
        }
      }
    } else if (name === "password") {
      if (value.length > 0) {
        if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (value.includes(" ")) {
          error = "Password cannot contain spaces";
        } else if (!/[a-z]/.test(value)) {
          error = "Must include a lowercase letter";
        } else if (!/[A-Z]/.test(value)) {
          error = "Must include an uppercase letter";
        } else if (!/[0-9]/.test(value)) {
          error = "Must include a number";
        } else if (!/[@#$!%*?&]/.test(value)) {
          error = "Must include a special character (@#$%!*?&)";
        } else if (currentForm.username && value.toLowerCase().includes(currentForm.username.trim().toLowerCase())) {
          error = "Cannot contain your username";
        } else if (currentForm.email && value.toLowerCase().includes(currentForm.email.trim().split("@")[0].toLowerCase())) {
          error = "Cannot contain your email";
        }
      }
    } else if (name === "confirmPassword") {
      if (value.length > 0) {
        if (value !== currentForm.password) {
          error = "Passwords do not match";
        }
      }
    }

    return error;
  };

  const checkFieldValid = (name, value, currentForm = form) => {
    const error = validateField(name, value, currentForm);
    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    
    // Real-time validation
    const error = validateField(name, value, updatedForm);
    const newFieldErrors = { ...fieldErrors, [name]: error };
    
    // If password changed, re-validate confirm password
    if (name === "password") {
      const confirmError = updatedForm.confirmPassword 
        ? (updatedForm.confirmPassword !== value ? "Passwords do not match" : "")
        : "";
      newFieldErrors.confirmPassword = confirmError;
    }
    
    // If username or email changed, re-validate password
    if (name === "username" || name === "email") {
      if (updatedForm.password) {
        const passwordError = validateField("password", updatedForm.password, updatedForm);
        newFieldErrors.password = passwordError;
      }
    }
    
    setFieldErrors(newFieldErrors);
    
    // Clear main error message when user starts typing
    if (msg) setMsg("");
  };

  const validate = () => {
    // Required fields check
    if (!form.username || !form.email || !form.password || !form.confirmPassword)
      return "All fields are required";

    // Username validation
    const trimmedUsername = form.username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20)
      return "Username must be 3-20 characters";

    // Username regex: ^[a-zA-Z][a-zA-Z0-9_]{2,19}$
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    if (!usernameRegex.test(trimmedUsername))
      return "Username must start with a letter, contain only letters, numbers, and underscores (no spaces or special characters)";

    // Check for consecutive underscores
    if (trimmedUsername.includes("__"))
      return "Username cannot contain consecutive underscores";

    // Check reserved words
    if (reservedWords.includes(trimmedUsername.toLowerCase()))
      return "This username is reserved and cannot be used";

    // Email validation
    const trimmedEmail = form.email.trim().toLowerCase();
    if (trimmedEmail.includes(" "))
      return "Email cannot contain spaces";

    const emailCount = (trimmedEmail.match(/@/g) || []).length;
    if (emailCount !== 1)
      return "Email must contain exactly one @ symbol";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail))
      return "Enter a valid email address";

    // Check for invalid domains
    if (trimmedEmail.includes("@.") || trimmedEmail.endsWith("@"))
      return "Enter a valid email address";

    // Password validation
    if (form.password.length < 8)
      return "Password must be at least 8 characters";

    if (form.password.includes(" "))
      return "Password cannot contain spaces";

    if (!/[a-z]/.test(form.password))
      return "Password must include at least one lowercase letter";

    if (!/[A-Z]/.test(form.password))
      return "Password must include at least one uppercase letter";

    if (!/[0-9]/.test(form.password))
      return "Password must include at least one number";

    if (!/[@#$!%*?&]/.test(form.password))
      return "Password must include at least one special character (@ # $ % ! * ? &)";

    // Check if password matches username or email
    if (form.password.toLowerCase().includes(trimmedUsername.toLowerCase()))
      return "Password cannot contain your username";

    if (form.password.toLowerCase().includes(trimmedEmail.split("@")[0].toLowerCase()))
      return "Password cannot contain your email";

    // Common passwords check
    const commonPasswords = ["12345678", "password", "Password1", "Password123", "123456789", "qwerty123"];
    if (commonPasswords.includes(form.password))
      return "This password is too common. Please choose a stronger password";

    // Confirm password validation
    if (form.password !== form.confirmPassword)
      return "Passwords do not match";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) return setMsg(error);

    try {
      // Trim and lowercase email before sending
      const dataToSend = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password // Don't trim password
      };

      const res = await apiFetch("/api/auth/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        try {
          const errorData = await res.json();
          setMsg(errorData.msg || "Unable to send verification code. Please check your information and try again.");
        } catch (parseError) {
          setMsg("Unable to send verification code. Please try again.");
        }
        return;
      }

      const data = await res.json();
      if (data.msg) {
        setMsg(data.msg);
        setSignupEmail(data.email || form.email.trim().toLowerCase());
        setTimeout(() => {
          setShowOTPVerification(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (error.name === "TypeError" || error.message?.includes("fetch") || error.message?.includes("Failed to fetch")) {
        setMsg("Unable to connect to server. Please make sure the backend server is running.");
      } else {
        setMsg("Unable to create account at this time. Please try again later.");
      }
    }
  };

  const handleOTPVerified = () => {
    // OTP verification and account creation is already done by the OTPVerification component
    // Just show success message and redirect
    setMsg("Account created successfully! Please login.");
    setTimeout(() => {
      if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        handleSignIn();
      }
    }, 1500);
  };

  const handleBackToSignup = () => {
    setShowOTPVerification(false);
    setSignupEmail("");
    setMsg("");
  };

  const handleResendSignupOTP = async () => {
    try {
      // Resend OTP with the same signup data
      const dataToSend = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password // Don't trim password
      };

      const res = await apiFetch("/api/auth/signup/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to resend OTP");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Resend signup OTP error:", error);
      throw error;
    }
  };

  // If OTP verification is shown, display that instead
  if (showOTPVerification) {
    return (
      <OTPVerification 
        email={signupEmail}
        onBack={handleBackToSignup}
        onOTPVerified={handleOTPVerified}
        verifyEndpoint="/api/auth/signup/verify-otp"
        onResendOTP={handleResendSignupOTP}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Glass Box */}
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md 
        border border-slate-600 rounded-2xl shadow-xl p-6 sm:p-8">

        <h1 className="text-3xl font-bold text-center text-white drop-shadow-lg mb-6">
          Create Your Account
        </h1>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

          {/* Username */}
          <div>
            <label className="text-white font-semibold">Username</label>
            <input
              name="username"
              type="text"
              placeholder=""
              value={form.username}
              onChange={handleChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField("")}
              className={`w-full p-3 rounded-lg bg-white/20 text-white
              placeholder-gray-200 border ${
                fieldErrors.username ? "border-red-400" : "border-slate-600"
              } outline-none focus:ring-2 focus:ring-lime-300`}
            />
            {focusedField === "username" && !checkFieldValid("username", form.username) && (
              <div className="mt-2 p-2 bg-white/10 rounded-lg border border-slate-500">
                <p className="text-xs text-white font-semibold mb-1">Requirements:</p>
                <ul className="text-xs text-gray-200 space-y-0.5">
                  {getFieldRequirements("username").map((req, idx) => {
                    const trimmed = form.username.trim();
                    const isValid = 
                      (idx === 0 && trimmed.length >= 3 && trimmed.length <= 20) ||
                      (idx === 1 && /^[a-zA-Z]/.test(trimmed)) ||
                      (idx === 2 && /^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed)) ||
                      (idx === 3 && !trimmed.match(/[^a-zA-Z0-9_]/)) ||
                      (idx === 4 && !trimmed.includes("__"));
                    return (
                      <li key={idx} className={isValid ? "text-green-300" : ""}>
                        {isValid ? "✓ " : "• "}{req}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {fieldErrors.username && (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-white font-semibold">Email</label>
            <input
              name="email"
              type="email"
              placeholder=""
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              className={`w-full p-3 rounded-lg bg-white/20 text-white
              placeholder-gray-200 border ${
                fieldErrors.email ? "border-red-400" : "border-slate-600"
              } outline-none focus:ring-2 focus:ring-lime-300`}
            />
            {focusedField === "email" && !checkFieldValid("email", form.email) && (
              <div className="mt-2 p-2 bg-white/10 rounded-lg border border-slate-500">
                <p className="text-xs text-white font-semibold mb-1">Requirements:</p>
                <ul className="text-xs text-gray-200 space-y-0.5">
                  {getFieldRequirements("email").map((req, idx) => {
                    const trimmed = form.email.trim().toLowerCase();
                    const isValid = 
                      (idx === 0 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) ||
                      (idx === 1 && !trimmed.includes(" ")) ||
                      (idx === 2 && (trimmed.match(/@/g) || []).length === 1);
                    return (
                      <li key={idx} className={isValid ? "text-green-300" : ""}>
                        {isValid ? "✓ " : "• "}{req}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {fieldErrors.email && (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-white font-semibold">Password</label>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder=""
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-3 rounded-lg bg-white/20 text-white
                placeholder-gray-200 border ${
                  fieldErrors.password ? "border-red-400" : "border-slate-600"
                } outline-none focus:ring-2 focus:ring-lime-300 pr-10`}
              />

              {showPassword ? (
                <FaEye
                  className="text-white absolute top-1/2 right-3 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEyeSlash
                  className="text-white absolute top-1/2 right-3 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
            {focusedField === "password" && !checkFieldValid("password", form.password) && (
              <div className="mt-2 p-2 bg-white/10 rounded-lg border border-slate-500">
                <p className="text-xs text-white font-semibold mb-1">Requirements:</p>
                <ul className="text-xs text-gray-200 space-y-0.5">
                  {getFieldRequirements("password").map((req, idx) => {
                    const isValid = 
                      (idx === 0 && form.password.length >= 8) ||
                      (idx === 1 && /[A-Z]/.test(form.password)) ||
                      (idx === 2 && /[a-z]/.test(form.password)) ||
                      (idx === 3 && /[0-9]/.test(form.password)) ||
                      (idx === 4 && /[@#$!%*?&]/.test(form.password)) ||
                      (idx === 5 && !form.password.includes(" ")) ||
                      (idx === 6 && form.username && !form.password.toLowerCase().includes(form.username.trim().toLowerCase()) && form.email && !form.password.toLowerCase().includes(form.email.trim().split("@")[0].toLowerCase()));
                    return (
                      <li key={idx} className={isValid ? "text-green-300" : ""}>
                        {isValid ? "✓ " : "• "}{req}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {fieldErrors.password && (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-white font-semibold">Confirm Password</label>

            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder=""
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField("")}
                className={`w-full p-3 rounded-lg bg-white/20 text-white
                placeholder-gray-200 border ${
                  fieldErrors.confirmPassword ? "border-red-400" : "border-slate-600"
                } outline-none focus:ring-2 focus:ring-lime-300 pr-10`}
              />

              {showConfirmPassword ? (
                <FaEye
                  className="text-white absolute top-1/2 right-3 cursor-pointer"
                  onClick={() => setShowConfirmPassword(false)}
                />
              ) : (
                <FaEyeSlash
                  className="text-white absolute top-1/2 right-3 cursor-pointer"
                  onClick={() => setShowConfirmPassword(true)}
                />
              )}
            </div>
            {focusedField === "confirmPassword" && !checkFieldValid("confirmPassword", form.confirmPassword) && (
              <div className="mt-2 p-2 bg-white/10 rounded-lg border border-slate-500">
                <p className="text-xs text-white font-semibold mb-1">Requirements:</p>
                <ul className="text-xs text-gray-200 space-y-0.5">
                  {getFieldRequirements("confirmPassword").map((req, idx) => {
                    const isValid = form.confirmPassword === form.password;
                    return (
                      <li key={idx} className={isValid ? "text-green-300" : ""}>
                        {isValid ? "✓ " : "• "}{req}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Button */}
          <button className="w-full bg-lime-400 hover:bg-lime-500 
            text-gray-900 font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition">
            Create Account
          </button>
        </form>

        {msg && <p className="text-center text-red-300 text-sm mt-3">{msg}</p>}

        <p
          className="text-center text-white text-sm mt-5 cursor-pointer hover:text-lime-200 transition"
          onClick={handleSignIn}
        >
          Already have an account? <span className="underline">Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signin;

