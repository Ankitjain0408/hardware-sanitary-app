import React, { useState, useRef, useEffect } from "react";
import Signin from "./Signin.jsx";
import Login from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import OTPVerification from "./OTPVerification.jsx";
import ResetPassword from "./ResetPassword.jsx";
import { FaTimes } from "react-icons/fa";

const LoginPopup = ({ loginPopup, handleLoginPopup }) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const popupRef = useRef();

  const handleBackgroundClick = (e) => {
    if (e.target === popupRef.current) {
      handleLoginPopup(false);
    }
  };

  useEffect(() => {
    if (loginPopup) {
      window.addEventListener("click", handleBackgroundClick);
      return () => window.removeEventListener("click", handleBackgroundClick);
    }
  }, [loginPopup]);

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleOTPSent = (email) => {
    setResetEmail(email);
    setShowForgotPassword(false);
    setShowOTPVerification(true);
  };

  const handleOTPVerified = () => {
    setShowOTPVerification(false);
    setShowResetPassword(true);
  };

  const handlePasswordReset = () => {
    setShowResetPassword(false);
    setShowOTPVerification(false);
    setShowForgotPassword(false);
    setResetEmail("");
    handleLoginPopup(false);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOTPVerification(false);
    setShowResetPassword(false);
    setResetEmail("");
  };

  // Reset states when popup closes
  useEffect(() => {
    if (!loginPopup) {
      setShowSignIn(false);
      setShowForgotPassword(false);
      setShowOTPVerification(false);
      setShowResetPassword(false);
      setResetEmail("");
    }
  }, [loginPopup]);

  if (!loginPopup) return null;

  return (
    <div
      ref={popupRef}
      className="fixed top-0 left-0 w-full h-full z-[10001] bg-black/60 backdrop-blur-sm"
      onClick={handleBackgroundClick}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-auto">
        <div className="relative rounded-2xl bg-white/10 backdrop-blur-md shadow-xl sm:w-[600px] md:w-[380px]">
          <button
            onClick={() => handleLoginPopup(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition z-10"
          >
            <FaTimes className="text-2xl" />
          </button>
          {showResetPassword ? (
            <ResetPassword 
              email={resetEmail}
              onBack={handleBackToLogin}
              onPasswordReset={handlePasswordReset}
            />
          ) : showOTPVerification ? (
            <OTPVerification 
              email={resetEmail}
              onBack={handleBackToLogin}
              onOTPVerified={handleOTPVerified}
            />
          ) : showForgotPassword ? (
            <ForgotPassword 
              onBack={handleBackToLogin}
              onOTPSent={handleOTPSent}
            />
          ) : showSignIn ? (
            <Signin 
              handleSignIn={() => setShowSignIn(false)} 
              onClose={() => handleLoginPopup(false)}
            />
          ) : (
            <Login 
              handleSignIn={() => setShowSignIn(true)} 
              onClose={() => handleLoginPopup(false)}
              onForgotPassword={handleForgotPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;

