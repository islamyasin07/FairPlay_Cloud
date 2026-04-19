import {
  getAllAuditLogs,
  getAuditLogsByIncidentId,
} from "../services/auditService.js";

export async function listAuditLogs(req, res) {
  try {
    const { incidentId } = req.query;

    const logs = incidentId
      ? await getAuditLogsByIncidentId(incidentId)
      : await getAllAuditLogs();

    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    res.status(500).json({
      message: "Failed to fetch audit logs.",
      error: error.message,
    });
  }
}