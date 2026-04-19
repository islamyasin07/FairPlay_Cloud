import {
  getAllIncidents,
  getIncidentById,
  getIncidentsByPlayerId,
  getIncidentsByStatus,
  updateIncidentStatus,
} from "../services/incidentService.js";

export async function listIncidents(req, res) {
  try {
    const { status, playerId } = req.query;

    let incidents;

    if (status) {
      incidents = await getIncidentsByStatus(status);
    } else if (playerId) {
      incidents = await getIncidentsByPlayerId(playerId);
    } else {
      incidents = await getAllIncidents();
    }

    res.json(incidents);
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    res.status(500).json({
      message: "Failed to fetch incidents.",
      error: error.message,
    });
  }
}

export async function getIncident(req, res) {
  try {
    const incident = await getIncidentById(req.params.incidentId);

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found.",
      });
    }

    res.json(incident);
  } catch (error) {
    console.error("Failed to fetch incident:", error);
    res.status(500).json({
      message: "Failed to fetch incident.",
      error: error.message,
    });
  }
}

export async function changeIncidentStatus(req, res) {
  try {
    const { incidentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    const allowedStatuses = [
      "Open",
      "Under Review",
      "Confirmed",
      "Dismissed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    const updatedIncident = await updateIncidentStatus(incidentId, status);

    if (!updatedIncident) {
      return res.status(404).json({
        message: "Incident not found.",
      });
    }

    res.json(updatedIncident);
  } catch (error) {
    console.error("Failed to update incident status:", error);
    res.status(500).json({
      message: "Failed to update incident status.",
      error: error.message,
    });
  }
}