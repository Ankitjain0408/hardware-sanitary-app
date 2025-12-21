import dotenv from "dotenv";

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";

// Load .env explicitly from backend working directory (no values logged)
const dotenvResult = dotenv.config({ path: path.join(process.cwd(), ".env") });

import connectDB from "./config/db.js";
import User from "./models/user.js";

// Admin routes
import brandRoutes from "./routes/brandRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import mainCategoryRoutes from "./routes/mainCategoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import bulkProductRoutes from "./routes/bulkProductRoutes.js";
import adminProfileRoutes from "./routes/adminProfileRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";

// Auth middleware
import { requireAdmin, requireAuth } from "./middlewares/authMiddleware.js";
import { getAllBrands, trackCatalogDownload } from "./controllers/brandController.js";
import { getCategoriesByBrand } from "./controllers/categoryController.js";
import { getAllMainCategories } from "./controllers/mainCategoryController.js";
import { getSubCategoriesByMainCategory } from "./controllers/subCategoryController.js";
import { getAllProducts, getProductById } from "./controllers/productController.js";
import { searchAll } from "./controllers/searchController.js";
import { requestPasswordReset, verifyOTP, resetPassword, signupSendOTP, signupVerifyOTP } from "./controllers/authController.js";
import { getPublicAdminProfile } from "./controllers/adminProfileController.js";

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "";

app.use(express.json());

// If deploying behind a proxy (Render/Railway/Heroku/Nginx), this is required for secure cookies
app.set("trust proxy", 1);

// IMPORTANT: Allow frontend origin - CORS must be before routes
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Dev: allow localhost on any port (for Vite dev server)
      if (!IS_PROD && (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin))) {
        return callback(null, true);
      }

      // Prod: allow configured frontend domain(s) or all if not set
      if (IS_PROD) {
        if (FRONTEND_URL) {
          // Support comma-separated multiple origins
          const allowedOrigins = FRONTEND_URL.split(',').map(url => url.trim());
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
        } else {
          // If FRONTEND_URL not set, allow all origins (for initial deployment)
          // Set FRONTEND_URL in environment variables for better security
          return callback(null, true);
        }
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Type"],
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const cloudinaryEnabled =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

  if (IS_PROD) {
    return res.json({
      status: "ok",
      message: "Server is running",
      cloudinaryEnabled,
    });
  }

  const envPath = path.join(process.cwd(), ".env");
  const envFileExists = fs.existsSync(envPath);
  const cloudinaryEnvKeys = Object.keys(process.env).filter((k) => k.startsWith("CLOUDINARY_"));
  const cloudinaryKeyPresent = !!process.env.CLOUDINARY_API_KEY;
  const cloudinarySecretPresent = !!process.env.CLOUDINARY_API_SECRET;
  const dotenvLoaded = !dotenvResult?.error;
  const dotenvError = dotenvResult?.error ? String(dotenvResult.error.message || dotenvResult.error) : null;
  const dotenvParsedKeys = dotenvResult?.parsed ? Object.keys(dotenvResult.parsed) : [];

  res.json({
    status: "ok",
    message: "Server is running",
    cloudinaryEnabled,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    cloudinaryKeyPresent,
    cloudinarySecretPresent,
    cloudinaryEnvKeys,
    dotenvLoaded,
    dotenvError,
    dotenvParsedKeys,
    cwd: process.cwd(),
    envPath,
    envFileExists,
  });
});

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? "none" : "lax",
    },
  })
);

// Rate limit sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for OTP requests (prevent abuse)
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // Only 1 request per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Please wait before requesting a new OTP. You can request a new OTP in 1 minute.",
});

// ---------------- SIGNUP (with OTP verification) ----------------
app.post("/api/auth/signup/send-otp", otpLimiter, signupSendOTP);
app.post("/api/auth/signup/verify-otp", authLimiter, signupVerifyOTP);
app.post("/api/auth/signup/resend-otp", otpLimiter, signupSendOTP); // Resend OTP endpoint

