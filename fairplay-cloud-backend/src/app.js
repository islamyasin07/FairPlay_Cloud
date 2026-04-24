import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incidentRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import caseCommandRoutes from "./routes/caseCommandRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "FairPlay Cloud backend is running.",
  });
});

app.use("/incidents", incidentRoutes);
app.use("/players", playerRoutes);
app.use("/audit", auditRoutes);
app.use("/health", healthRoutes);
app.use("/case-commands", caseCommandRoutes);

export default app;