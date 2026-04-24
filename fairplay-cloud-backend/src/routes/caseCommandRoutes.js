import express from "express";
import {
  bootstrapCases,
  createCase,
  getCaseCommand,
  listCaseCommands,
  patchCase,
} from "../controllers/caseCommandController.js";

const router = express.Router();

router.get("/", listCaseCommands);
router.post("/bootstrap", bootstrapCases);
router.post("/", createCase);
router.get("/:caseId", getCaseCommand);
router.patch("/:caseId", patchCase);

export default router;