import express from "express";
import { fetchMonitoringSnapshot } from "../controllers/monitoringController.js";

const router = express.Router();

router.get("/", fetchMonitoringSnapshot);

export default router;