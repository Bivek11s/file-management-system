import mongoose from "mongoose";

const fileSchema = mongoose.Schema({
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  mimeType: { type: String, required: true },
  folder: { type: "String", default: null },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  accessLevel: {
    type: String,
    enum: ["only_me", "anyone_with_link", "timed_access"],
    default: "only_me",
  },
  shareToken: { type: String, default: null },
  shareTokenExpires: { type: Date, default: null },
});

const File = mongoose.model("File", fileSchema);

export default File;
