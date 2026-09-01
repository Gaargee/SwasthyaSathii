const API_BASE = 'https://swasthyasathi-server.onrender.com/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('swasthyasathi_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Server unreachable. Working offline.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (identifier, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  verifyOtp: (identifier, otp, workerId) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ identifier, otp, workerId }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/profile'),

  // Patients
  getPatients: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/patients${q ? '?' + q : ''}`);
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
  getDashboardStats: () => request('/patients/stats/dashboard'),
  getAreaStats: () => request('/patients/area/stats'),

  // Visits
  addVisit: (data) => request('/visits', { method: 'POST', body: JSON.stringify(data) }),
  getPatientVisits: (patientId) => request(`/visits/patient/${patientId}`),
  getRecentVisits: () => request('/visits/recent'),

  // AI
  assessPatient: (patientId) => request('/ai/assess', { method: 'POST', body: JSON.stringify({ patientId }) }),
  chatWithAI: (patientId, question) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ patientId, question }) }),

  // Sync
  getPendingSync: () => request('/sync/pending'),
  pushSync: () => request('/sync/push', { method: 'POST' }),
  getSyncStatus: () => request('/sync/status'),

  // Notifications
  getNotifications: (unread) => request(`/notifications${unread ? '?unread=true' : ''}`),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PUT' }),
  generateFollowups: () => request('/notifications/generate-followups', { method: 'POST' }),

  // Reports
  getDailyReport: (date) => request(`/reports/daily${date ? '?date=' + date : ''}`),
  getPatientReport: (id) => request(`/reports/patient/${id}`),
  getMonthlyReport: (month, year) => request(`/reports/monthly?month=${month}&year=${year}`),
  getAreaHealth: () => request('/reports/area-health'),
};
