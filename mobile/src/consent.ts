import * as SecureStore from "expo-secure-store";

const CONSENT_KEY = "treningsapp_consent_v1";

export async function hasAcceptedConsent(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(CONSENT_KEY);
  return value === "1";
}

export async function saveConsentAccepted(): Promise<void> {
  await SecureStore.setItemAsync(CONSENT_KEY, "1");
}
