import express from "express";
import { generatePresignedUrl } from "../services/s3Service.js";

const router = express.Router();

router.post("/presigned-url", async (req, res) => {
  try {
    const { urlOrKey } = req.body;
    
    if (!urlOrKey) {
      return res.status(400).json({ error: "No URL or File Key provided" });
    }

    // If the frontend passed in the full S3 URL from DynamoDB, extract just the file key
    // e.g "https://fairplay-cloud-evidence.s3.us-east-1.amazonaws.com/2.mp4" -> "2.mp4"
    let fileKey = urlOrKey;
    if (urlOrKey.startsWith("http")) {
      const bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/`;
      if (urlOrKey.startsWith(bucketUrl)) {
        fileKey = urlOrKey.replace(bucketUrl, "");
      } else {
        // Fallback for other standard S3 URL formats
        const urlParts = new URL(urlOrKey);
        fileKey = urlParts.pathname.substring(1); // Removes the leading slash
      }
    }

    const secureUrl = await generatePresignedUrl(decodeURIComponent(fileKey));
    
    res.json({ secureUrl });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    res.status(500).json({ error: "Failed to generate secure media link" });
  }
});

export default router;
