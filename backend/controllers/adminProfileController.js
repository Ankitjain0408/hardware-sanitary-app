import User from "../models/user.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import crypto from "crypto";

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.session.userId;
    
    if (!adminId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    // Return only profile fields
    res.json({
      profile: {
        username: admin.username,
        email: admin.email,
        aboutUs: admin.aboutUs || "",
        profileImageUrl: admin.profileImageUrl || null,
        businessName: admin.businessName || "",
        businessAddress: admin.businessAddress || "",
        proprietorName: admin.proprietorName || "",
        gstNumber: admin.gstNumber || ""
      }
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.session.userId;
    const { aboutUs, businessName, businessAddress, proprietorName, gstNumber } = req.body;

    if (!adminId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    // Update fields if provided
    if (aboutUs !== undefined) {
      admin.aboutUs = aboutUs;
    }
    if (businessName !== undefined) {
      admin.businessName = businessName;
    }
    if (businessAddress !== undefined) {
      admin.businessAddress = businessAddress;
    }
    if (proprietorName !== undefined) {
      admin.proprietorName = proprietorName;
    }
    if (gstNumber !== undefined) {
      admin.gstNumber = gstNumber;
    }

    await admin.save();

    res.json({
      msg: "Profile updated successfully",
      profile: {
        username: admin.username,
        email: admin.email,
        aboutUs: admin.aboutUs || "",
        profileImageUrl: admin.profileImageUrl || null,
        businessName: admin.businessName || "",
        businessAddress: admin.businessAddress || "",
        proprietorName: admin.proprietorName || "",
        gstNumber: admin.gstNumber || ""
      }
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Upload Admin Profile Image
export const uploadAdminProfileImage = async (req, res) => {
  try {
    const adminId = req.session.userId;
    const file = req.file;

    if (!adminId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    if (!file) {
      return res.status(400).json({ msg: "Image file is required" });
    }

    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    const hasCloudinary =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      return res.status(500).json({ msg: "Cloudinary is not configured on the server" });
    }

    // Remove old image from Cloudinary (best-effort)
    if (admin.profileCloudinaryPublicId) {
      try {
        await deleteFromCloudinary(admin.profileCloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete old profile image from Cloudinary:", e);
      }
    }

    const publicId = `admin_profile_${adminId}_${crypto.randomUUID()}`;
    const uploadResult = await uploadToCloudinary(file.buffer, "hardware-sanitary-admin", {
      public_id: publicId,
      overwrite: false,
    });

    admin.profileImageUrl = uploadResult.secure_url;
    admin.profileCloudinaryPublicId = uploadResult.public_id;
    await admin.save();

      res.json({
        msg: "Profile image updated",
        profile: {
          username: admin.username,
          email: admin.email,
          aboutUs: admin.aboutUs || "",
          profileImageUrl: admin.profileImageUrl,
          businessName: admin.businessName || "",
          businessAddress: admin.businessAddress || "",
          proprietorName: admin.proprietorName || "",
          gstNumber: admin.gstNumber || ""
        }
      });
  } catch (error) {
    console.error("Upload admin profile image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete Admin Profile Image
export const deleteAdminProfileImage = async (req, res) => {
  try {
    const adminId = req.session.userId;

    if (!adminId) {
      return res.status(401).json({ msg: "Not authenticated" });
    }

    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ msg: "Admin access required" });
    }

    // Delete from Cloudinary if present
    if (admin.profileCloudinaryPublicId) {
      try {
        await deleteFromCloudinary(admin.profileCloudinaryPublicId);
      } catch (e) {
        console.error("Failed to delete profile image from Cloudinary:", e);
      }
    }

    admin.profileImageUrl = null;
    admin.profileCloudinaryPublicId = null;
    await admin.save();

      res.json({
        msg: "Profile image deleted",
        profile: {
          username: admin.username,
          email: admin.email,
          aboutUs: admin.aboutUs || "",
          profileImageUrl: null,
          businessName: admin.businessName || "",
          businessAddress: admin.businessAddress || "",
          proprietorName: admin.proprietorName || "",
          gstNumber: admin.gstNumber || ""
        }
      });
  } catch (error) {
    console.error("Delete admin profile image error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Admin Profile for Public (About Us page)
export const getPublicAdminProfile = async (req, res) => {
  try {
    // Find the first admin user
    const admin = await User.findOne({ isAdmin: true });
    
    if (!admin) {
      return res.json({
        profile: {
          aboutUs: "",
          profileImageUrl: null,
          username: "",
          businessName: "",
          businessAddress: "",
          proprietorName: "",
          gstNumber: ""
        }
      });
    }

    res.json({
      profile: {
        aboutUs: admin.aboutUs || "",
        profileImageUrl: admin.profileImageUrl || null,
        username: admin.username || "",
        businessName: admin.businessName || "",
        businessAddress: admin.businessAddress || "",
        proprietorName: admin.proprietorName || "",
        gstNumber: admin.gstNumber || ""
      }
    });
  } catch (error) {
    console.error("Get public admin profile error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
