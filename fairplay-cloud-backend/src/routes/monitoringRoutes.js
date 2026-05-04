import express from "express";
import {
  fetchMonitoringSnapshot,
  fetchOverviewChartsSnapshot,
} from "../controllers/monitoringController.js";

const router = express.Router();

router.get("/", fetchMonitoringSnapshot);
router.get("/overview-charts", fetchOverviewChartsSnapshot);

export default router;
