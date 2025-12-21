import React, { useState } from "react";
import Login from "./Login.jsx";
import Signin from "./Signin.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import OTPVerification from "./OTPVerification.jsx";
import ResetPassword from "./ResetPassword.jsx";

const LoginPage = ({ onLoginSuccess }) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

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
    setResetEmail("");
    // Show login again
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowOTPVerification(false);
    setShowResetPassword(false);
    setResetEmail("");
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative flex items-center justify-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 w-full max-w-md px-4">
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
            onClose={null}
            onSignupSuccess={() => setShowSignIn(false)}
          />
        ) : (
          <Login 
            handleSignIn={() => setShowSignIn(true)} 
            onClose={null}
            onLoginSuccess={onLoginSuccess}
            onForgotPassword={handleForgotPassword}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;

