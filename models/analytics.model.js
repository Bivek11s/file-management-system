import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  endpoint: { type: String, required: true }, // e.g., POST
  hitCount: { type: Number, default: 1 },
  lastHit: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
