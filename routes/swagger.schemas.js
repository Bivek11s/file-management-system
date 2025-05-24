/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *           example: "password123"
 *         googleDrive:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: Google Drive access token
 *               example: "ya29.a0AfB_byC3-JnbPHn8hYzNzI..."
 *             refreshToken:
 *               type: string
 *               description: Google Drive refresh token
 *               example: "1//04eXyA2WQnm-ACgYIARAAGAQSNwF..."
 *             tokenExpiry:
 *               type: string
 *               format: date-time
 *               description: Token expiry date
 *               example: "2023-12-31T23:59:59Z"
 *             syncEnabled:
 *               type: boolean
 *               description: Whether Google Drive sync is enabled
 *               example: true
 *
 *     File:
 *       type: object
 *       required:
 *         - fileName
 *         - path
 *         - size
 *         - mimeType
 *         - owner
 *       properties:
 *         fileName:
 *           type: string
 *           description: Name of the file
 *           example: "document.pdf"
 *         path:
 *           type: string
 *           description: File path in the system
 *           example: "/uploads/user123/document.pdf"
 *         size:
 *           type: number
 *           description: File size in bytes
 *           example: 1048576
 *         uploadDate:
 *           type: string
 *           format: date-time
 *           description: Date when file was uploaded
 *           example: "2023-06-15T14:30:00Z"
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *           example: "application/pdf"
 *         folder:
 *           type: string
 *           description: ID of the parent folder
 *           example: "60d21b4667d0d8992e610c85"
 *         owner:
 *           type: string
 *           description: ID of the file owner
 *           example: "60d21b4667d0d8992e610c84"
 *         sharedWith:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs the file is shared with
 *           example: ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
 *         accessLevel:
 *           type: string
 *           enum: [only_me, anyone_with_link, timed_access]
 *           description: File access level
 *           example: "anyone_with_link"
 *         shareToken:
 *           type: string
 *           description: Token for file sharing
 *           example: "abc123def456ghi789"
 *         shareTokenExpires:
 *           type: string
 *           format: date-time
 *           description: Share token expiry date
 *           example: "2023-12-31T23:59:59Z"
 *         downloadCount:
 *           type: number
 *           description: Number of times file has been downloaded
 *           example: 42
 *         googleDrive:
 *           type: object
 *           properties:
 *             fileId:
 *               type: string
 *               description: Google Drive file ID
 *               example: "1Pt5xOvXnTFJ8lV9tK3lLcLa2XYZ"
 *             link:
 *               type: string
 *               description: Google Drive file link for direct access
 *               example: "https://drive.google.com/uc?id=1Pt5xOvXnTFJ8lV9tK3lLcLa2XYZ"
 *             syncStatus:
 *               type: string
 *               enum: [pending, synced, failed, not_synced]
 *               description: Google Drive sync status
 *               example: "synced"
 *
 *     Folder:
 *       type: object
 *       required:
 *         - name
 *         - owner
 *       properties:
 *         name:
 *           type: string
 *           description: Folder name
 *           example: "Documents"
 *         owner:
 *           type: string
 *           description: ID of the folder owner
 *           example: "60d21b4667d0d8992e610c84"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Folder creation date
 *           example: "2023-06-15T14:30:00Z"
 *         sharedWith:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs the folder is shared with
 *           example: ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
 *
 *     Analytics:
 *       type: object
 *       required:
 *         - user
 *         - endpoint
 *       properties:
 *         user:
 *           type: string
 *           description: ID of the user
 *           example: "60d21b4667d0d8992e610c84"
 *         endpoint:
 *           type: string
 *           description: API endpoint
 *           example: "/file/download/id/60d21b4667d0d8992e610c85"
 *         hitCount:
 *           type: number
 *           description: Number of hits to the endpoint
 *           example: 15
 *         lastHit:
 *           type: string
 *           format: date-time
 *           description: Last hit timestamp
 *           example: "2023-06-15T14:30:00Z"
 *
 *   parameters:
 *     FileId:
 *       name: id
 *       in: path
 *       description: ID of the file
 *       required: true
 *       schema:
 *         type: string
 *       example: "60d21b4667d0d8992e610c85"
 *
 *     FolderId:
 *       name: id
 *       in: path
 *       description: ID of the folder
 *       required: true
 *       schema:
 *         type: string
 *       example: "60d21b4667d0d8992e610c85"
 *
 *     FileName:
 *       name: name
 *       in: path
 *       description: Name of the file
 *       required: true
 *       schema:
 *         type: string
 *       example: "document.pdf"
 *
 *     ShareToken:
 *       name: shareToken
 *       in: path
 *       description: Token for accessing shared file
 *       required: true
 *       schema:
 *         type: string
 *       example: "abc123def456ghi789"
 *
 *     AccessLevel:
 *       name: accessLevel
 *       in: body
 *       description: Access level for the file
 *       required: true
 *       schema:
 *         type: string
 *         enum: [only_me, anyone_with_link, timed_access]
 *       example: "anyone_with_link"
 *
 *     FolderName:
 *       name: name
 *       in: body
 *       description: Name of the folder
 *       required: true
 *       schema:
 *         type: string
 *       example: "Documents"
 *
 *     DriveSync:
 *       name: enabled
 *       in: body
 *       description: Whether to enable Google Drive sync
 *       required: true
 *       schema:
 *         type: boolean
 *       example: true
 *
 *     FileUpload:
 *       name: file
 *       in: formData
 *       description: File to upload
 *       required: true
 *       type: file
 *
 *   requestBodies:
 *     UserRegistration:
 *       description: User registration information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *
 *     UserLogin:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *
 *     FolderCreate:
 *       description: Folder creation information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Documents"
 *
 *     FolderRename:
 *       description: Folder rename information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Documents"
 *
 *     FileAccessUpdate:
 *       description: File access level update information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessLevel
 *             properties:
 *               accessLevel:
 *                 type: string
 *                 enum: [only_me, anyone_with_link, timed_access]
 *                 example: "anyone_with_link"
 *
 *     DriveSyncUpdate:
 *       description: Google Drive sync settings update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Whether to enable or disable Google Drive sync
 *                 example: true
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "error"
 *               message:
 *                 type: string
 *                 example: "Unauthorized"
 *
 *     NotFoundError:
 *       description: The specified resource was not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "error"
 *               message:
 *                 type: string
 *                 example: "Resource not found"
 *
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "error"
 *               message:
 *                 type: string
 *                 example: "Validation failed"
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       example: "email"
 *                     message:
 *                       type: string
 *                       example: "Invalid email format"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
