import express from "express";
import {
  bootstrapCases,
  createCase,
  getCaseCommand,
  listCaseCommands,
  patchCase,
  uploadDocument,
  getDocumentPresignedUploadUrl,
  getDocumentPresignedDownloadUrl,
} from "../controllers/caseCommandController.js";
import { uploadSingleFile } from "../middleware/multer.js";

const router = express.Router();

router.get("/", listCaseCommands);
router.post("/bootstrap", bootstrapCases);
router.post("/", createCase);
router.get("/:caseId", getCaseCommand);
router.patch("/:caseId", patchCase);
router.post("/:caseId/upload-document", uploadSingleFile, uploadDocument);
router.post("/:caseId/document-presigned-upload-url", getDocumentPresignedUploadUrl);
router.get("/:caseId/document-presigned-download-url", getDocumentPresignedDownloadUrl);

export default router;
