import express from "express";
import {
  getIncident,
  listIncidents,
  changeIncidentStatus,
  uploadEvidence,
  getEvidencePresignedUploadUrl,
  getEvidencePresignedDownloadUrl,
} from "../controllers/incidentController.js";
import { uploadSingleFile } from "../middleware/multer.js";

const router = express.Router();

router.get("/", listIncidents);
router.get("/:incidentId", getIncident);
router.patch("/:incidentId/status", changeIncidentStatus);
router.post("/:incidentId/upload-evidence", uploadSingleFile, uploadEvidence);
router.post("/:incidentId/evidence-presigned-upload-url", getEvidencePresignedUploadUrl);
router.get("/:incidentId/evidence-presigned-download-url", getEvidencePresignedDownloadUrl);

export default router;
