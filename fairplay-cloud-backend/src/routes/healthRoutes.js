import express from "express";
import { listHealthMetrics } from "../controllers/healthController.js";

const router = express.Router();

router.get("/", listHealthMetrics);

export default router;