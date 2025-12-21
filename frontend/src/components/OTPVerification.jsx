import { useState, useRef, useEffect } from "react";
import { FaArrowLeft, FaKey, FaRedo } from "react-icons/fa";
import { apiFetch } from "../utils/httpClient";

const OTPVerification = ({ email, onBack, onOTPVerified, verifyEndpoint = "/api/auth/verify-otp", onResendOTP }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpExpiryTime, setOtpExpiryTime] = useState(600); // 10 minutes in seconds (OTP expiration)
  const [resendCooldown, setResendCooldown] = useState(60); // 1 minute in seconds (resend cooldown)
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Initialize timers
    setOtpExpiryTime(600); // 10 minutes for OTP expiration
    setResendCooldown(60); // 1 minute for resend cooldown
    setCanResend(false);

    // Timer for OTP expiration (10 minutes)
    const expiryTimer = setInterval(() => {
      setOtpExpiryTime((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Timer for resend cooldown (1 minute)
    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(expiryTimer);
      clearInterval(cooldownTimer);
    };
  }, [email]); // Reset timers when email changes

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setMsg("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setMsg("Please enter the complete 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch(verifyEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (res.ok && data.verified) {
        setMsg("OTP verified successfully!");
        if (onOTPVerified) {
          setTimeout(() => {
            onOTPVerified();
          }, 1000);
        }
      } else {
        setMsg(data.msg || "Invalid or expired OTP. Please try again.");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        
        // If OTP expired, enable resend (but still respect cooldown if it's active)
        if (data.msg?.includes("expired") || data.expired) {
          if (resendCooldown <= 0) {
            setCanResend(true);
          }
          setOtpExpiryTime(0);
        }
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setMsg("Unable to verify OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendLoading) return;
    
    setResendLoading(true);
    setMsg("");
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    try {
      if (onResendOTP) {
        // Use custom resend handler (for signup flow)
        await onResendOTP();
        setMsg("New OTP has been sent to your email address.");
        // Reset timers: OTP expiry (10 min) and resend cooldown (1 min)
        setOtpExpiryTime(600);
        setResendCooldown(60);
        setCanResend(false);
      } else {
        // Default resend for password reset
        const resendEndpoint = verifyEndpoint.includes("signup") 
          ? "/api/auth/signup/resend-otp"
          : "/api/auth/resend-otp";
        
        const res = await fetch(resendEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
          setMsg(data.msg || "New OTP has been sent to your email address.");
          // Reset timers: OTP expiry (10 min) and resend cooldown (1 min)
          setOtpExpiryTime(600);
          setResendCooldown(60);
          setCanResend(false);
        } else {
          setMsg(data.msg || "Failed to resend OTP. Please try again.");
        }
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setMsg("Unable to resend OTP. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            {verifyEndpoint.includes("signup") ? "Verify Your Email" : "Verify OTP"}
          </h1>
        </div>

        <p className="text-white/90 text-sm mb-2">
          {verifyEndpoint.includes("signup") 
            ? "Enter the 6-digit verification code sent to:" 
            : "Enter the 6-digit OTP sent to:"}
        </p>
        <p className="text-white font-semibold mb-6">{email}</p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-white font-semibold mb-3 block">OTP Code</label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold rounded-lg bg-white/20 
                  border border-slate-600 outline-none focus:ring-2 focus:ring-lime-300 text-white"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold py-2.5 
            rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {msg && (
          <p className={`text-center text-sm mt-3 ${
            msg.includes("verified") || msg.includes("successfully")
              ? "text-green-300" 
              : "text-red-300"
          }`}>
            {msg}
          </p>
        )}

        <div className="mt-4 space-y-2">
          {otpExpiryTime > 0 && (
            <p className="text-center text-white/70 text-xs">
              OTP expires in: <span className="font-semibold text-white">{formatTime(otpExpiryTime)}</span>
            </p>
          )}
          
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="w-full flex items-center justify-center gap-2 text-sm text-lime-300 hover:text-lime-200 
                font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaRedo className={resendLoading ? "animate-spin" : ""} />
              {resendLoading ? "Sending new OTP..." : "Request New OTP"}
            </button>
          ) : (
            <p className="text-center text-white/70 text-xs">
              Didn't receive OTP? Check your email or wait {formatTime(resendCooldown)} to request a new one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;

