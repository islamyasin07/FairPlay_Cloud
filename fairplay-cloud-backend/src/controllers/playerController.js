import { getAllPlayers, getPlayerById } from "../services/playerService.js";

export async function listPlayers(req, res) {
  try {
    const players = await getAllPlayers();
    res.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    res.status(500).json({
      message: "Failed to fetch players.",
      error: error.message,
    });
  }
}

export async function getPlayer(req, res) {
  try {
    const player = await getPlayerById(req.params.playerId);

    if (!player) {
      return res.status(404).json({
        message: "Player not found.",
      });
    }

    res.json(player);
  } catch (error) {
    console.error("Failed to fetch player:", error);
    res.status(500).json({
      message: "Failed to fetch player.",
      error: error.message,
    });
  }
}