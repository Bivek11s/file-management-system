import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  googleDrive: {
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
    syncEnabled: { type: Boolean, default: false },
  },
});

const User = mongoose.model("User", userSchema);

export default User;
