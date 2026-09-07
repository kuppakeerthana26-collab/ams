import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "attendance-monitor-session";
const SERVER_URL_KEY = "attendance-monitor-server-url";

export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000";

export const loadSession = async () => {
  try {
    const value = await AsyncStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn("Failed to load session:", error);
    return null;
  }
};

export const saveSession = async (session) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn("Failed to save session:", error);
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn("Failed to clear session:", error);
  }
};

export const loadServerUrl = async () => {
  try {
    const value = await AsyncStorage.getItem(SERVER_URL_KEY);
    return value || DEFAULT_API_URL;
  } catch (error) {
    return DEFAULT_API_URL;
  }
};

export const saveServerUrl = async (url) => {
  try {
    const cleaned = (url || "").trim().replace(/\/+$/, "");
    await AsyncStorage.setItem(SERVER_URL_KEY, cleaned);
    return cleaned;
  } catch (error) {
    console.warn("Failed to save server URL:", error);
    return url;
  }
};
