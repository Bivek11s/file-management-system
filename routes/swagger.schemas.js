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
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         googleDrive:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: Google Drive access token
 *             refreshToken:
 *               type: string
 *               description: Google Drive refresh token
 *             tokenExpiry:
 *               type: string
 *               format: date-time
 *               description: Token expiry date
 *             syncEnabled:
 *               type: boolean
 *               description: Whether Google Drive sync is enabled
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
 *         path:
 *           type: string
 *           description: File path in the system
 *         size:
 *           type: number
 *           description: File size in bytes
 *         uploadDate:
 *           type: string
 *           format: date-time
 *           description: Date when file was uploaded
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *         folder:
 *           type: string
 *           description: ID of the parent folder
 *         owner:
 *           type: string
 *           description: ID of the file owner
 *         sharedWith:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs the file is shared with
 *         accessLevel:
 *           type: string
 *           enum: [only_me, anyone_with_link, timed_access]
 *           description: File access level
 *         shareToken:
 *           type: string
 *           description: Token for file sharing
 *         shareTokenExpires:
 *           type: string
 *           format: date-time
 *           description: Share token expiry date
 *         downloadCount:
 *           type: number
 *           description: Number of times file has been downloaded
 *         googleDrive:
 *           type: object
 *           properties:
 *             fileId:
 *               type: string
 *               description: Google Drive file ID
 *             link:
 *               type: string
 *               description: Google Drive file link
 *             syncStatus:
 *               type: string
 *               enum: [pending, synced, failed, not_synced]
 *               description: Google Drive sync status
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
 *         owner:
 *           type: string
 *           description: ID of the folder owner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Folder creation date
 *         sharedWith:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs the folder is shared with
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
 *         endpoint:
 *           type: string
 *           description: API endpoint
 *         hitCount:
 *           type: number
 *           description: Number of hits to the endpoint
 *         lastHit:
 *           type: string
 *           format: date-time
 *           description: Last hit timestamp
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
