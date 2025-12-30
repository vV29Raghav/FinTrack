// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');


const app = express();

// ======================
// Config
// ======================
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fintrack';

// ======================
// Middleware
// ======================
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// MongoDB Connection
// ======================
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Do not exit process, let it try to reconnect or handle gracefully
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// ======================
// Email Transporter (GLOBAL)
// ======================
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err) => {
    if (err) {
      console.error('⚠️ Email setup error:', err.message);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.log('📧 Email not configured (invites will return links only)');
}

// Make transporter available in routes
app.set('transporter', transporter);
app.set('frontendUrl', FRONTEND_URL);

// ======================
// Routes
// ======================
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinTrack Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/messages', messageRoutes);

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`🚀 FinTrack Backend API running on port ${PORT}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
});
