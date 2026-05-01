import express from "express";
import {
  getPlayer,
  listPlayers,
  uploadProfileImage,
  getProfileImagePresignedUploadUrl,
  getProfileImagePresignedDownloadUrl,
} from "../controllers/playerController.js";
import { uploadSingleFile } from "../middleware/multer.js";

const router = express.Router();

router.get("/", listPlayers);
router.get("/:playerId", getPlayer);
router.post("/:playerId/upload-profile-image", uploadSingleFile, uploadProfileImage);
router.post("/:playerId/profile-image-presigned-upload-url", getProfileImagePresignedUploadUrl);
router.get("/:playerId/profile-image-presigned-download-url", getProfileImagePresignedDownloadUrl);

export default router;
