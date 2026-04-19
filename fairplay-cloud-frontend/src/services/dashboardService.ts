import type {
  CheatDistributionItem,
  KpiMetric,
  OverviewTrendPoint,
  RecentIncident,
} from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Player = {
  playerId: string;
  username: string;
  region: string;
  riskScore: number;
  status: string;
  totalIncidents: number;
  primaryPattern: string;
  lastSeen: string;
};

type Incident = {
  incidentId: string;
  playerId: string;
  playerName: string;
  matchId: string;
  cheatType: string;
  severity: string;
  status: string;
  riskScore: number;
  region: string;
  detectionReason: string;
  createdAt?: string;
  updatedAt?: string;
};

async function fetchPlayers(): Promise<Player[]> {
  const response = await fetch(`${API_BASE_URL}/players`);

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  return response.json();
}

async function fetchIncidents(): Promise<Incident[]> {
  const response = await fetch(`${API_BASE_URL}/incidents`);

  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }

  return response.json();
}

export async function getOverviewKpis(): Promise<KpiMetric[]> {
  const [players, incidents] = await Promise.all([fetchPlayers(), fetchIncidents()]);

  const flaggedPlayers = players.filter(
    (player) => player.status === "Flagged" || player.status === "Under Observation"
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status === "Open" || incident.status === "Under Review"
  ).length;

  const criticalIncidents = incidents.filter(
    (incident) => incident.severity === "Critical"
  ).length;

  return [
    {
      id: "players-monitored",
      label: "Players Monitored",
      value: String(players.length),
      hint: `${flaggedPlayers} flagged or under observation`,
      tone: "info",
    },
    {
      id: "open-incidents",
      label: "Open Incidents",
      value: String(openIncidents),
      hint: `${criticalIncidents} marked critical`,
      tone: "warning",
    },
    {
      id: "confirmed-cases",
      label: "Confirmed Cases",
      value: String(
        incidents.filter((incident) => incident.status === "Confirmed").length
      ),
      hint: "Real backend-connected incidents",
      tone: "danger",
    },
    {
      id: "system-health",
      label: "System Health",
      value: "Online",
      hint: "Core backend routes responding",
      tone: "success",
    },
  ];
}

export async function getIncidentTrend(): Promise<OverviewTrendPoint[]> {
  const incidents = await fetchIncidents();

  const grouped = new Map<string, number>();

  incidents.forEach((incident) => {
    const rawDate = incident.createdAt ?? "";
    const date = rawDate ? new Date(rawDate) : null;

    const key =
      date && !Number.isNaN(date.getTime())
        ? `${String(date.getHours()).padStart(2, "0")}:00`
        : "Unknown";

    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  });

  return Array.from(grouped.entries())
    .map(([hour, incidents]) => ({ hour, incidents }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

export async function getCheatDistribution(): Promise<CheatDistributionItem[]> {
  const incidents = await fetchIncidents();

  const counts = new Map<string, number>();

  incidents.forEach((incident) => {
    counts.set(incident.cheatType, (counts.get(incident.cheatType) ?? 0) + 1);
  });

  const total = incidents.length || 1;

  return Array.from(counts.entries()).map(([name, count]) => ({
    name: name as CheatDistributionItem["name"],
    value: Math.round((count / total) * 100),
  }));
}

export async function getRecentIncidents(): Promise<RecentIncident[]> {
  const incidents = await fetchIncidents();

  return incidents
    .slice()
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5)
    .map((incident) => ({
      incidentId: incident.incidentId,
      playerId: incident.playerId,
      playerName: incident.playerName,
      cheatType: incident.cheatType as RecentIncident["cheatType"],
      severity: incident.severity as RecentIncident["severity"],
      status: incident.status as RecentIncident["status"],
      riskScore: Number(incident.riskScore),
      region: incident.region,
      createdAtRelative: incident.createdAt ?? "Unknown time",
    }));
}