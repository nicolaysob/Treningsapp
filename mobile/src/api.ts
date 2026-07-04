import { API_URL } from "./config";

export type MobileUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

export type HomeData = {
  greeting: string;
  userName: string | null;
  latestLoad: { ctl: number; atl: number; tsb: number } | null;
  weekTss: number;
  weeklyTssGoal: number | null;
  coachTitle: string | null;
  coachSummary: string | null;
  todayWorkouts: Array<{ sport: string; description: string; durationMin: number }>;
};

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
  const res = await fetch(`${API_URL}/api/mobile/home`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJson(res);
}
