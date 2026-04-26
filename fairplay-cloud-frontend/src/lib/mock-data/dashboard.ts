import type {
  AuditRecord,
  CheatDistributionItem,
  IncidentRecord,
  KpiMetric,
  OverviewTrendPoint,
  PlayerRiskRecord,
  QueueHealthRecord,
  RecentIncident,
  ReliabilityMetric,
  ServiceHealthRecord,
} from "../../types/dashboard";

export const overviewKpis: KpiMetric[] = [
  {
    id: "events-processed",
    label: "Events Processed",
    value: "128.4K",
    hint: "+18% in the last 24h",
    tone: "info",
  },
  {
    id: "open-incidents",
    label: "Open Incidents",
    value: "46",
    hint: "12 marked critical",
    tone: "warning",
  },
  {
    id: "flagged-players",
    label: "Flagged Players",
    value: "19",
    hint: "4 newly flagged today",
    tone: "danger",
  },
  {
    id: "system-health",
    label: "System Health",
    value: "99.9%",
    hint: "All core services operational",
    tone: "success",
  },
];

export const incidentTrend: OverviewTrendPoint[] = [
  { hour: "12:00", incidents: 4 },
  { hour: "13:00", incidents: 7 },
  { hour: "14:00", incidents: 5 },
  { hour: "15:00", incidents: 11 },
  { hour: "16:00", incidents: 8 },
  { hour: "17:00", incidents: 13 },
  { hour: "18:00", incidents: 9 },
];

export const cheatDistribution: CheatDistributionItem[] = [
  { name: "Aimbot", value: 38 },
  { name: "Speed Hack", value: 24 },
  { name: "No Recoil", value: 18 },
  { name: "Wallhack", value: 12 },
  { name: "Trigger Bot", value: 8 },
];

export const recentIncidents: RecentIncident[] = [
  {
    incidentId: "INC-2041",
    playerId: "P-1001",
    playerName: "Nezar Hanani",
    cheatType: "Aimbot",
    severity: "Critical",
    status: "Open",
    riskScore: 94,
    region: "EU-West",
    createdAtRelative: "2 min ago",
  },
  {
    incidentId: "INC-2038",
    playerId: "P-1033",
    playerName: "ZeroPing",
    cheatType: "Speed Hack",
    severity: "High",
    status: "Under Review",
    riskScore: 86,
    region: "ME-Central",
    createdAtRelative: "8 min ago",
  },
  {
    incidentId: "INC-2035",
    playerId: "P-1098",
    playerName: "xRogueAim",
    cheatType: "No Recoil",
    severity: "High",
    status: "Confirmed",
    riskScore: 82,
    region: "EU-West",
    createdAtRelative: "14 min ago",
  },
  {
    incidentId: "INC-2029",
    playerId: "P-1127",
    playerName: "SilentNova",
    cheatType: "Wallhack",
    severity: "Medium",
    status: "Dismissed",
    riskScore: 71,
    region: "NA-East",
    createdAtRelative: "23 min ago",
  },
];

