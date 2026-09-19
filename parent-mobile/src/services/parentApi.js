import { Platform } from "react-native";

// Automatically detect local backend endpoint
const getDefaultUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // Android emulator uses 10.0.2.2, Physical device uses LAN IP or fallback
  return Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
};

const BASE_URL = getDefaultUrl();

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
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
    throw err;
  }
};

export const parentApi = {
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
