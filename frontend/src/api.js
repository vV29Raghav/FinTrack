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

export default api