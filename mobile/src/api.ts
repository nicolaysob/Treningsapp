import { API_URL } from "./config";

export type MobileUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

export type WorkoutItem = {
  sport: string;
  description: string;
  durationMin: number;
};

export type HomeData = {
  greeting: string;
  userName: string | null;
  latestLoad: { ctl: number; atl: number; tsb: number } | null;
  weekTss: number;
  weeklyTssGoal: number | null;
  raceName: string | null;
  daysToRace: number | null;
  coachTitle: string | null;
  coachSummary: string | null;
  coachReadiness: number | null;
  coachTone: "fresh" | "balanced" | "building" | "risk" | null;
  pmcChart: Array<{ date: string; ctl: number; atl: number; tsb: number }>;
  todayWorkouts: WorkoutItem[];
  tomorrowWorkouts: WorkoutItem[];
  tomorrowLabel: string;
};

export type CalendarDay = {
  key: string;
  date: string;
  isCurrentMonth: boolean;
  activities: Array<{ id: string; sport: string; durationSec: number; tss: number | null }>;
  planned: Array<{ id: string; sport: string; description: string; durationMin: number }>;
};

export type CalendarData = {
  monthStart: string;
  monthLabel: string;
  todayKey: string;
  prevMonth: string;
  nextMonth: string;
  days: CalendarDay[];
};

export type LeaderboardData = {
  weekStart: string;
  weekLabel: string;
  prevWeekStart: string;
  nextWeekStart: string;
  currentUserId: string;
  rows: Array<{
    userId: string;
    userName: string | null;
    userImage: string | null;
    totalTss: number;
    totalDurationSec: number;
    longestDurationSec: number;
    totalElevationM: number;
  }>;
};

export type FriendsData = {
  incoming: Array<{ id: string; user: { id: string; name: string | null; username: string | null } }>;
  outgoing: Array<{ id: string; user: { id: string; name: string | null; username: string | null } }>;
  friends: Array<{
    friendshipId: string;
    user: { id: string; name: string | null; username: string | null };
  }>;
  stats: { friendCount: number; pendingCount: number };
};

export type CoachData = {
  hasData: boolean;
  hrMaxBpm: number | null;
  setup: {
    needsHrMaxSetup: boolean;
    isActive: boolean;
    method: string | null;
  };
  report: {
    summary: {
      headline: string;
      detail: string;
      tone: string;
      readiness: number;
      tips: string[];
    };
    metrics: Array<{ label: string; value: string; hint: string }>;
    weekly: {
      sessions: number;
      hardSessions: number;
      totalTss: number;
      prevWeekTss: number;
      weekDeltaPct: number | null;
      trainingDaysStreak: number;
    };
    sports: Array<{ label: string; sessions: number; tss: number; sharePct: number }>;
    findings: Array<{ category: string; title: string; body: string }>;
    tips: string[];
    dayPlan: Array<{ label: string; recommendation: string; intensity: string }>;
  } | null;
  zoneDistribution: {
    weekStart: string;
    weekEnd: string;
    totalDurationSec: number;
    classifiedDurationSec: number;
    easyPercent: number;
    hardPercent: number;
    targetEasyPercent: number;
    targetHardPercent: number;
    zones: Array<{
      zone: string;
      label: string;
      durationSec: number;
      percent: number;
    }>;
  } | null;
};

export type SettingsData = {
  profile: { name: string | null; username: string | null; image: string | null };
  stravaConnected: boolean;
  training: {
    weeklyTssGoal: number | null;
    ftpWatts: number | null;
    thresholdPaceSecPerKm: number | null;
    hrThresholdBpm: number | null;
    hrMaxBpm: number | null;
    raceName: string | null;
    raceDate: string | null;
    method: string | null;
    isActive: boolean;
    needsHrMaxSetup: boolean;
    tssCoverage: number;
  };
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    if (text.trimStart().startsWith("<")) {
      throw new Error("Serveren svarer ikke ennå — vent på deploy eller oppdater appen.");
    }
    throw new Error("Ugyldig svar fra serveren");
  }
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Noe gikk galt");
  }
  return data as T;
}

