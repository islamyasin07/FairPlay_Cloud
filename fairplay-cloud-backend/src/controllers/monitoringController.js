import {
  getMonitoringSnapshot,
  getOverviewChartsSnapshot,
} from "../services/monitoringService.js";

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

export async function fetchOverviewChartsSnapshot(req, res) {
  try {
    res.json(await getOverviewChartsSnapshot());
  } catch (error) {
    console.error("Failed to fetch overview charts snapshot:", error);
    res.status(500).json({
      message: "Failed to fetch overview charts snapshot.",
      error: error.message,
    });
  }
}
