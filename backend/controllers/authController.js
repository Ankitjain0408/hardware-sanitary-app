import User from "../models/user.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTPEmail, sendSignupOTPEmail } from "../utils/emailService.js";

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request Password Reset - Send OTP
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Email validation
    if (trimmedEmail.includes(" ")) {
      return res.status(400).json({ msg: "Email cannot contain spaces" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ msg: "Enter a valid email address" });
    }

    // Check if user exists
    const user = await User.findOne({ email: trimmedEmail });
    
    // For security, always return success message even if user doesn't exist
    if (!user) {
      return res.json({ 
        msg: "If an account exists with this email, an OTP has been sent to your email address." 
      });
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Delete any existing unused password reset OTPs for this email
    await OTP.deleteMany({ email: trimmedEmail, type: "password_reset", isUsed: false });

    // Save new OTP with 10-minute expiration in MongoDB
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Exactly 10 minutes from now
    const otp = new OTP({
      email: trimmedEmail,
      otp: otpCode,
      type: "password_reset",
      expiresAt: expiresAt
    });
    await otp.save();

    // Send OTP via email
    try {
      await sendOTPEmail(trimmedEmail, otpCode);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Still return success to user (security best practice)
    }

    res.json({ 
      msg: "If an account exists with this email, an OTP has been sent to your email address."
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.trim();

    // Find valid OTP in DB (must be unused and not expired - strict 10-minute check)
    const now = new Date();
    const otpRecord = await OTP.findOne({
      email: trimmedEmail,
      otp: trimmedOTP,
      type: "password_reset",
      isUsed: false,
      expiresAt: { $gt: now }
    });

    if (!otpRecord) {
      // Check if OTP exists but is expired
      const expiredOTP = await OTP.findOne({
        email: trimmedEmail,
        otp: trimmedOTP,
        type: "password_reset",
        isUsed: false
      });
      
      if (expiredOTP && expiredOTP.expiresAt <= now) {
        return res.status(400).json({ msg: "This OTP has expired. Please request a new one." });
      }
      
      return res.status(400).json({ msg: "Invalid OTP. Please check the code and try again." });
    }

    // Generate a secure reset token stored in DB for authorization
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Mark OTP as used and save resetToken in DB
    otpRecord.isUsed = true;
    otpRecord.resetToken = resetToken;
    await otpRecord.save();

    // Secondary session fallback for single-origin dev environments
    req.session.resetPasswordEmail = trimmedEmail;
    req.session.resetPasswordOTPVerified = true;
    req.session.resetToken = resetToken;

    res.json({ 
      msg: "OTP verified successfully",
      verified: true,
      resetToken
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ msg: "Email and new password are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check authorization: Check DB for verified resetToken OR check session fallback
    let isAuthorized = false;

    if (resetToken) {
      const validOTPRecord = await OTP.findOne({
        email: trimmedEmail,
        resetToken: resetToken,
        type: "password_reset",
        isUsed: true
      });
      if (validOTPRecord) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && req.session.resetPasswordEmail === trimmedEmail && req.session.resetPasswordOTPVerified) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(400).json({ msg: "OTP verification required. Please verify OTP first." });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({ msg: "Password must be at least 8 characters" });
    }

    if (newPassword.includes(" ")) {
      return res.status(400).json({ msg: "Password cannot contain spaces" });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ msg: "Password must include at least one lowercase letter" });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ msg: "Password must include at least one uppercase letter" });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ msg: "Password must include at least one number" });
    }

    if (!/[@#$!%*?&]/.test(newPassword)) {
      return res.status(400).json({ msg: "Password must include at least one special character (@ # $ % ! * ? &)" });
    }

    // Find user
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if password contains username or email
    if (user.username && newPassword.toLowerCase().includes(user.username.toLowerCase())) {
      return res.status(400).json({ msg: "Password cannot contain your username" });
    }

    const emailPrefix = trimmedEmail.split("@")[0];
    if (newPassword.toLowerCase().includes(emailPrefix.toLowerCase())) {
      return res.status(400).json({ msg: "Password cannot contain your email" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Clear reset session
    delete req.session.resetPasswordEmail;
    delete req.session.resetPasswordOTPVerified;
    delete req.session.resetToken;

    // Invalidate all existing OTPs and reset tokens for this email
    await OTP.updateMany(
      { email: trimmedEmail },
      { isUsed: true, resetToken: null }
    );

    res.json({ msg: "Password reset successfully. Please login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

// Signup - Send OTP
export const signupSendOTP = async (req, res) => {
  console.log("🚀 signupSendOTP called");
  console.log("📥 Request body:", { username: req.body?.username, email: req.body?.email, password: req.body?.password ? "***SET***" : "NOT SET" });
  try {
    const { username, email, password } = req.body;
    console.log("✅ Request body parsed successfully");

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Username validation
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).json({ msg: "Username must be 3-20 characters" });
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({ msg: "Username must start with a letter and contain only letters, numbers, and underscores" });
    }

    if (trimmedUsername.includes("__")) {
      return res.status(400).json({ msg: "Username cannot contain consecutive underscores" });
    }

    const reservedWords = ["admin", "root", "null", "undefined", "true", "false"];
    if (reservedWords.includes(trimmedUsername.toLowerCase())) {
      return res.status(400).json({ msg: "This username is reserved and cannot be used" });
    }

    // Email validation
    if (trimmedEmail.includes(" ")) {
      return res.status(400).json({ msg: "Email cannot contain spaces" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ msg: "Enter a valid email address" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ msg: "Password must be at least 8 characters" });
    }

    if (password.includes(" ")) {
      return res.status(400).json({ msg: "Password cannot contain spaces" });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ msg: "Password must include at least one lowercase letter" });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ msg: "Password must include at least one uppercase letter" });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ msg: "Password must include at least one number" });
    }

    if (!/[@#$!%*?&]/.test(password)) {
      return res.status(400).json({ msg: "Password must include at least one special character (@ # $ % ! * ? &)" });
    }

    // Check if password contains username or email
    if (password.toLowerCase().includes(trimmedUsername.toLowerCase())) {
      return res.status(400).json({ msg: "Password cannot contain your username" });
    }

    const emailPrefix = trimmedEmail.split("@")[0];
    if (password.toLowerCase().includes(emailPrefix.toLowerCase())) {
      return res.status(400).json({ msg: "Password cannot contain your email" });
    }

    // Check for existing username or email
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(400).json({ msg: "Username already taken" });
    }

    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Generate OTP
    const otpCode = generateOTP();
    console.log(`🔐 Generated OTP for ${trimmedEmail}: ${otpCode}`);

    // Calculate expiration time (exactly 10 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log(`⏰ OTP expires at: ${otpExpiresAt.toISOString()}`);

    // Hash password upfront for secure DB storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete any existing unused signup OTPs for this email in MongoDB
    await OTP.deleteMany({ email: trimmedEmail, type: "signup", isUsed: false });

    // Store signup data and OTP in MongoDB
    const otpRecord = new OTP({
      email: trimmedEmail,
      otp: otpCode,
      type: "signup",
      signupData: {
        username: trimmedUsername,
        hashedPassword: hashedPassword
      },
      expiresAt: otpExpiresAt
    });
    await otpRecord.save();
    console.log(`💾 Stored signup data and OTP in MongoDB for ${trimmedEmail}`);

    // Store signup data in session as secondary fallback
    req.session.signupData = {
      username: trimmedUsername,
      email: trimmedEmail,
      password: password,
      otp: otpCode,
      otpExpiresAt: otpExpiresAt
    };

    // Send OTP via email
    try {
      console.log(`📧 Attempting to send signup OTP to ${trimmedEmail}`);
      await sendSignupOTPEmail(trimmedEmail, otpCode);
      console.log(`✅ Signup OTP sent successfully to ${trimmedEmail}`);
    } catch (emailError) {
      console.error("❌ Failed to send signup OTP email:", emailError);
      console.error("❌ Email error details:", {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response
      });
      return res.status(500).json({ 
        msg: "Failed to send verification email. Please check your email address and try again.",
        error: process.env.NODE_ENV === "development" ? emailError.message : undefined
      });
    }

    console.log(`📤 Sending signup OTP response for ${trimmedEmail}`);
    res.json({ 
      msg: "Verification OTP has been sent to your email address. Please check your inbox.",
      email: trimmedEmail,
      success: true
    });
  } catch (error) {
    console.error("Signup send OTP error:", error);
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

// Signup - Verify OTP and Complete Signup
export const signupVerifyOTP = async (req, res) => {
  console.log("🔐 signupVerifyOTP called");
  console.log("📥 Request body:", { email: req.body?.email, otp: req.body?.otp ? "***SET***" : "NOT SET" });
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      console.log("❌ Missing email or OTP");
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOTP = otp.trim();
    console.log(`🔐 Verifying OTP for ${trimmedEmail}, OTP length: ${trimmedOTP.length}`);

    const now = new Date();
    let username = null;
    let hashedPassword = null;
    let matchedInDB = false;

    // 1. Primary Check: Query MongoDB for active signup OTP
    const otpRecord = await OTP.findOne({
      email: trimmedEmail,
      otp: trimmedOTP,
      type: "signup",
      isUsed: false,
      expiresAt: { $gt: now }
    });

    if (otpRecord && otpRecord.signupData) {
      console.log("✅ Matched signup OTP in MongoDB");
      username = otpRecord.signupData.username;
      hashedPassword = otpRecord.signupData.hashedPassword;
      matchedInDB = true;

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();
    } else {
      // Check if expired in DB for a specific error message
      const expiredRecord = await OTP.findOne({
        email: trimmedEmail,
        otp: trimmedOTP,
        type: "signup",
        isUsed: false
      });

      if (expiredRecord && expiredRecord.expiresAt <= now) {
        console.log("❌ Signup OTP expired in DB");
        return res.status(400).json({
          msg: "This OTP has expired. Please request a new one.",
          expired: true
        });
      }

      // 2. Secondary Fallback Check: Express Session
      if (req.session.signupData && 
          req.session.signupData.email === trimmedEmail && 
          req.session.signupData.otp === trimmedOTP) {
        
        const sessionExpiresAt = new Date(req.session.signupData.otpExpiresAt);
        if (sessionExpiresAt <= now) {
          return res.status(400).json({
            msg: "This OTP has expired. Please request a new one.",
            expired: true
          });
        }

        console.log("✅ Matched signup OTP in Session fallback");
        username = req.session.signupData.username;
        hashedPassword = await bcrypt.hash(req.session.signupData.password, 10);
      }
    }

    if (!username || !hashedPassword) {
      console.log("❌ Invalid or expired OTP verification attempt");
      return res.status(400).json({ msg: "Invalid or expired OTP. Please check the code and try again." });
    }

    // Double check if username or email was registered while OTP was pending
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ msg: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    // Create user with email verified
    const user = new User({ 
      username, 
      email: trimmedEmail, 
      password: hashedPassword,
      isEmailVerified: true
    });
    await user.save();

    // Clear session signup data if present
    delete req.session.signupData;

    // Set user session
    req.session.userId = user._id;

    res.json({ 
      msg: "Email verified successfully! Your account has been created.",
      verified: true
    });
  } catch (error) {
    console.error("Signup verify OTP error:", error);
    
    // Check for duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ msg: `${field === 'username' ? 'Username' : 'Email'} already exists` });
    }
    
    res.status(500).json({ msg: "Server error. Please try again." });
  }
};

