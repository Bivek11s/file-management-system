import mongoose from "mongoose";

const folderSchema = mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For future sharing
});

const Folder = mongoose.model("Folder", folderSchema);

export default Folder;
