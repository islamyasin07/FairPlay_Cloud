import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

export const generatePresignedUrl = async (fileKey) => {
  if (!fileKey) return null;
  
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not set");
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ResponseContentDisposition: "inline", // Ensures browsers play video instead of downloading
    });

    // URL valid for 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
};
