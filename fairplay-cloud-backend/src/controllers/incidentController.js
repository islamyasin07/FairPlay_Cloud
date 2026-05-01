import {
  getAllIncidents,
  getIncidentById,
  getIncidentsByPlayerId,
  getIncidentsByStatus,
  updateIncidentStatus,
} from "../services/incidentService.js";
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  uploadFileToS3,
  generateS3Key,
} from "../services/s3Service.js";
import { validateFileMetadata } from "../middleware/fileValidation.js";
import { env } from "../config/env.js";

export async function listIncidents(req, res) {
  try {
    const { status, playerId } = req.query;

    let incidents;

    if (status) {
      incidents = await getIncidentsByStatus(status);
    } else if (playerId) {
      incidents = await getIncidentsByPlayerId(playerId);
    } else {
      incidents = await getAllIncidents();
    }

    res.json(incidents);
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    res.status(500).json({
      message: "Failed to fetch incidents.",
      error: error.message,
    });
  }
}

export async function getIncident(req, res) {
  try {
    const incident = await getIncidentById(req.params.incidentId);

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found.",
      });
    }

    res.json(incident);
  } catch (error) {
    console.error("Failed to fetch incident:", error);
    res.status(500).json({
      message: "Failed to fetch incident.",
      error: error.message,
    });
  }
}

export async function changeIncidentStatus(req, res) {
  try {
    const { incidentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    const allowedStatuses = [
      "Open",
      "Under Review",
      "Confirmed",
      "Dismissed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const updatedIncident = await updateIncidentStatus(incidentId, status);

    if (!updatedIncident) {
      return res.status(404).json({
        message: "Incident not found.",
      });
    }

    res.json(updatedIncident);
  } catch (error) {
    console.error("Failed to update incident status:", error);
    res.status(500).json({
      message: "Failed to update incident status.",
      error: error.message,
    });
  }
}

export async function uploadEvidence(req, res) {
  try {
    const { incidentId } = req.params;

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
      "incident_evidence"
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const s3Key = generateS3Key(
      env.s3EvidencePrefix.replace(/\/$/, ""),
      incidentId,
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
      message: "File uploaded successfully",
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
    console.error("Failed to upload evidence:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload evidence",
      message: error.message,
    });
  }
}

export async function getEvidencePresignedUploadUrl(req, res) {
  try {
    const { incidentId } = req.params;
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
      "incident_evidence"
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
      });
    }

    const s3Key = generateS3Key(
      env.s3EvidencePrefix.replace(/\/$/, ""),
      incidentId,
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

export async function getEvidencePresignedDownloadUrl(req, res) {
  try {
    const { incidentId } = req.params;
    const { s3Key } = req.query;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        error: "s3Key is required",
      });
    }

    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        error: "Incident not found",
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