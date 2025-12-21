import User from "../models/user.js";

// Middleware to check if user is authenticated (allows guests)
export const requireAuth = async (req, res, next) => {
  // Allow guest users
  if (req.session.isGuest) {
    req.user = {
      _id: "guest",
      username: "Guest",
      email: null,
      isAdmin: false,
      isGuest: true
    };
    console.log("Auth: Guest user allowed");
    return next();
  }

  if (!req.session.userId) {
    console.log("Auth: No userId or guest session, returning 401");
    return res.status(401).json({ msg: "Not authenticated" });
  }
  
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Not authenticated" });
  }
  
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

