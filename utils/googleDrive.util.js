import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import User from "../models/user.model.js";
dotenv.config();

// Determine credentials path based on environment
let CREDENTIALS_PATH;
if (process.env.RENDER === 'true') {
  // On Render, Secret Files are available at /etc/secrets/<filename>
  CREDENTIALS_PATH = '/etc/secrets/credentials.json';
} else {
  // For local development, use the file in the project root
  CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
}
const serviceAccountCredentials = JSON.parse(
  fs.readFileSync(CREDENTIALS_PATH, "utf8")
);

// Create service account auth client
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountCredentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

// Create Drive client with service account auth
const drive = google.drive({ version: "v3", auth });

// Keep OAuth2 client for backward compatibility if needed
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Upload file to Google Drive using service account
export const uploadToDrive = async (user, filePath, fileName, mimeType) => {
  try {
    // Create file metadata
    const fileMetadata = {
      name: fileName,
      // Use the configured folder in .env
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || "root"],
    };

    // Create media object
    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    // Upload file using service account
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    const fileId = response.data.id;

    // Make file publicly accessible
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get shareable link
    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

    return { fileId, link: fileUrl };
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
};

// Get file info from Google Drive
export const getFileInfo = async (fileId) => {
  try {
    const response = await drive.files.get({
      fileId,
      fields: "id,name,webViewLink,webContentLink,size,mimeType",
    });

    return response.data;
  } catch (error) {
    console.error("Error getting file info from Google Drive:", error);
    throw error;
  }
};