export const incidentRecords: IncidentRecord[] = [
  {
    incidentId: "INC-2041",
    playerId: "P-1001",
    playerName: "Nezar Hanani",
    matchId: "M-7781",
    cheatType: "Aimbot",
    severity: "Critical",
    status: "Open",
    riskScore: 94,
    region: "EU-West",
    detectionReason:
      "Abnormally high precision and instant target snapping across multiple engagements.",
    createdAtRelative: "2 min ago",
    evidenceVideo: "/evidence/NezarHanani-aimbot.mp4",
    evidenceThumbnail: "/evidence/NezarHanani-aimbot.jpg",
    metrics: [
      { label: "Accuracy Spike", value: "98.7%", tone: "danger" },
      { label: "Reaction Time", value: "43 ms", tone: "warning" },
      { label: "Headshot Ratio", value: "91%", tone: "danger" },
      { label: "Aim Lock Events", value: "17", tone: "danger" },
    ],
    timeline: [
      {
        id: "T1",
        label: "Detection Created",
        description:
          "Suspicious precision anomaly triggered the anti-cheat rule engine.",
        time: "2 min ago",
      },
      {
        id: "T2",
        label: "Risk Escalated",
        description:
          "Player risk score exceeded the critical investigation threshold.",
        time: "1 min ago",
      },
    ],
  },
  {
    incidentId: "INC-2038",
    playerId: "P-1033",
    playerName: "ZeroPing",
    matchId: "M-7774",
    cheatType: "Speed Hack",
    severity: "High",
    status: "Under Review",
    riskScore: 86,
    region: "ME-Central",
    detectionReason:
      "Movement speed exceeded expected thresholds for repeated intervals.",
    createdAtRelative: "8 min ago",
    evidenceVideo: "/evidence/zeroping-speedhack.mp4",
    evidenceThumbnail: "/evidence/zeroping-speedhack.jpg",
    metrics: [
      { label: "Peak Movement Speed", value: "2.4x normal", tone: "danger" },
      { label: "Burst Distance", value: "18.2 m", tone: "warning" },
      { label: "Abnormal Sprint Events", value: "9", tone: "warning" },
      { label: "Consistency Score", value: "88%", tone: "info" },
    ],
    timeline: [
      {
        id: "T1",
        label: "Detection Created",
        description:
          "Movement anomaly threshold exceeded during active match telemetry.",
        time: "8 min ago",
      },
      {
        id: "T2",
        label: "Case Updated",
        description:
          "Moderator moved the case to Under Review for deeper inspection.",
        time: "7 min ago",
      },
    ],
  },
  {
    incidentId: "INC-2035",
    playerId: "P-1098",
    playerName: "xRogueAim",
    matchId: "M-7769",
    cheatType: "No Recoil",
    severity: "High",
    status: "Confirmed",
    riskScore: 82,
    region: "EU-West",
    detectionReason:
      "Weapon recoil pattern remained unnaturally flat over sustained fire.",
    createdAtRelative: "14 min ago",
    evidenceVideo: "/evidence/xrogueaim-norecoil.mp4",
    evidenceThumbnail: "/evidence/xrogueaim-norecoil.jpg",
    metrics: [
      { label: "Recoil Deviation", value: "0.8%", tone: "danger" },
      { label: "Sustained Burst Length", value: "42 shots", tone: "warning" },
      { label: "Spread Suppression", value: "93%", tone: "danger" },
      { label: "Pattern Variance", value: "Very Low", tone: "info" },
    ],
    timeline: [
      {
        id: "T1",
        label: "Detection Created",
        description:
          "No-recoil signature detected during sustained burst analysis.",
        time: "14 min ago",
      },
      {
        id: "T2",
        label: "Manual Review",
        description: "Evidence clip reviewed by moderation staff.",
        time: "12 min ago",
      },
      {
        id: "T3",
        label: "Confirmed",
        description: "Incident confirmed after evidence verification.",
        time: "10 min ago",
      },
    ],
  },
  {
    incidentId: "INC-2029",
    playerId: "P-1127",
    playerName: "SilentNova",
    matchId: "M-7760",
    cheatType: "Wallhack",
    severity: "Medium",
    status: "Dismissed",
    riskScore: 71,
    region: "NA-East",
    detectionReason:
      "Suspicious tracking through obstacles was detected but later judged inconclusive.",
    createdAtRelative: "23 min ago",
    evidenceVideo: "/evidence/silentnova-wallhack.mp4",
    evidenceThumbnail: "/evidence/silentnova-wallhack.jpg",
    metrics: [
      { label: "Obstacle Tracking Events", value: "6", tone: "warning" },
      { label: "Visibility Violations", value: "3", tone: "info" },
      { label: "Confidence Score", value: "61%", tone: "info" },
      { label: "Manual Verdict", value: "Inconclusive", tone: "success" },
    ],
    timeline: [
      {
        id: "T1",
        label: "Detection Created",
        description:
          "Potential vision-through-obstacle behavior was logged.",
        time: "23 min ago",
      },
      {
        id: "T2",
        label: "Manual Review",
        description:
          "Moderation team reviewed the evidence clip and event metrics.",
        time: "21 min ago",
      },
      {
        id: "T3",
        label: "Dismissed",
        description: "Case closed due to insufficient evidence.",
        time: "19 min ago",
      },
    ],
  },
  {
    incidentId: "INC-2027",
    playerId: "P-1184",
    playerName: "VantaStrike",
    matchId: "M-7755",
    cheatType: "Trigger Bot",
    severity: "Medium",
    status: "Open",
    riskScore: 74,
    region: "EU-West",
    detectionReason:
      "Automatic reaction timing appeared consistently inhuman across target acquisition events.",
    createdAtRelative: "31 min ago",
    evidenceVideo: "/evidence/vantastrike-triggerbot.mp4",
    evidenceThumbnail: "/evidence/vantastrike-triggerbot.jpg",
    metrics: [
      { label: "Average Trigger Delay", value: "21 ms", tone: "danger" },
      { label: "Target Lock Activations", value: "11", tone: "warning" },
      { label: "Pattern Confidence", value: "79%", tone: "info" },
      { label: "Manual Review", value: "Pending", tone: "warning" },
    ],
    timeline: [
      {
        id: "T1",
        label: "Detection Created",
        description:
          "Trigger timing anomaly detected during combat telemetry.",
        time: "31 min ago",
      },
      {
        id: "T2",
        label: "Case Queued",
        description:
          "Incident waiting for moderator evidence inspection.",
        time: "29 min ago",
      },
    ],
  },
  {
    incidentId: "INC-2024",
    playerId: "P-1219",
    playerName: "PixelReign",
    matchId: "M-7749",
    cheatType: "Aimbot",
    severity: "Critical",
    status: "Under Review",
    riskScore: 96,
    region: "NA-East",
    detectionReason:
      "Repeated perfect lock-on movements with near-zero adjustment variance.",
    createdAtRelative: "43 min ago",
    evidenceVideo: "/evidence/pixelreign-aimbot.mp4",
    evidenceThumbnail: "/evidence/pixelreign-aimbot.jpg",
    metrics: [
      { label: "Lock-On Accuracy", value: "99.2%", tone: "danger" },
      { label: "Aim Correction Variance", value: "0.3%", tone: "danger" },
      { label: "Snap Events", value: "22", tone: "danger" },
      { label: "Review Status", value: "Pending Review", tone: "warning" },
    ],
    timeline: [
      {
        id: "T1",
        label: "Detection Created",
        description:
          "Repeated aim-lock events triggered critical threat scoring.",
        time: "43 min ago",
      },
      {
        id: "T2",
        label: "Escalated",
        description:
          "Incident escalated due to repeated cross-match consistency.",
        time: "40 min ago",
      },
      {
        id: "T3",
        label: "Under Review",
        description:
          "Moderator opened the forensic review workflow.",
        time: "37 min ago",
      },
    ],
  },
];

