import {
  cheatDistribution,
  incidentTrend,
  overviewKpis,
  recentIncidents,
} from "../lib/mock-data/dashboard";

export async function getOverviewKpis() {
  return Promise.resolve(overviewKpis);
}

export async function getIncidentTrend() {
  return Promise.resolve(incidentTrend);
}

export async function getCheatDistribution() {
  return Promise.resolve(cheatDistribution);
}

export async function getRecentIncidents() {
  return Promise.resolve(recentIncidents);
}