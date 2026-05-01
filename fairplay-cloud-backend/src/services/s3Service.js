import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

// Initialize S3 client
// In production on EC2/ECS: uses IAM role credentials from instance metadata automatically
// For local testing: falls back to environment variables if provided
const s3ClientConfig = {
  region: env.awsRegion,
};

if (env.awsAccessKeyId && env.awsSecretAccessKey) {
  s3ClientConfig.credentials = {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  };
}
// If no credentials in env, SDK will automatically use IAM role from EC2/ECS instance metadata

const s3Client = new S3Client(s3ClientConfig);

/**
 * Generate a presigned URL for uploading a file to S3
 * @param {string} bucketName - S3 bucket name
 * @param {string} key - S3 object key (path)
 * @param {number} expirySeconds - URL expiration time in seconds (default: 15 minutes)
 * @returns {Promise<string>} - Presigned URL for uploading
 */
export async function generatePresignedUploadUrl(
  bucketName,
  key,
  expirySeconds = 900
) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expirySeconds,
    });

    return url;
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }
}

/**
 * Generate a presigned URL for downloading a file from S3
 * Optionally use CloudFront domain if configured
 * @param {string} bucketName - S3 bucket name
 * @param {string} key - S3 object key (path)
 * @param {number} expirySeconds - URL expiration time in seconds (default: 7 days)
 * @returns {Promise<string>} - Presigned URL for downloading
 */
export async function generatePresignedDownloadUrl(
  bucketName,
  key,
  expirySeconds = 604800 // 7 days
) {
  try {
    // If CloudFront domain is configured, use direct S3 presigned URL
    // (CloudFront requires origin access identity, not presigned URLs)
    // Instead, return CloudFront URL with S3 key
    if (env.cloudfrontDomain) {
      // For CloudFront, we'll use the key directly appended to CDN domain
      // Note: CloudFront OAI handles authentication, not presigned URLs
      return `${env.cloudfrontDomain}/${key}`;
    }

    // Otherwise, generate S3 presigned URL
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expirySeconds,
    });

    return url;
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
}

/**
 * Upload a file to S3 directly (from buffer)
 * @param {string} bucketName - S3 bucket name
 * @param {string} key - S3 object key (path)
 * @param {Buffer} fileBuffer - File content
 * @param {string} contentType - MIME type (e.g., 'video/mp4')
 * @returns {Promise<{key: string, eTag: string}>} - Upload result
 */
export async function uploadFileToS3(
  bucketName,
  key,
  fileBuffer,
  contentType
) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    const response = await s3Client.send(command);

    return {
      key,
      eTag: response.ETag,
      versionId: response.VersionId,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} bucketName - S3 bucket name
 * @param {string} key - S3 object key (path)
 * @returns {Promise<void>}
 */
export async function deleteFileFromS3(bucketName, key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List objects in S3 bucket with prefix (folder)
 * @param {string} bucketName - S3 bucket name
 * @param {string} prefix - Prefix to filter objects (optional)
 * @returns {Promise<Array>} - List of objects
 */
export async function listS3Objects(bucketName, prefix = "") {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    return response.Contents || [];
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    throw new Error(`Failed to list objects: ${error.message}`);
  }
}

/**
 * Check S3 connectivity (health check)
 * @returns {Promise<boolean>} - true if S3 is accessible
 */
export async function checkS3Connectivity() {
  try {
    // Try to list objects in bucket (just 1 result to verify access)
    const command = new ListObjectsV2Command({
      Bucket: env.s3BucketName,
      MaxKeys: 1,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("S3 connectivity check failed:", error.message);
    return false;
  }
}

/**
 * Generate S3 key based on content type and ID
 * @param {string} featureType - Type of feature (incidents, case-commands, players, audit)
 * @param {string} id - Resource ID (incident ID, case ID, etc.)
 * @param {string} fileName - Original file name
 * @returns {string} - S3 key
 */
export function generateS3Key(featureType, id, fileName) {
  const timestamp = Date.now();
  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
  const key = `${featureType}/${id}/${timestamp}-${sanitizedFileName}`;
  return key;
}
