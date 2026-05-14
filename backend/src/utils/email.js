import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendVerificationEmail = async (to, otp) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"FinTrack App" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FinTrack!</h2>
          <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
          <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Verification email sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

export const sendPasswordResetEmail = async (to, otp) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"FinTrack App" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the following OTP to reset it:</p>
          <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please safely ignore this email.</p>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}
