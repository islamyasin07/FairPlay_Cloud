export type IncidentStatus =
  | "Open"
  | "Under Review"
  | "Confirmed"
  | "Dismissed";

export type SeverityLevel = "Critical" | "High" | "Medium" | "Low";

export type CheatType =
  | "Aimbot"
  | "Speed Hack"
  | "No Recoil"
  | "Wallhack"
  | "Trigger Bot";

export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: "info" | "success" | "warning" | "danger";
};

export type OverviewTrendPoint = {
  hour: string;
  incidents: number;
};

export type CheatDistributionItem = {
  name: CheatType;
  value: number;
};

export type RecentIncident = {
  incidentId: string;
  playerId: string;
  playerName: string;
  cheatType: CheatType;
  severity: SeverityLevel;
  status: IncidentStatus;
  riskScore: number;
  region: string;
  createdAtRelative: string;
};

export type IncidentMetric = {
  label: string;
  value: string;
  tone?: "info" | "success" | "warning" | "danger";
};

export type IncidentTimelineEntry = {
  id: string;
  label: string;
  description: string;
  time: string;
};

export type IncidentRecord = {
  incidentId: string;
  playerId: string;
  playerName: string;
  matchId: string;
  cheatType: CheatType;
  severity: SeverityLevel;
  status: IncidentStatus;
  riskScore: number;
  region: string;
  detectionReason: string;
  createdAtRelative: string;
  evidenceVideo?: string;
  evidenceThumbnail?: string;
  metrics: IncidentMetric[];
  timeline: IncidentTimelineEntry[];
};

export type PlayerRiskRecord = {
  playerId: string;
  username: string;
  region: string;
  riskScore: number;
  status: "Flagged" | "Under Observation" | "Banned" | "Cleared";
  totalIncidents: number;
  primaryPattern: CheatType;
  lastSeen: string;
};

export type AuditActionType =
  | "Incident Created"
  | "Status Updated"
  | "Player Flagged"
  | "Player Banned"
  | "Incident Dismissed"
  | "System Note";

export type AuditRecord = {
  actionId: string;
  actionType: AuditActionType;
  actor: string;
  incidentId?: string;
  playerId?: string;
  playerName?: string;
  summary: string;
  timestampRelative: string;
};

export type ServiceHealthRecord = {
  service: string;
  status: "Healthy" | "Warning" | "Degraded";
  uptime: string;
  latency: string;
  notes: string;
};

export type QueueHealthRecord = {
  queueName: string;
  depth: number;
  processingRate: string;
  retryRate: string;
  state: "Stable" | "Elevated" | "Recovering";
};

export type ReliabilityMetric = {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "info";
};