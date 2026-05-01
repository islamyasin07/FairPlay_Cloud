import {
  bootstrapCaseCommandsFromIncidents,
  createCaseCommand,
  getAllCaseCommands,
  getCaseCommandById,
  updateCaseCommand,
} from "../services/caseCommandService.js";
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  uploadFileToS3,
  generateS3Key,
} from "../services/s3Service.js";
import { validateFileMetadata } from "../middleware/fileValidation.js";
import { env } from "../config/env.js";

export async function listCaseCommands(req, res) {
  try {
    const { queueStatus, priority, assignee } = req.query;
    const records = await getAllCaseCommands();

    const filtered = records.filter((record) => {
      if (queueStatus && record.queueStatus !== queueStatus) return false;
      if (priority && record.priority !== priority) return false;
      if (assignee && record.assignee !== assignee) return false;
      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error("Failed to fetch case command records:", error);
    res.status(500).json({
      message: "Failed to fetch case command records.",
      error: error.message,
    });
  }
}

export async function getCaseCommand(req, res) {
  try {
    const record = await getCaseCommandById(req.params.caseId);

    if (!record) {
      return res.status(404).json({
        message: "Case record not found.",
      });
    }

    res.json(record);
  } catch (error) {
    console.error("Failed to fetch case command record:", error);
    res.status(500).json({
      message: "Failed to fetch case command record.",
      error: error.message,
    });
  }
}

export async function createCase(req, res) {
  try {
    if (!req.body?.incidentId) {
      return res.status(400).json({
        message: "incidentId is required.",
      });
    }

    const created = await createCaseCommand(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error("Failed to create case command record:", error);
    res.status(500).json({
      message: "Failed to create case command record.",
      error: error.message,
    });
  }
}

export async function patchCase(req, res) {
  try {
    const updated = await updateCaseCommand(req.params.caseId, req.body ?? {});

    if (!updated) {
      return res.status(404).json({
        message: "Case record not found.",
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("Failed to update case command record:", error);
    res.status(500).json({
      message: "Failed to update case command record.",
      error: error.message,
    });
  }
}

export async function bootstrapCases(req, res) {
  try {
    const limit = Number(req.body?.limit ?? 200);
    const created = await bootstrapCaseCommandsFromIncidents(limit);

    res.status(201).json({
      createdCount: created.length,
      records: created,
    });
  } catch (error) {
    console.error("Failed to bootstrap case command records:", error);
    res.status(500).json({
      message: "Failed to bootstrap case command records.",
      error: error.message,
    });
  }
}

export async function uploadDocument(req, res) {
  try {
    const { caseId } = req.params;

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
      "case_command_document"
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const caseCommand = await getCaseCommandById(caseId);
    if (!caseCommand) {
      return res.status(404).json({
        success: false,
        error: "Case command not found",
      });
    }

    const s3Key = generateS3Key(
      env.s3CaseDocsPrefix.replace(/\/$/, ""),
      caseId,
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
      message: "Document uploaded successfully",
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
    console.error("Failed to upload document:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload document",
      message: error.message,
    });
  }
}

export async function getDocumentPresignedUploadUrl(req, res) {
  try {
    const { caseId } = req.params;
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
      "case_command_document"
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const caseCommand = await getCaseCommandById(caseId);
    if (!caseCommand) {
      return res.status(404).json({
        success: false,
        error: "Case command not found",
      });
    }

    const s3Key = generateS3Key(
      env.s3CaseDocsPrefix.replace(/\/$/, ""),
      caseId,
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

export async function getDocumentPresignedDownloadUrl(req, res) {
  try {
    const { caseId } = req.params;
    const { s3Key } = req.query;

    if (!s3Key) {
      return res.status(400).json({
        success: false,
        error: "s3Key is required",
      });
    }

    const caseCommand = await getCaseCommandById(caseId);
    if (!caseCommand) {
      return res.status(404).json({
        success: false,
        error: "Case command not found",
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