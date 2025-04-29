import multer from "multer";
import path from "path";
import sanitizeFilename from "sanitize-filename";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    const userId = req.user;
    const uploadPath = path.join(process.env.UPLOADS_PATH, `user_${userId}`);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedName = sanitizeFilename(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const hashedName = crypto
      .createHash("sha256")
      .update(sanitizedName + uniqueSuffix)
      .digest("hex");
    cb(null, `${hashedName}${path.extname(sanitizedName)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "video/mp4",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed: JPEG, PNG, PDF, MP4, TXT, DOC, DOCX"
      ),
      false
    );
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export default upload;
