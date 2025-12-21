import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster lookups
OTPSchema.index({ email: 1, expiresAt: 1 });
// Note: TTL index removed to prevent premature deletion - we handle expiration manually

const OTP = mongoose.model("OTP", OTPSchema);

export default OTP;

