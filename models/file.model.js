import mongoose from "mongoose";

const fileSchema = mongoose.Schema({
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  mimeType: { type: String, required: true },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  }, // Reference to Folder,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  accessLevel: {
    type: String,
    enum: ["only_me", "anyone_with_link", "timed_access"],
    default: "only_me",
  },
  shareToken: { type: String, default: null },
  shareTokenExpires: { type: Date, default: null },
  downloadCount: { type: Number, default: 0 },
  //for google drive
  googleDrive: {
    fileId: { type: String, default: null },
    link: { type: String, default: null },
    syncStatus: {
      type: String,
      enum: ["pending", "synced", "failed", "not_synced"],
      default: "not_synced",
    },
  },
});

const File = mongoose.model("File", fileSchema);

export default File;
