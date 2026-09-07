const baseUrl = (process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000").replace(/\/$/, "");

const request = async (path, { method = "GET", token, body } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
};

const query = (params = {}) => {
  const values = Object.entries(params).filter(([, value]) => value !== undefined && value !== "");
  return values.length ? `?${new URLSearchParams(values).toString()}` : "";
};

export const api = {
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/api/auth/me", { token }),
  students: (token, params) => request(`/api/students${query(params)}`, { token }),
  createStudent: (token, body) => request("/api/students", { method: "POST", token, body }),
  updateStudent: (token, id, body) => request(`/api/students/${id}`, { method: "PUT", token, body }),
  register: (token, params) => request(`/api/attendance/register${query(params)}`, { token }),
  submitAttendance: (token, body) => request("/api/attendance/submit", { method: "POST", token, body }),
  statistics: (token, params) => request(`/api/admin/statistics${query(params)}`, { token }),
  absentees: (token, params) => request(`/api/admin/absentees${query(params)}`, { token }),
};
