import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  // Admin profile fields
  aboutUs: { type: String, default: "" },
  profileImageUrl: { type: String, default: null },
  profileCloudinaryPublicId: { type: String, default: null },
  // Business details fields
  businessName: { type: String, default: "" },
  businessAddress: { type: String, default: "" },
  proprietorName: { type: String, default: "" },
  gstNumber: { type: String, default: "" }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const User = mongoose.model("User", UserSchema);

export default User;