// Legacy signup endpoint (kept for backward compatibility, but will be deprecated)
app.post("/api/auth/signup", async (req, res) => {
  let { username, email, password } = req.body;

  // VALIDATION - All fields required
  if (!username || !email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  // Trim inputs (except password)
  username = username.trim();
  email = email.trim().toLowerCase();

  // Username validation
  if (username.length < 3 || username.length > 20)
    return res.status(400).json({ msg: "Username must be 3-20 characters" });

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  if (!usernameRegex.test(username))
    return res.status(400).json({ msg: "Username must start with a letter and contain only letters, numbers, and underscores" });

  if (username.includes("__"))
    return res.status(400).json({ msg: "Username cannot contain consecutive underscores" });

  const reservedWords = ["admin", "root", "null", "undefined", "true", "false"];
  if (reservedWords.includes(username.toLowerCase()))
    return res.status(400).json({ msg: "This username is reserved and cannot be used" });

  // Email validation
  if (email.includes(" "))
    return res.status(400).json({ msg: "Email cannot contain spaces" });

  const emailCount = (email.match(/@/g) || []).length;
  if (emailCount !== 1)
    return res.status(400).json({ msg: "Email must contain exactly one @ symbol" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ msg: "Enter a valid email address" });

  if (email.includes("@.") || email.endsWith("@"))
    return res.status(400).json({ msg: "Enter a valid email address" });

  // Password validation
  if (password.length < 8)
    return res.status(400).json({ msg: "Password must be at least 8 characters" });

  if (password.includes(" "))
    return res.status(400).json({ msg: "Password cannot contain spaces" });

  if (!/[a-z]/.test(password))
    return res.status(400).json({ msg: "Password must include at least one lowercase letter" });

  if (!/[A-Z]/.test(password))
    return res.status(400).json({ msg: "Password must include at least one uppercase letter" });

  if (!/[0-9]/.test(password))
    return res.status(400).json({ msg: "Password must include at least one number" });

  if (!/[@#$!%*?&]/.test(password))
    return res.status(400).json({ msg: "Password must include at least one special character (@ # $ % ! * ? &)" });

  // Check if password contains username or email
  if (password.toLowerCase().includes(username.toLowerCase()))
    return res.status(400).json({ msg: "Password cannot contain your username" });

  const emailPrefix = email.split("@")[0];
  if (password.toLowerCase().includes(emailPrefix.toLowerCase()))
    return res.status(400).json({ msg: "Password cannot contain your email" });

  // Common passwords check
  const commonPasswords = ["12345678", "password", "Password1", "Password123", "123456789", "qwerty123"];
  if (commonPasswords.includes(password))
    return res.status(400).json({ msg: "This password is too common. Please choose a stronger password" });

  try {
    // Check for existing username
    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ msg: "Username already taken" });

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ msg: "Email already registered" });

    // Hash password (never log or store plain text)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.session.userId = user._id;

    res.json({ msg: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error);
    // Check for duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ msg: `${field === 'username' ? 'Username' : 'Email'} already exists` });
    }
    // Check if MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.message.includes('MongoServerError')) {
      return res.status(500).json({ msg: "Database connection error. Please try again later." });
    }
    res.status(500).json({ msg: "Server error. Please try again." });
  }
});

