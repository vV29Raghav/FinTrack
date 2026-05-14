import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/index.js'
import { asyncHandler } from '../middleware/index.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'

const JWT_SECRET = () => process.env.JWT_SECRET
const JWT_REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET

function signAccess(id) {
  return jwt.sign({ id }, JWT_SECRET(), { expiresIn: process.env.JWT_EXPIRES_IN })
}
function signRefresh(id) {
  return jwt.sign({ id }, JWT_REFRESH_SECRET(), { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN })
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

//post api for signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    if (!exists.isVerified) {
      // Resend verification
      const otp = generateOTP()
      exists.verificationOtp = otp
      exists.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000)
      if (password) exists.passwordHash = password // Update password if provided again
      await exists.save()
      await sendVerificationEmail(exists.email, otp)
      return res.status(201).json({ message: 'Email already registered but not verified. New OTP sent.' })
    }
    return res.status(409).json({ message: 'Email already registered' })
  }

  const otp = generateOTP()

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: password,  // pre-save hook hashes this
    verificationOtp: otp,
    verificationOtpExpires: new Date(Date.now() + 15 * 60 * 1000),
  })

  await sendVerificationEmail(user.email, otp)

  res.status(201).json({ message: 'User created. Please check your email for the verification OTP.' })
})

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' })

  const user = await User.findOne({ email: email.toLowerCase() }).select('+verificationOtp +verificationOtpExpires')
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (user.isVerified) return res.status(400).json({ message: 'Email already verified' })

  if (user.verificationOtp !== otp || user.verificationOtpExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  user.isVerified = true
  user.verificationOtp = undefined
  user.verificationOtpExpires = undefined
  
  const token = signAccess(user._id)
  const refreshToken = signRefresh(user._id)
  user.refreshToken = refreshToken

  await user.save()

  res.json({
    message: 'Email verified successfully',
    token,
    refreshToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      avatar: user.avatar,
      color:  user.color,
      currency: user.currency,
    }
  })
})

//post api for login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash +isVerified')
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const match = await user.comparePassword(password)
  if (!match) return res.status(401).json({ message: 'Invalid credentials' })

  if (!user.isVerified) {
    const otp = generateOTP()
    user.verificationOtp = otp
    user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()
    await sendVerificationEmail(user.email, otp)
    return res.status(403).json({ message: 'Please verify your email to log in. A new OTP has been sent.', isVerified: false })
  }

  const token        = signAccess(user._id)
  const refreshToken = signRefresh(user._id)

  await User.findByIdAndUpdate(user._id, { refreshToken })

  res.json({
    token,
    refreshToken,
    user: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      avatar: user.avatar,
      color:  user.color,
      currency: user.currency,
    }
  })
})

// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email is required' })

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(404).json({ message: 'If an account with that email exists, an OTP will be sent.' })

  const otp = generateOTP()
  user.resetOtp = otp
  user.resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000)
  await user.save()

  await sendPasswordResetEmail(user.email, otp)

  res.json({ message: 'If an account with that email exists, an OTP will be sent.' })
})

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+resetOtp +resetOtpExpires')
  if (!user) return res.status(404).json({ message: 'User not found' })

  if (user.resetOtp !== otp || user.resetOtpExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  user.passwordHash = newPassword // hashed by pre-save hook
  user.resetOtp = undefined
  user.resetOtpExpires = undefined
  await user.save()

  res.json({ message: 'Password reset successful. You can now log in.' })
})

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token if authenticated
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
  }
  res.json({ message: 'Logged out' })
})

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' })

  let decoded
  try {
    decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET())
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' })
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ message: 'Refresh token revoked' })
  }

  const newToken        = signAccess(user._id)
  const newRefreshToken = signRefresh(user._id)
  await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken })

  res.json({ token: newToken, refreshToken: newRefreshToken })
})

// GET /api/auth/me  (alias for /users/me)
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic ? req.user.toPublic() : req.user })
})
