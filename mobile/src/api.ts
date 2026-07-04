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

async function authFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson<T>(res);
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Noe gikk galt");
  }
  return data as T;
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

export async function fetchHome(token: string): Promise<HomeData> {
  return authFetch<HomeData>("/api/mobile/home", token);
}