export const playerRiskRecords: PlayerRiskRecord[] = [
  {
    playerId: "P-1001",
    username: "GhostByte",
    region: "EU-West",
    riskScore: 94,
    status: "Flagged",
    totalIncidents: 6,
    primaryPattern: "Aimbot",
    lastSeen: "2 min ago",
    ipAddress: "8.8.8.8",
  },
  {
    playerId: "P-1033",
    username: "ZeroPing",
    region: "ME-Central",
    riskScore: 86,
    status: "Under Observation",
    totalIncidents: 4,
    primaryPattern: "Speed Hack",
    lastSeen: "8 min ago",
    ipAddress: "208.67.222.222",
  },
  {
    playerId: "P-1098",
    username: "xRogueAim",
    region: "EU-West",
    riskScore: 82,
    status: "Banned",
    totalIncidents: 5,
    primaryPattern: "No Recoil",
    lastSeen: "14 min ago",
  },
  {
    playerId: "P-1127",
    username: "SilentNova",
    region: "NA-East",
    riskScore: 37,
    status: "Cleared",
    totalIncidents: 1,
    primaryPattern: "Wallhack",
    lastSeen: "23 min ago",
  },
  {
    playerId: "P-1184",
    username: "VantaStrike",
    region: "EU-West",
    riskScore: 74,
    status: "Flagged",
    totalIncidents: 3,
    primaryPattern: "Trigger Bot",
    lastSeen: "31 min ago",
  },
  {
    playerId: "P-1219",
    username: "PixelReign",
    region: "NA-East",
    riskScore: 96,
    status: "Under Observation",
    totalIncidents: 7,
    primaryPattern: "Aimbot",
    lastSeen: "43 min ago",
  },
];

