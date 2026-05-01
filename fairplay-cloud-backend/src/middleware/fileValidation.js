/**
 * File validation middleware
 * Validates file size, type, and other constraints
 */

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  evidence_video: 500 * 1024 * 1024, // 500MB
  evidence_image: 10 * 1024 * 1024, // 10MB
  case_document: 25 * 1024 * 1024, // 25MB
  player_profile: 10 * 1024 * 1024, // 10MB
  audit_artifact: 50 * 1024 * 1024, // 50MB
};

// Allowed MIME types per feature
const ALLOWED_MIME_TYPES = {
  incident_evidence: [
    "video/mp4",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  case_command_document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
  ],
  player_profile_image: ["image/jpeg", "image/png", "image/webp"],
  audit_artifact: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "text/plain",
    "application/json",
  ],
};

/**
 * Middleware to validate uploaded files
 * @param {string} fileType - Type of file being uploaded (incident_evidence, case_command_document, etc.)
 * @returns {Function} Express middleware function
 */
export function validateFileUpload(fileType) {
  return (req, res, next) => {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const file = req.file;
    const sizeLimit = FILE_SIZE_LIMITS[fileType];
    const allowedTypes = ALLOWED_MIME_TYPES[fileType];

    // Validate file size
    if (sizeLimit && file.size > sizeLimit) {
      const limitMB = sizeLimit / (1024 * 1024);
      return res.status(400).json({
        success: false,
        error: `File exceeds maximum size of ${limitMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
    }

    // Validate MIME type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}. Your file is ${file.mimetype}`,
      });
    }

    // Additional checks can be added here (e.g., scan for viruses)

    // Attach validated file info to request
    req.validatedFile = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };

    next();
  };
}

/**
 * Validate file from FormData (streaming upload)
 * Returns true if valid, false otherwise
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type from request headers
 * @param {number} fileSize - File size in bytes
 * @param {string} fileType - Type of file being uploaded
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export function validateFileMetadata(fileName, mimeType, fileSize, fileType) {
  const sizeLimit = FILE_SIZE_LIMITS[fileType];
  const allowedTypes = ALLOWED_MIME_TYPES[fileType];

  // Validate MIME type
  if (allowedTypes && !allowedTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}. Your file is ${mimeType}`,
    };
  }

  // Validate file size
  if (sizeLimit && fileSize > sizeLimit) {
    const limitMB = sizeLimit / (1024 * 1024);
    return {
      isValid: false,
      error: `File exceeds maximum size of ${limitMB}MB. Your file is ${(fileSize / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize file name for S3 storage
 * @param {string} fileName - Original file name
 * @returns {string} - Sanitized file name
 */
export function sanitizeFileName(fileName) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .toLowerCase()
    .slice(0, 255); // Limit length
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type (e.g., 'video/mp4')
 * @returns {string} - File extension (e.g., 'mp4')
 */
export function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/json": "json",
  };

  return mimeToExt[mimeType] || "bin";
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size (e.g., '2.5MB')
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
