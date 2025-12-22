# FinTrack Setup Guide

This guide will help you get FinTrack up and running in just a few steps.

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** installed locally OR a MongoDB Atlas account - [Get started](https://www.mongodb.com/)
- **Clerk account** for authentication - [Sign up free](https://clerk.com/)

## Step-by-Step Setup

### 1. Install Dependencies

Navigate to the fintrack directory and install packages:

```bash
cd fintrack
npm install
```

This will install all required packages including Next.js, React, Clerk, Mongoose, and more.

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB on your machine
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `<password>` with your database password

### 3. Configure Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Add application"
3. Name it "FinTrack" and click "Create application"
4. Copy your **Publishable key** (starts with `pk_`)
5. Copy your **Secret key** (starts with `sk_`)

### 4. Set Up Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and update with your keys:

```env
# Replace with your Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here

# Update MongoDB URI if needed
MONGODB_URI=mongodb://localhost:27017/fintrack
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fintrack
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

### 6. Test the Application

1. **Landing Page**: Open http://localhost:3000
   - You should see the FinTrack landing page with beautiful gradient design
   - Click the "Login" button in the navbar

2. **Sign Up**: Click "Get Started" on any card
   - Create an account using email or social login
   - Complete the Clerk onboarding

3. **Dashboard**: After login, you'll be redirected to the dashboard
   - Explore the 5 main sections: Dashboard, Inbox, Reports, Workspace, Account

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running. Start it with `mongod` command.

### Clerk Authentication Error
```
Error: Missing publishable key
```
**Solution**: Check that your `.env.local` file has the correct Clerk keys.

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Kill the process using port 3000 or use a different port:
```bash
npm run dev -- -p 3001
```

## Next Steps

Once your app is running:

1. **Create Your First Expense**
   - Go to Reports → Click "New Expense"
   - Fill in the details and submit

2. **Set Up a Workspace**
   - Go to Workspace → Click "Create Workspace"
   - Invite team members by email

3. **Explore the Inbox**
   - Check pending expenses
   - Send messages to team members

4. **Customize Your Profile**
   - Go to Account → Update subscription plan
   - Add payment method (if upgrading)

## Production Deployment

When ready to deploy:

1. **Build the application**:
```bash
npm run build
```

2. **Deploy to Vercel** (Recommended):
```bash
npm install -g vercel
vercel
```

3. **Set environment variables** in your hosting platform dashboard

## Support

For issues or questions:
- Check the [main README](./README.md) for detailed documentation
- Review [Next.js docs](https://nextjs.org/docs)
- Check [Clerk docs](https://clerk.com/docs)
- Visit [MongoDB docs](https://www.mongodb.com/docs/)

## Features Overview

- ✅ **Landing Page** with hero section, benefits, and footer
- ✅ **Clerk Authentication** with sign-in/sign-up
- ✅ **Dashboard** with statistics and recent activity
- ✅ **Inbox** for messages and pending expenses
- ✅ **Reports** to create and manage expenses
- ✅ **Workspace** for team collaboration
- ✅ **Account** for subscription management
- ✅ **Responsive Design** works on all devices
- ✅ **Modern UI** with Tailwind CSS gradients

Enjoy using FinTrack! 🎉
