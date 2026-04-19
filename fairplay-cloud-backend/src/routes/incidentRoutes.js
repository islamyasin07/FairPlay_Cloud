import express from "express";
import {
  getIncident,
  listIncidents,
  changeIncidentStatus,
} from "../controllers/incidentController.js";

const router = express.Router();

router.get("/", listIncidents);
router.get("/:incidentId", getIncident);
router.patch("/:incidentId/status", changeIncidentStatus);

export default router;