import axios from 'axios'

const API_BASE = `${import.meta.env.VITE_API_URL}/api`

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Inject token into requests
api.interceptors.request.use((config) => {
  try {
    const auth = localStorage.getItem('sp_auth')

    if (auth) {
      const parsed = JSON.parse(auth)

      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    }
  } catch (err) {
    console.error('API Auth Interceptor Error:', err)
  }

  return config
})

// Handle expired tokens
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const auth = JSON.parse(localStorage.getItem('sp_auth') || '{}')

        if (auth.refreshToken) {
          const res = await axios.post(
            `${API_BASE}/auth/refresh`,
            {
              refreshToken: auth.refreshToken,
            }
          )

          const { token, refreshToken } = res.data

          localStorage.setItem(
            'sp_auth',
            JSON.stringify({
              ...auth,
              token,
              refreshToken,
            })
          )

          api.defaults.headers.common.Authorization = `Bearer ${token}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('sp_auth')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ── API Services ──────────────────────────────────────────────────────

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  verifyEmail: (email, otp) => api.post('/auth/verify-email', { email, otp }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
  me: () => api.get('/auth/me'),
}

export const groups = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  addMember: (groupId, userId) => api.post(`/groups/${groupId}/members`, { userId }),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
}

export const expenses = {
  getUserRecent: () => api.get('/expenses'),
  getByGroup: (groupId) => api.get(`/expenses/group/${groupId}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
}

export const settlements = {
  getPending: (groupId) => api.get(`/settlements/${groupId}`),
  pay: (data) => api.post('/settlements/pay', data),
}

export const notifications = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

export const reports = {
  getSummary: () => api.get('/reports/summary'),
  getMonthly: () => api.get('/reports/monthly'),
  getCategory: () => api.get('/reports/category'),
}

export const users = {
  search: (q) => api.get(`/users/search?q=${q}`),
  addFriend: (userId) => api.post('/users/add-friend', { userId }),
  removeFriend: (userId) => api.delete(`/users/remove-friend/${userId}`),
}

export default api