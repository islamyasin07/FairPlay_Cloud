import {
  bootstrapCaseCommandsFromIncidents,
  createCaseCommand,
  getAllCaseCommands,
  getCaseCommandById,
  updateCaseCommand,
} from "../services/caseCommandService.js";

export async function listCaseCommands(req, res) {
  try {
    const { queueStatus, priority, assignee } = req.query;
    const records = await getAllCaseCommands();

    const filtered = records.filter((record) => {
      if (queueStatus && record.queueStatus !== queueStatus) return false;
      if (priority && record.priority !== priority) return false;
      if (assignee && record.assignee !== assignee) return false;
      return true;
    });

    res.json(filtered);
  } catch (error) {
    console.error("Failed to fetch case command records:", error);
    res.status(500).json({
      message: "Failed to fetch case command records.",
      error: error.message,
    });
  }
}

export async function getCaseCommand(req, res) {
  try {
    const record = await getCaseCommandById(req.params.caseId);

    if (!record) {
      return res.status(404).json({
        message: "Case record not found.",
      });
    }

    res.json(record);
  } catch (error) {
    console.error("Failed to fetch case command record:", error);
    res.status(500).json({
      message: "Failed to fetch case command record.",
      error: error.message,
    });
  }
}

export async function createCase(req, res) {
  try {
    if (!req.body?.incidentId) {
      return res.status(400).json({
        message: "incidentId is required.",
      });
    }

    const created = await createCaseCommand(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error("Failed to create case command record:", error);
    res.status(500).json({
      message: "Failed to create case command record.",
      error: error.message,
    });
  }
}

export async function patchCase(req, res) {
  try {
    const updated = await updateCaseCommand(req.params.caseId, req.body ?? {});

    if (!updated) {
      return res.status(404).json({
        message: "Case record not found.",
      });
    }

    res.json(updated);
  } catch (error) {
    console.error("Failed to update case command record:", error);
    res.status(500).json({
      message: "Failed to update case command record.",
      error: error.message,
    });
  }
}

export async function bootstrapCases(req, res) {
  try {
    const limit = Number(req.body?.limit ?? 200);
    const created = await bootstrapCaseCommandsFromIncidents(limit);

    res.status(201).json({
      createdCount: created.length,
      records: created,
    });
  } catch (error) {
    console.error("Failed to bootstrap case command records:", error);
    res.status(500).json({
      message: "Failed to bootstrap case command records.",
      error: error.message,
    });
  }
}