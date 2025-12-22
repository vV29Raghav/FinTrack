// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ======================
// Config
// ======================
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fintrack';

// ======================
// Socket.IO Setup
// ======================
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    const { recipientId, message, senderId, senderName, type } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', {
        senderId,
        senderName,
        message,
        type,
        timestamp: new Date(),
      });
    }
  });

  // Payment request
  socket.on('send_payment_request', (data) => {
    const { recipientId, amount, description, senderId, senderName } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_payment_request', {
        senderId,
        senderName,
        amount,
        description,
        timestamp: new Date(),
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io available in routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// ======================
// MongoDB Connection
// ======================
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
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
const paymentRequestRoutes = require('./routes/paymentRequestRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

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
app.use('/api/payment-requests', paymentRequestRoutes);
app.use('/api/stripe', stripeRoutes);

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
server.listen(PORT, () => {
  console.log(`🚀 FinTrack Backend API running on port ${PORT}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔌 WebSocket server ready`);
});
