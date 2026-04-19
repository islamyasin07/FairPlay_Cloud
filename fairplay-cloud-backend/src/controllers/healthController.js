import { getAllHealthMetrics } from "../services/healthService.js";

export async function listHealthMetrics(req, res) {
	try {
		const metrics = await getAllHealthMetrics();
		res.json(metrics);
	} catch (error) {
		console.error("Failed to fetch health metrics:", error);
		res.status(500).json({
			message: "Failed to fetch health metrics.",
			error: error.message,
		});
	}
}