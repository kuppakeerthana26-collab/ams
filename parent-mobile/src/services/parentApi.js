import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY_API_URL = "@gkce_parent_api_url";

// Default local Wi-Fi endpoint on port 3000
const DEFAULT_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.137.110:3000"
).replace(/\/$/, "");

let cachedApiUrl = null;

export const getApiUrl = async () => {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_API_URL);
    if (saved && saved.trim()) {
      cachedApiUrl = saved.trim().replace(/\/$/, "");
      return cachedApiUrl;
    }
  } catch {
    // fallback
  }
  cachedApiUrl = DEFAULT_URL;
  return cachedApiUrl;
};

export const setCustomApiUrl = async (newUrl) => {
  const cleaned = (newUrl || "").trim().replace(/\/$/, "");
  if (!cleaned) {
    await AsyncStorage.removeItem(STORAGE_KEY_API_URL);
    cachedApiUrl = DEFAULT_URL;
  } else {
    await AsyncStorage.setItem(STORAGE_KEY_API_URL, cleaned);
    cachedApiUrl = cleaned;
  }
  return cachedApiUrl;
};

const request = async (endpoint, options = {}) => {
  const baseUrl = await getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "bypass-tunnel-reminder": "true",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.deviceId ? { "x-device-id": options.deviceId } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || data.error || `HTTP ${response.status} Request failed`);
      error.status = response.status;
      error.errorCode = data.errorCode;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[ParentAPI] Error on ${endpoint}:`, err.message);

    if (err.message && err.message.includes("CLEARTEXT")) {
      const error = new Error(
        "Android security blocked unencrypted HTTP communication. Please connect using the secure HTTPS server: https://gkce-ams-parent.loca.lt"
      );
      error.isCleartext = true;
      throw error;
    }

    throw err;
  }
};

export const parentApi = {
  getApiUrl,
  setCustomApiUrl,

  /**
   * Request OTP for Parent Phone
   */
  requestOtp: (phone) => {
    return request("/api/parent/auth/request-otp", {
      method: "POST",
      body: { phone },
    });
  },

  /**
   * Verify OTP and bind hardware device
   */
  verifyOtpAndBind: ({ phone, otp, deviceId, deviceModel }) => {
    return request("/api/parent/auth/verify-otp", {
      method: "POST",
      body: { phone, otp, deviceId, deviceModel },
    });
  },

  /**
   * Get all registered wards for this parent
   */
  getWards: (token, deviceId) => {
    return request("/api/parent/wards", {
      token,
      deviceId,
    });
  },

  /**
   * Get complete attendance breakdown for a specific student
   */
  getWardAttendance: (studentId, token, deviceId) => {
    return request(`/api/parent/attendance/${studentId}`, {
      token,
      deviceId,
    });
  },

  /**
   * Request device reset from admin/HOD
   */
  resetDevice: (studentId) => {
    return request(`/api/parent/admin/reset-device/${studentId}`, {
      method: "POST",
    });
  },
};
