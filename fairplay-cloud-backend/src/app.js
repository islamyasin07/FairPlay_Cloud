import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incidentRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import caseCommandRoutes from "./routes/caseCommandRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import observabilityRoutes from "./routes/observabilityRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "FairPlay Cloud backend is running.",
  });
});

app.use("/auth", authRoutes);
app.use("/observability", observabilityRoutes);

app.use("/incidents", requireAuth, incidentRoutes);
app.use("/players", requireAuth, playerRoutes);
app.use("/audit", requireAuth, auditRoutes);
app.use("/health", requireAuth, healthRoutes);
app.use("/case-commands", requireAuth, caseCommandRoutes);

export default app;