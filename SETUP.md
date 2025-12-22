# FinTrack Setup Guide

This guide will help you set up and run the FinTrack application with all new features.

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- Clerk account (for authentication)
- Stripe account (for payments) - Optional but recommended
- Gmail account (for email invitations) - Optional

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/vV29Raghav/FinTrack.git
cd FinTrack

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: MongoDB Setup

### Option A: Local MongoDB
```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/your/data/directory
```

### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Use it in the backend .env file

## Step 3: Clerk Setup (Authentication)

1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application
4. Copy your Publishable Key
5. Add it to frontend/.env.local

## Step 4: Stripe Setup (Payments)

1. Go to https://stripe.com
2. Sign up and get your API keys
3. Use **test mode** keys for development
4. Add keys to backend/.env and frontend/.env.local

To get webhook secret (for local testing):
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/stripe/webhook
# Copy the webhook signing secret (whsec_...)
```

## Step 5: Environment Variables

### Backend (.env)
Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fintrack
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional - for workspace invites)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Gmail App Password Setup:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use that password in EMAIL_PASSWORD

### Frontend (.env.local)
Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Step 6: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Email service ready (or warning if not configured)
🚀 FinTrack Backend API running on port 5000
🔗 Frontend URL: http://localhost:3000
🔌 WebSocket server ready
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Terminal 3 - Stripe Webhooks (Optional, for local testing)
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

## Step 7: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Features to Test

### 1. Dashboard
- ✅ Click "Add New Expense" quick action (opens modal)
- ✅ Create an expense with smart category suggestion
- ✅ View stats (Total, Monthly, Pending, Average Daily)
- ✅ Delete an expense from recent list

### 2. Inbox
- ✅ View pending expenses for approval
- ✅ Send a payment request to another user
- ✅ Send chat messages in real-time
- ✅ Receive notifications for payment requests

### 3. Reports
- ✅ Create expense with photo upload
- ✅ Filter expenses by date range
- ✅ Sort expenses by date or amount
- ✅ Download CSV report

### 4. Workspace
- ✅ Create workspace (free tier: 1 only)
- ✅ Send email invitation to team member
- ✅ View workspace count based on subscription

### 5. Account
- ✅ View current subscription tier
- ✅ Click "Upgrade" on Premium or Enterprise
- ✅ Complete Stripe checkout (use test card: 4242 4242 4242 4242)
- ✅ Verify subscription updates

### 6. Features Page
- ✅ Explore unique features
- ✅ View feature descriptions and benefits

## Test Cards (Stripe Test Mode)

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0027 6000 3184

Use any future expiry date, any CVC, and any postal code.

## Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
mongosh  # Should connect successfully

# Check if port 5000 is available
lsof -i :5000  # Should be empty or show node process
```

### Frontend won't start
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### WebSocket not connecting
- Ensure backend is running
- Check NEXT_PUBLIC_SOCKET_URL in frontend/.env.local
- Check browser console for errors

### File upload not working
- Backend creates `uploads/` directory automatically
- Check file size (max 5MB)
- Check file type (images and PDF only)

### Email invitations not working
- Verify EMAIL_USER and EMAIL_PASSWORD in backend/.env
- Check Gmail App Password (not regular password)
- See backend console for detailed error messages
- Email configuration is optional - invites will still generate shareable links

### Stripe payments not working
- Use test mode keys during development
- Verify STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- Check Stripe dashboard for payment status
- For webhooks, ensure Stripe CLI is running

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload
2. **API Testing:** Use Postman or Thunder Client for API testing
3. **Database GUI:** Use MongoDB Compass for database management
4. **Logs:** Check terminal for detailed error messages
5. **Network Tab:** Use browser DevTools to debug API calls

## Production Deployment

### Backend
```bash
# Build (if needed)
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name fintrack-api
```

### Frontend
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
- Use production MongoDB URI
- Use production Clerk keys
- Use production Stripe keys
- Set NODE_ENV=production

## Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Never commit .env files
- [ ] Use HTTPS in production
- [ ] Enable Stripe webhook signature verification
- [ ] Validate file uploads server-side
- [ ] Implement rate limiting
- [ ] Use production database with authentication
- [ ] Set up proper CORS origins

## Support

For issues or questions:
- Check FEATURES.md for feature documentation
- Review backend console logs
- Check MongoDB connection
- Verify environment variables
- Test with Postman for API issues

## Next Steps

1. Create your first expense with photo upload
2. Invite team members to your workspace
3. Try the smart category suggestions
4. Send a payment request in Inbox
5. Upgrade to Premium to test Stripe integration
6. Export your expenses as CSV
7. Explore the Features page for upcoming features

Enjoy using FinTrack! 🚀
