// models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    appliedOn: { type: Date, default: Date.now },
});

export default mongoose.model("Application", applicationSchema);