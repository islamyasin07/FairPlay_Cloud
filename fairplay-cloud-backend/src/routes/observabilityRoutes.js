import express from "express";
import { fetchObservabilitySnapshot } from "../controllers/observabilityController.js";

const router = express.Router();

router.get("/", fetchObservabilitySnapshot);

export default router;
