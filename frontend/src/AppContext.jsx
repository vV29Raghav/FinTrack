import { createContext, useContext, useReducer, useEffect } from 'react'
import { auth } from './api.js'
import { toast } from './utils.js'

const AppContext = createContext(null)

const initialState = {
  // Auth
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  // Theme
  isDark: false,
  // Notifications
  notifications: [],
  // UI
  expenses: [],
  groups: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { 
        ...state, 
        user: action.payload.user, 
        token: action.payload.token, 
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true 
      }
    case 'LOGOUT':
      return { ...state, user: null, token: null, refreshToken: null, isAuthenticated: false }
    case 'TOGGLE_THEME':
      return { ...state, isDark: !state.isDark }
// ... (rest of reducer stay same)
    case 'MARK_NOTIF_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  // Load persisted state
  const getInitial = () => {
    try {
      const saved = localStorage.getItem('sp_auth')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...initialState, ...parsed }
      }
    } catch (_) {}
    return initialState
  }

  const [state, dispatch] = useReducer(reducer, undefined, getInitial)

  // Persist auth state
  useEffect(() => {
    localStorage.setItem('sp_auth', JSON.stringify({
      user: state.user,
      token: state.token,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      isDark: state.isDark,
    }))
  }, [state.user, state.token, state.refreshToken, state.isAuthenticated, state.isDark])

  // Apply theme
  useEffect(() => {
    if (state.isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.isDark])

  const unreadCount = state.notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{ state, dispatch, unreadCount }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function useAuth() {
  const { state, dispatch } = useApp()

  const login = async (email, password) => {
    try {
      const res = await auth.login(email, password)
      const { token, refreshToken, user } = res.data
      dispatch({ type: 'LOGIN', payload: { user, token, refreshToken } })
      return { success: true }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isVerified === false) {
        toast.info(err.response.data.message)
        return { success: false, needsVerification: true }
      }
      toast.error(err.response?.data?.message || 'Login failed')
      return { success: false }
    }
  }

  const signup = async (data) => {
    try {
      const res = await auth.signup(data)
      toast.success(res.data.message || 'Please check your email for the OTP.')
      return { success: true, needsVerification: true }
    } catch (err) {
      // Handle the case where email exists but not verified (201 returned)
      if (err.response?.status === 201) {
        toast.success(err.response.data.message)
        return { success: true, needsVerification: true }
      }
      toast.error(err.response?.data?.message || 'Signup failed')
      return { success: false }
    }
  }

  const verifyEmail = async (email, otp) => {
    try {
      const res = await auth.verifyEmail(email, otp)
      const { token, refreshToken, user } = res.data
      dispatch({ type: 'LOGIN', payload: { user, token, refreshToken } })
      toast.success('Email verified successfully!')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('sp_auth')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (updates) => dispatch({ type: 'UPDATE_USER', payload: updates })

  return { user: state.user, isAuthenticated: state.isAuthenticated && !!state.token, login, signup, verifyEmail, logout, updateUser }
}
