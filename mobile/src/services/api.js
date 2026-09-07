import { DEFAULT_API_URL, loadServerUrl } from "./session.js";

let activeBaseUrl = DEFAULT_API_URL;

// Initialize base URL from AsyncStorage
loadServerUrl().then((url) => {
  if (url) activeBaseUrl = url.replace(/\/+$/, "");
});

export const setApiBaseUrl = (url) => {
  activeBaseUrl = (url || DEFAULT_API_URL).trim().replace(/\/+$/, "");
};

export const getApiBaseUrl = () => activeBaseUrl;

const request = async (path, { method = "GET", token, body, timeoutMs = 12000 } = {}) => {
  const url = `${activeBaseUrl}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { text: await response.text() };
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || (data.errors && data.errors[0]?.message) || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Connection timed out after ${timeoutMs / 1000}s. Verify server URL (${activeBaseUrl}).`);
    }
    if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
      throw new Error(`Cannot connect to server at ${activeBaseUrl}. Ensure the backend is running and reachable.`);
    }
    throw error;
  }
};

const query = (params = {}) => {
  const values = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
  return values.length ? `?${new URLSearchParams(values).toString()}` : "";
};

export const api = {
  // Health & connection check
  checkHealth: async (customUrl) => {
    const targetUrl = (customUrl || activeBaseUrl).replace(/\/+$/, "");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const start = Date.now();
    try {
      const response = await fetch(`${targetUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const latency = Date.now() - start;
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: true, latency, data };
      }
      return { success: false, latency, error: `HTTP ${response.status}` };
    } catch (err) {
      clearTimeout(timeoutId);
      return { success: false, latency: Date.now() - start, error: err.message };
    }
  },

  // Auth endpoints
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/api/auth/me", { token }),

  // Student endpoints
  students: (token, params) => request(`/api/students${query(params)}`, { token }),
  createStudent: (token, body) => request("/api/students", { method: "POST", token, body }),
  updateStudent: (token, id, body) => request(`/api/students/${id}`, { method: "PUT", token, body }),

  // Attendance endpoints
  register: (token, params) => request(`/api/attendance/register${query(params)}`, { token }),
  submitAttendance: (token, body) => request("/api/attendance/submit", { method: "POST", token, body }),

  // Admin endpoints
  statistics: (token, params) => request(`/api/admin/statistics${query(params)}`, { token }),
  absentees: (token, params) => request(`/api/admin/absentees${query(params)}`, { token }),
  sheet: (token, params) => request(`/api/admin/sheet${query(params)}`, { token }),
};
