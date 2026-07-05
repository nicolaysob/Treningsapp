import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { completeStravaConnect, getStravaConnectUrl } from "../api";

WebBrowser.maybeCompleteAuthSession();

const CALLBACK_PATH = "strava/callback";

export async function connectStravaInApp(token: string): Promise<void> {
  const returnUrl = Linking.createURL(CALLBACK_PATH);
  const { url } = await getStravaConnectUrl(token, returnUrl);
  const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);

  if (result.type !== "success" || !result.url) {
    throw new Error("Strava-innlogging ble avbrutt");
  }

  const parsed = Linking.parse(result.url);
  const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : null;
  const error = typeof parsed.queryParams?.error === "string" ? parsed.queryParams.error : null;

  if (error || !code) {
    throw new Error("Kunne ikke koble til Strava");
  }

  await completeStravaConnect(token, code);
}
