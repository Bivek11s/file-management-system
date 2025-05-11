# File Management System

A robust file management system with features like file upload, download, sharing, and Google Drive integration.

## Features

- File upload and download
- Folder management
- File sharing with customizable access levels
- Google Drive integration
- Usage analytics
- Rate limiting for security
- JWT-based authentication

## API Documentation

The API documentation is available via Swagger UI at:
```
http://localhost:5000/api-docs
```

This interactive documentation provides detailed information about all available endpoints, request/response schemas, and allows you to test the API directly from the browser.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
```

3. Start the server:
```bash
npm run dev
```

The server will start on port 5000.

## API Endpoints

### Users
- POST `/user/register` - Register a new user
- POST `/user/login` - Login user
- GET `/user/google` - Start Google OAuth flow

### Files
- POST `/file/upload` - Upload a file
- GET `/file/list` - List user's files
- GET `/file/download/id/:id` - Download file by ID
- PATCH `/file/access/update/:id` - Update file access level

### Folders
- POST `/folder/create` - Create a new folder
- GET `/folder/list` - List user's folders
- GET `/folder/list/files/:id` - List files in a folder

### Analytics
- GET `/analytics/summary` - Get usage summary
- GET `/analytics/detailed` - Get detailed analytics

For detailed API documentation, please refer to the Swagger documentation at `/api-docs`.
