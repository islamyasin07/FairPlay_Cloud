import { getObservabilitySnapshot } from "../services/observabilityService.js";

export async function fetchObservabilitySnapshot(req, res) {
  try {
    const snapshot = await getObservabilitySnapshot();
    res.json(snapshot);
  } catch (error) {
    console.error("Failed to fetch observability snapshot:", error);
    res.status(500).json({
      message: "Failed to fetch observability snapshot.",
      error: error.message,
    });
  }
}
