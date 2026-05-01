import { getAllPlayers, getPlayerById } from "../services/playerService.js";
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  uploadFileToS3,
  generateS3Key,
} from "../services/s3Service.js";
import { validateFileMetadata } from "../middleware/fileValidation.js";
import { env } from "../config/env.js";

export async function listPlayers(req, res) {
  try {
    const players = await getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    res.status(500).json({
      message: "Failed to fetch players.",
      error: error.message,
    });
  }
}

export async function getPlayer(req, res) {
  try {
    const player = await getPlayerById(req.params.playerId);

    if (!player) {
      return res.status(404).json({
        message: "Player not found.",
      });
    }

    res.json(player);
  } catch (error) {
    console.error("Failed to fetch player:", error);
    res.status(500).json({
      message: "Failed to fetch player.",
      error: error.message,
    });
  }
}
export async function uploadProfileImage(req, res) {
  try {
    const { playerId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const validation = validateFileMetadata(
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      "player_profile_image"
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        error: "Player not found",
      });
    }

    const s3Key = generateS3Key(
      env.s3PlayerProfilesPrefix.replace(/\/$/, ""),
      playerId,
      req.file.originalname
    );

    const uploadResult = await uploadFileToS3(
      env.s3BucketName,
      s3Key,
      req.file.buffer,
      req.file.mimetype
    );

    const downloadUrl = await generatePresignedDownloadUrl(
      env.s3BucketName,
      s3Key,
      env.presignedUrlExpiryDownload
    );

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      s3Key,
      downloadUrl,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to upload profile image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload profile image",
      message: error.message,
    });
  }
}

export async function getProfileImagePresignedUploadUrl(req, res) {
  try {
    const { playerId } = req.params;
    const { fileName, mimeType } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        error: "fileName and mimeType are required",
      });
    }

    const validation = validateFileMetadata(
      fileName,
      mimeType,
      0,
      "player_profile_image"
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        error: "Player not found",
      });
    }

    const s3Key = generateS3Key(
      env.s3PlayerProfilesPrefix.replace(/\/$/, ""),
      playerId,
      fileName
    );

    const uploadUrl = await generatePresignedUploadUrl(
      env.s3BucketName,
      s3Key,
      env.presignedUrlExpiryUpload
    );

    res.json({
      success: true,
      uploadUrl,
      s3Key,
      expiresIn: env.presignedUrlExpiryUpload,
    });
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate presigned URL",
      message: error.message,
    });
  }
}

export async function getProfileImagePresignedDownloadUrl(req, res) {
  try {
    const { playerId } = req.params;
    const { s3Key } = req.query;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        error: "s3Key is required",
      });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        error: "Player not found",
      });
    }

    const downloadUrl = await generatePresignedDownloadUrl(
      env.s3BucketName,
      s3Key,
      env.presignedUrlExpiryDownload
    );

    res.json({
      success: true,
      downloadUrl,
      expiresIn: env.presignedUrlExpiryDownload,
    });
  } catch (error) {
    console.error("Failed to generate download URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate download URL",
      message: error.message,
    });
  }
}
