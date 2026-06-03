// models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, required: true, unique: true },
    password: String,
    provider: { type: String, default: "local" },
    providerId: String,
    role: { type: String, enum: ["NGO", "VOLUNTEER"], default: "VOLUNTEER" },
    skills: { type: [String], default: [] },
    location: String,
    bio: String,
    organizationName: String,
    organizationDescription: String,
    websiteUrl: String,
    // ⭐ NEW FIELD for profile image
    profilePicUrl: { type: String, default: null }, 
    // Password reset token (hashed) and expiration
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("User", userSchema);