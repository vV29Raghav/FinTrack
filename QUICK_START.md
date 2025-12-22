# FinTrack - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB running (local or Atlas)
- [ ] Clerk account created (https://clerk.com)
- [ ] Git repository cloned

### Quick Setup

#### 1. Install Dependencies (2 minutes)
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Configure Environment (2 minutes)

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fintrack
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### 3. Start Services (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 4. Open Browser
```
http://localhost:3000
```

---

## ✨ Test Key Features (5 minutes)

### Dashboard
1. Click "Add New Expense"
2. Type "Starbucks coffee" → See category suggestion
3. Fill form and create
4. Click delete on an expense

### Inbox
1. Navigate to Inbox
2. Switch to "Chat" tab
3. Type a message
4. Switch to "Payment Requests" tab

### Reports
1. Navigate to Reports
2. Click "New Expense"
3. Upload a photo
4. Filter by date
5. Click "Export CSV"

### Features
1. Navigate to Features (sidebar)
2. Explore unique features
3. Read descriptions

---

## 🔧 Optional: Advanced Setup

For full functionality, configure:

### Stripe (Payments)
```env
# Backend .env
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Frontend .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
```

### Email (Invitations)
```env
# Backend .env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 📚 Documentation

- **SETUP.md** - Complete setup guide
- **FEATURES.md** - Feature documentation
- **IMPLEMENTATION_SUMMARY.md** - What was implemented
- **README.md** - Project overview

---

## 🐛 Common Issues

**Backend won't start:**
```bash
# Check MongoDB
mongosh

# Check port
lsof -i :5000
```

**Frontend won't start:**
```bash
# Clear cache
rm -rf .next
npm run dev
```

**WebSocket not connecting:**
- Check NEXT_PUBLIC_SOCKET_URL matches backend port
- Ensure backend is running
- Check browser console

---

## 🎯 What's Working

✅ Dashboard with modal and stats  
✅ Real-time chat (Socket.io)  
✅ Payment requests  
✅ Photo uploads  
✅ Smart categorization  
✅ CSV export  
✅ Workspace limits  
✅ Stripe checkout (if configured)  
✅ Email invites (if configured)  

---

## 📞 Need Help?

1. Check **SETUP.md** for detailed instructions
2. Check **FEATURES.md** for feature guides
3. Check browser console for errors
4. Check backend terminal for logs
5. Verify environment variables are set

---

**Ready to track expenses efficiently!** 🚀
