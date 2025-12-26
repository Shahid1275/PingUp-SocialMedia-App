const { string } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
     age: 
     { type: Number },
  country: { type: String },
  state: { type: String },
    bio: {
      type: String,
      default: "",
    },
    gym: {
      type: String,
    },
    password: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["google", "apple", "password"],
      default: "password",
    },
    forgotOtp: {
      type: String,
    },
    otpexpirationTime: {
      type: Date,
    },
    otpVerifiedAt: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    links: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Add indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });
userSchema.index({ provider: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

module.exports = { User };
