import express from "express";
import { getPlayer, listPlayers } from "../controllers/playerController.js";

const router = express.Router();

router.get("/", listPlayers);
router.get("/:playerId", getPlayer);

export default router;