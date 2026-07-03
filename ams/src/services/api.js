const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const getToken = () => localStorage.getItem('token')

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  students: (params = {}) => request(`/students?${new URLSearchParams(params)}`),
  createStudent: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
  attendanceRegister: (params) => request(`/attendance/register?${new URLSearchParams(params)}`),
  submitAttendance: (body) => request('/attendance/submit', { method: 'POST', body: JSON.stringify(body) }),
  statistics: (params = {}) => request(`/admin/statistics?${new URLSearchParams(params)}`),
  absentees: (params = {}) => request(`/admin/absentees?${new URLSearchParams(params)}`),
  downloadReport: async (params = {}) => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/download?${new URLSearchParams(params)}`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    })
    if (!response.ok) throw new Error('Unable to download report')
    return response.blob()
  },
}
