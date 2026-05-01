/**
 * Multer configuration for file uploads
 * Stores files in memory before uploading to S3
 */
import multer from "multer";

// Store files in memory
const storage = multer.memoryStorage();

// Create multer instance with size limit (max 500MB)
export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

// Single file upload middleware
export const uploadSingleFile = upload.single("file");

// Multiple files upload middleware (up to 10 files)
export const uploadMultipleFiles = upload.array("files", 10);
