// models/Opportunity.js
import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    description: String,
    requiredSkills: [String],
    duration: String,
    location: String,
    status: { type: String, enum: ["open", "close"], default: "open" },
    createdAt: { type: Date, default: Date.now },
    expiryDate: Date, // ⭐ Added field from your request
});

export default mongoose.model("Opportunity", opportunitySchema);