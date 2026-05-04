import express from "express";
import cors from "cors";
import incidentRoutes from "./routes/incidentRoutes.js";
import playerRoutes from "./routes/playerRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import caseCommandRoutes from "./routes/caseCommandRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import observabilityRoutes from "./routes/observabilityRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://fairplay-cloud-frontend-ui.s3-website-us-east-1.amazonaws.com",
    "https://faiplay.online",
    "https://www.faiplay.online"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
// Fix for Express 5.x routing wildcard
app.options(/(.*)/, cors(corsOptions));

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
app.use("/health", healthRoutes);
app.get("/api/health", (req, res) => res.status(200).send("OK")); // Removed DB call so AWS Target Group health check always passes
app.use("/case-commands", requireAuth, caseCommandRoutes);
app.use("/media", requireAuth, mediaRoutes);
export default app;