// ---------------- LOGIN ---------------- 
app.post("/api/auth/login", authLimiter, async (req, res) => {
  let { email, password } = req.body;

  // VALIDATION
  if (!email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  // Trim and lowercase email
  email = email.trim().toLowerCase();

  // Email validation
  if (email.includes(" "))
    return res.status(400).json({ msg: "Email cannot contain spaces" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ msg: "Enter a valid email address" });

  try {
    // Find user by email (case-insensitive search)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return generic error for security (don't reveal if email exists)
    if (!user) {
      return res.status(400).json({ msg: "Invalid login credentials" });
    }

    // Check if this is the admin account
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    
    const isAdminAccount = ADMIN_EMAIL && (email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    
    // Compare password
    let isMatch = false;
    if (isAdminAccount && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      // For admin account, try bcrypt first, then allow if plain password matches
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (err) {
        // If bcrypt comparison fails, check if it's the admin password
        isMatch = true; // Admin password matches
      }
      
      // If password is correct but not hashed, hash it for security
      if (isMatch && !user.password.startsWith('$2')) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    } else {
      // For regular users, use bcrypt comparison
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    // Always return generic error for security (don't reveal if password is wrong)
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid login credentials" });
    }

    // Set admin flag if this is the admin account
    if (isAdminAccount) {
      if (!user.isAdmin) {
        user.isAdmin = true;
        await user.save();
      }
    }

    req.session.userId = user._id;

    res.json({ 
      msg: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- PROFILE ----------------
app.get("/api/auth/profile", async (req, res) => {
  // Check if user is a guest
  if (req.session.isGuest) {
    return res.json({ 
      user: {
        _id: "guest",
        username: "Guest",
        email: null,
        isAdmin: false,
        isGuest: true
      }
    });
  }

  // Check if user is authenticated
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Not authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    res.json({ 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
        isGuest: false
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- LOGOUT ----------------
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ msg: "Logout failed" });

    res.clearCookie("connect.sid");
    res.json({ msg: "Logged out" });
  });
});

// ---------------- GUEST LOGIN ----------------
app.post("/api/auth/guest-login", (req, res) => {
  try {
    // Set guest session flag (no database entry needed)
    req.session.isGuest = true;
    req.session.userId = null; // Clear any existing userId
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ msg: "Failed to create guest session" });
      }
      
      res.json({ 
        msg: "Guest session started",
        user: {
          _id: "guest",
          username: "Guest",
          email: null,
          isAdmin: false,
          isGuest: true
        }
      });
    });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- PASSWORD RESET ----------------
app.post("/api/auth/forgot-password", otpLimiter, requestPasswordReset);
app.post("/api/auth/resend-otp", otpLimiter, requestPasswordReset); // Resend OTP endpoint
app.post("/api/auth/verify-otp", authLimiter, verifyOTP);
app.post("/api/auth/reset-password", authLimiter, resetPassword);

// ---------------- WISHLIST ROUTES ----------------
// Get wishlist
app.get("/api/wishlist", requireAuth, async (req, res) => {
  try {
    const wishlist = req.session.wishlist || [];
    res.json({ wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add item to wishlist
app.post("/api/wishlist", requireAuth, async (req, res) => {
  try {
    const { productId, name, price, imageUrl, brandName, categoryName } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({ msg: "Product ID, name, and price are required" });
    }

    if (!req.session.wishlist) {
      req.session.wishlist = [];
    }

    // Check if product already exists in wishlist
    const existingIndex = req.session.wishlist.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      // Product exists, increase quantity by 1
      req.session.wishlist[existingIndex].quantity += 1;
    } else {
      // Add new product with quantity 1
      req.session.wishlist.push({
        productId,
        name,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        brandName: brandName || null,
        categoryName: categoryName || null,
        quantity: 1
      });
    }

    res.json({ 
      msg: "Product added to wishlist",
      wishlist: req.session.wishlist 
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update wishlist item quantity
app.put("/api/wishlist/:productId", requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ msg: "Quantity must be at least 1" });
    }

    if (!req.session.wishlist) {
      return res.status(404).json({ msg: "Wishlist is empty" });
    }

    const itemIndex = req.session.wishlist.findIndex(item => item.productId === productId);
    
    if (itemIndex < 0) {
      return res.status(404).json({ msg: "Product not found in wishlist" });
    }

    req.session.wishlist[itemIndex].quantity = parseInt(quantity);

    res.json({ 
      msg: "Quantity updated",
      wishlist: req.session.wishlist 
    });
  } catch (error) {
    console.error("Update wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Remove item from wishlist
app.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.session.wishlist) {
      return res.status(404).json({ msg: "Wishlist is empty" });
    }

    req.session.wishlist = req.session.wishlist.filter(item => item.productId !== productId);

    res.json({ 
      msg: "Product removed from wishlist",
      wishlist: req.session.wishlist 
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Clear wishlist
app.delete("/api/wishlist", requireAuth, async (req, res) => {
  try {
    req.session.wishlist = [];
    res.json({ msg: "Wishlist cleared", wishlist: [] });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- PUBLIC API ROUTES (Read-only for authenticated users) ----------------
// Public read-only endpoints for brands, categories, and products
app.get("/api/brands", requireAuth, getAllBrands);
app.get("/api/main-categories", requireAuth, getAllMainCategories); // New: top-level categories
app.get("/api/sub-categories", requireAuth, getSubCategoriesByMainCategory); // New: subcategories by main category
app.get("/api/categories", requireAuth, getCategoriesByBrand); // Legacy: brand-specific categories
app.get("/api/products", requireAuth, getAllProducts);
app.get("/api/products/:id", requireAuth, getProductById);
app.get("/api/search", requireAuth, searchAll);
app.use("/api/reviews", requireAuth, reviewRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.get("/api/admin-profile", getPublicAdminProfile); // Public route for About Us page

// ---------------- PUBLIC BRAND ROUTES ----------------
// Public route for catalog download tracking (before admin routes)
app.get("/api/admin/brands/:id/catalog/download", trackCatalogDownload);

// ---------------- ADMIN ROUTES ----------------
// Protect all admin routes with requireAdmin middleware
app.use("/api/admin/brands", requireAdmin, brandRoutes);
app.use("/api/admin/categories", requireAdmin, categoryRoutes); // Legacy: brand-specific categories
app.use("/api/admin/main-categories", requireAdmin, mainCategoryRoutes); // New: top-level categories
app.use("/api/admin/sub-categories", requireAdmin, subCategoryRoutes); // New: subcategories
// Note: Order matters - more specific routes must come first
app.use("/api/admin/products/bulk", requireAdmin, bulkProductRoutes); // More specific - must come first
app.use("/api/admin/products", requireAdmin, imageRoutes); // Image routes (/:productId/images)
app.use("/api/admin/products", requireAdmin, productRoutes); // Product CRUD routes
app.use("/api/admin/profile", requireAdmin, adminProfileRoutes);
app.use("/api/admin/notifications", requireAdmin, adminNotificationRoutes);

// START SERVER
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ MongoDB connected`);
      console.log(`✅ CORS enabled for all localhost ports`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    });
    
    server.on("error", (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please stop the other server or use a different port.`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

