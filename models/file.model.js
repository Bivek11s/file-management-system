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
});

const File = mongoose.model("File", fileSchema);

export default File;