export const auditRecords: AuditRecord[] = [
  {
    actionId: "ACT-5001",
    actionType: "Incident Created",
    actor: "Detection Engine",
    incidentId: "INC-2041",
    playerId: "P-1001",
    playerName: "GhostByte",
    summary:
      "Critical aimbot suspicion was logged after repeated precision anomalies.",
    timestampRelative: "2 min ago",
  },
  {
    actionId: "ACT-5002",
    actionType: "Status Updated",
    actor: "Moderator: Islam",
    incidentId: "INC-2038",
    playerId: "P-1033",
    playerName: "ZeroPing",
    summary: "Case moved to Under Review for manual inspection.",
    timestampRelative: "7 min ago",
  },
  {
    actionId: "ACT-5003",
    actionType: "Player Banned",
    actor: "Moderator: Luna",
    incidentId: "INC-2035",
    playerId: "P-1098",
    playerName: "xRogueAim",
    summary:
      "Player was banned after repeated no-recoil detections were confirmed.",
    timestampRelative: "13 min ago",
  },
  {
    actionId: "ACT-5004",
    actionType: "Incident Dismissed",
    actor: "Moderator: Omar",
    incidentId: "INC-2029",
    playerId: "P-1127",
    playerName: "SilentNova",
    summary: "Case dismissed due to insufficient supporting evidence.",
    timestampRelative: "21 min ago",
  },
  {
    actionId: "ACT-5005",
    actionType: "Player Flagged",
    actor: "Detection Engine",
    incidentId: "INC-2027",
    playerId: "P-1184",
    playerName: "VantaStrike",
    summary:
      "Player entered watchlist after multiple trigger bot signatures were detected.",
    timestampRelative: "30 min ago",
  },
  {
    actionId: "ACT-5006",
    actionType: "System Note",
    actor: "System Health Monitor",
    summary:
      "Queue latency remained stable during the latest burst simulation window.",
    timestampRelative: "34 min ago",
  },
];

export const serviceHealthRecords: ServiceHealthRecord[] = [
  {
    service: "API Gateway",
    status: "Healthy",
    uptime: "99.99%",
    latency: "42 ms",
    notes:
      "Inbound request handling remains stable across the latest observation window.",
  },
  {
    service: "Detection Processor",
    status: "Healthy",
    uptime: "99.95%",
    latency: "87 ms",
    notes:
      "Suspicious event evaluation is operating within expected thresholds.",
  },
  {
    service: "Incident Store",
    status: "Healthy",
    uptime: "100%",
    latency: "18 ms",
    notes: "Incident persistence and retrieval are functioning normally.",
  },
  {
    service: "Moderator Dashboard API",
    status: "Warning",
    uptime: "99.72%",
    latency: "123 ms",
    notes:
      "Minor response delay observed during the last burst simulation.",
  },
];

export const queueHealthRecords: QueueHealthRecord[] = [
  {
    queueName: "event-ingestion-queue",
    depth: 18,
    processingRate: "1.8K / min",
    retryRate: "0.3%",
    state: "Stable",
  },
  {
    queueName: "incident-review-queue",
    depth: 7,
    processingRate: "420 / min",
    retryRate: "0.1%",
    state: "Stable",
  },
  {
    queueName: "alert-dispatch-queue",
    depth: 41,
    processingRate: "650 / min",
    retryRate: "1.2%",
    state: "Elevated",
  },
];

export const reliabilityMetrics: ReliabilityMetric[] = [
  {
    label: "Burst Handling",
    value: "Passed",
    tone: "success",
  },
  {
    label: "Queue Backpressure",
    value: "Controlled",
    tone: "info",
  },
  {
    label: "Retry Stability",
    value: "Nominal",
    tone: "success",
  },
  {
    label: "Latency Spike Risk",
    value: "Moderate",
    tone: "warning",
  },
];