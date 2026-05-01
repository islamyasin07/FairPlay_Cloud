import { getMonitoringSnapshot } from "../services/monitoringService.js";

export async function fetchMonitoringSnapshot(req, res) {
  try {
    res.json(getMonitoringSnapshot());
  } catch (error) {
    console.error("Failed to fetch monitoring snapshot:", error);
    res.status(500).json({
      message: "Failed to fetch monitoring snapshot.",
      error: error.message,
    });
  }
}