async function authFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<T>(res);
}

async function authMutate<T>(
  path: string,
  token: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseJson<T>(res);
}

export async function login(
  username: string,
  password: string,
): Promise<{ token: string; user: MobileUser }> {
  const res = await fetch(`${API_URL}/api/mobile/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return parseJson(res);
}

export const fetchHome = (token: string, days = 90) =>
  authFetch<HomeData>(`/api/mobile/home?days=${days}`, token);
export const fetchCalendar = (token: string, month?: string) =>
  authFetch<CalendarData>(`/api/mobile/calendar${month ? `?month=${month}` : ""}`, token);
export const fetchCoach = (token: string) => authFetch<CoachData>("/api/mobile/coach", token);
export const fetchLeaderboard = (token: string, weekStart?: string) =>
  authFetch<LeaderboardData>(
    `/api/mobile/leaderboard${weekStart ? `?weekStart=${weekStart}` : ""}`,
    token,
  );
export const fetchFriends = (token: string) => authFetch<FriendsData>("/api/mobile/friends", token);
export const fetchSettings = (token: string) => authFetch<SettingsData>("/api/mobile/settings", token);

export const createPlannedWorkout = (
  token: string,
  data: { date: string; sport: string; description: string; durationMin: number },
) => authMutate("/api/mobile/calendar/planned", token, "POST", data);

export const deletePlannedWorkout = (token: string, id: string) =>
  authMutate(`/api/mobile/calendar/planned?id=${encodeURIComponent(id)}`, token, "DELETE");

export const sendFriendRequest = (token: string, username: string) =>
  authMutate("/api/mobile/friends/request", token, "POST", { username });

export const acceptFriendRequest = (token: string, id: string) =>
  authMutate(`/api/mobile/friends/${id}`, token, "POST");

export const removeFriendship = (token: string, id: string) =>
  authMutate(`/api/mobile/friends/${id}`, token, "DELETE");

export const triggerSync = (token: string) =>
  authMutate<{ ok: boolean; started: boolean }>("/api/mobile/settings/sync", token, "POST");

export const getStravaConnectUrl = (token: string, returnTo: string) =>
  authFetch<{ url: string; redirectUri: string }>(
    `/api/mobile/strava/connect?returnTo=${encodeURIComponent(returnTo)}`,
    token,
  );

export const completeStravaConnect = (token: string, code: string) =>
  authMutate<{ ok: boolean }>("/api/mobile/strava/callback", token, "POST", { code });

export const disconnectStrava = (token: string) =>
  authMutate<{ ok: boolean }>("/api/mobile/strava", token, "DELETE");

export const updateProfile = (
  token: string,
  data: { name: string; username: string; image?: string | null },
) => authMutate<{ ok: boolean }>("/api/mobile/settings/profile", token, "PATCH", data);

export const updateTrainingGoals = (
  token: string,
  data: { weeklyTssGoal?: number | null; raceName?: string | null; raceDate?: string | null },
) => authMutate<{ ok: boolean }>("/api/mobile/settings/training/goals", token, "PATCH", data);

export const updateTrainingThresholds = (
  token: string,
  data: {
    hrMaxBpm?: number | null;
    hrThresholdBpm?: number | null;
    ftpWatts?: number | null;
    thresholdPaceMinPerKm?: string | null;
  },
) => authMutate<{ ok: boolean }>("/api/mobile/settings/training/thresholds", token, "PATCH", data);

export const saveHrMaxQuick = (token: string, hrMaxBpm: number) =>
  authMutate<{ ok: boolean }>("/api/mobile/settings/training/thresholds", token, "POST", {
    hrMaxBpm,
  });
