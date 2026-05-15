import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const FROM_EMAIL = process.env.EMAIL_FROM;
const FROM_NAME = process.env.EMAIL_FROM_NAME;

export const sendVerificationEmail = async (to, otp) => {
  try {
    const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Verify your email address')
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to FinTrack!</h2>
          <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
          <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `);

    await mailerSend.email.send(emailParams);
    console.log('Verification email sent successfully');
    return true;
  } catch (error) {
    console.error('MailerSend error sending verification email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (to, otp) => {
  try {
    const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Reset your password')
      .setHtml(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the following OTP to reset it:</p>
          <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please safely ignore this email.</p>
        </div>
      `);

    await mailerSend.email.send(emailParams);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('MailerSend error sending password reset email:', error);
    return false;
  }
};
