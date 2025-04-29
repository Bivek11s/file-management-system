import { google } from "googleapis";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Initialize OAuth2 client with validated credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const drive = google.drive({ version: "v3", auth: oauth2Client });

async function refreshAccessToken(user) {
  if (!user.googleDrive.refreshToken) {
    throw new Error("No refresh token available");
  }

  if (
    !user.googleDrive.tokenExpiry ||
    user.googleDrive.tokenExpiry < new Date()
  ) {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleDrive.refreshToken,
      grant_type: "refresh_token",
    });

    user.googleDrive.accessToken = response.data.access_token;
    user.googleDrive.tokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    await user.save();
  }

  oauth2Client.setCredentials({
    access_token: user.googleDrive.accessToken,
    refresh_token: user.googleDrive.refreshToken,
  });
}

async function uploadToDrive(user, filePath, filename, mimeType) {
  await refreshAccessToken(user);

  const fileMetadata = {
    name: filename,
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id,webViewLink",
  });

  return {
    fileId: response.data.id,
    link: response.data.webViewLink,
  };
}

export { oauth2Client, uploadToDrive };
