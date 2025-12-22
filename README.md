FinTrack

FinTrack is a modern fintech dashboard and expense tracking application built with Next.js, Tailwind CSS, Clerk for authentication, and a Node.js/Express backend with MongoDB. Users can track expenses, generate reports, manage approvals, collaborate with a team, and access unique features not found in competitor apps.

## 🌟 Unique Features

FinTrack stands out with these exclusive features:

### 🤖 Smart Expense Categorization
AI-powered keyword matching automatically suggests expense categories as you type. Save time by letting FinTrack intelligently categorize expenses like "Starbucks coffee" → Meals & Entertainment.

### 💬 Real-Time Chat & Payment Requests
Built-in WebSocket-powered messaging system allows team members to:
- Send instant messages
- Request payments from teammates
- Get real-time notifications
- Track payment request status (pending, approved, paid)

### 📸 Receipt & Photo Upload
Attach receipts and photos (up to 5MB) to expenses for better record-keeping. Supports JPEG, PNG, GIF, and PDF formats.

### 🔍 Advanced Filtering & Export
- Filter expenses by custom date ranges
- Sort by date or amount (ascending/descending)
- Export filtered data as CSV for Excel/Google Sheets

### 🎯 Subscription-Based Workspace Limits
- **Free:** 1 workspace, 50 expenses/month
- **Premium:** 5 workspaces, unlimited expenses, priority support
- **Enterprise:** Unlimited workspaces, API access, dedicated support

### 💳 Secure Stripe Integration
Upgrade subscriptions with secure Stripe checkout. Automatic subscription management and webhook handling.

### 📧 Team Collaboration
Send workspace invitations via email with one-click join links.

## Features

### Core Features

User authentication and management via Clerk

Dashboard with key statistics:

Total expenses

Monthly expenses

Pending approvals

Average daily spend

Recent expenses list with update/delete actions

Quick actions:

Add new expense (popup modal)

Generate reports with CSV export

Invite team members via email

Real-time inbox with:

Pending expense approvals

Payment requests

Live chat with WebSocket

Advanced expense management:

Smart category suggestions

Receipt/photo upload (5MB limit)

Date range filtering and sorting

CSV export for reports

Responsive design with a mobile-friendly sidebar

Secure API calls using JWT tokens

Stripe payment integration for subscriptions

Modern UI with Tailwind CSS and icons via Lucide

## Coming Soon

🔄 **Split Expenses** - Divide bills among team members  
🎯 **Budget Goals** - Set spending limits with alerts  
📅 **Recurring Expenses** - Auto-track subscriptions  
🔍 **OCR Receipt Scanning** - Extract data from receipt images  
📊 **Advanced Analytics** - Deep insights into spending patterns

Tech Stack

Frontend: Next.js 13 (App Router), React, Tailwind CSS, Lucide Icons, Clerk for auth, Socket.io-client

Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, Multer, Stripe, Nodemailer

API Requests: Axios

Authentication: JWT via Clerk

Styling: Tailwind CSS

Real-time: Socket.io WebSocket

Payments: Stripe

Prerequisites

Node.js >= 18

npm or yarn

MongoDB instance (local or Atlas)

Clerk account for authentication (get publishable key)

Getting Started
1️⃣ Clone the repository
git clone https://github.com/vV29Raghav/fintrack.git
cd fintrack

2️⃣ Install dependencies
Frontend
cd frontend
npm install
# or
yarn

Backend
cd backend
npm install
# or
yarn

3️⃣ Configure environment variables

**📝 See [SETUP.md](SETUP.md) for detailed setup instructions including:**
- MongoDB configuration
- Clerk authentication setup
- Stripe payment integration
- Gmail email setup (optional)
- WebSocket configuration

Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXX

Backend (.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fintrack
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
STRIPE_SECRET_KEY=sk_test_XXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXX


Make sure to replace all placeholders with your own keys/URIs.

4️⃣ Start the backend server
cd backend
npm run dev


You should see:

Server running on port 5000
✅ MongoDB connected successfully
✅ Email service ready
🔌 WebSocket server ready


Test the backend API in browser or Postman:

http://localhost:5000/api/health

5️⃣ Start the frontend
cd frontend
npm run dev


Open your browser:

http://localhost:3000


You should see the landing page of FinTrack.
Usage

Sign up / Sign in via Clerk authentication.

Navigate to Dashboard:

View key expense stats with real-time updates

Check recent expenses with edit/delete buttons

Click "Add New Expense" to open smart modal with category suggestions

Use quick actions for adding expenses or generating reports

Inbox - Real-time Communication:

Approve/reject pending expenses

Send and receive payment requests

Live chat with team members via WebSocket

Reports - Advanced Analytics:

Create expenses with photo/receipt uploads

Filter by date range and sort by criteria

Download CSV reports for external analysis

View all expenses with attachment indicators

Workspace - Team Collaboration:

Create workspaces (based on subscription tier)

Invite team members via email

Manage team member roles and permissions

Account Settings:

View current subscription tier

Upgrade to Premium or Enterprise via Stripe

Manage payment methods securely

Features - Explore Innovations:

Discover unique features that set FinTrack apart

Preview coming soon features

Learn about smart categorization and more

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide with step-by-step instructions
- **[FEATURES.md](FEATURES.md)** - Detailed feature documentation and API reference
- **[README.md](README.md)** - This file

Common Issues

1. Axios Network Error

Ensure backend is running at the correct port (5000)

Check NEXT_PUBLIC_API_URL points to your backend

Verify CORS settings allow frontend origin

2. Hydration Warning (Next.js)

Suppress warnings on <html> in app/layout.jsx:

<html lang="en" suppressHydrationWarning>

3. WebSocket Connection Issues

Verify NEXT_PUBLIC_SOCKET_URL is set correctly

Ensure backend Socket.io server is running

Check browser console for connection errors

4. File Upload Errors

Verify file size is under 5MB

Check file type (JPEG, PNG, GIF, PDF only)

Ensure backend uploads/ directory exists

5. Stripe Payment Issues

Use test mode keys in development

Test with card: 4242 4242 4242 4242

Verify webhook endpoint is accessible

6. Email Not Sending

Configure Gmail App Password (not regular password)

Verify EMAIL_USER and EMAIL_PASSWORD in .env

Email is optional - invites will still generate links

Scripts
Frontend
npm run dev      # Start development server
npm run build    # Build production
npm run start    # Start production server

Backend
npm run dev      # Start dev server with nodemon
npm start        # Start production server

Contributing

Fork the repository

Create a new branch (git checkout -b feature/awesome-feature)

Commit your changes (git commit -m "Add feature")

Push to the branch (git push origin feature/awesome-feature)

Open a Pull Request

## 🙏 Acknowledgments

- Clerk for authentication
- Stripe for payments
- Socket.io for real-time features
- MongoDB for database
- Next.js and React for the framework
- Tailwind CSS for styling

## 📄 License

This project is licensed under the MIT License.

## 🚀 What Makes FinTrack Unique?

Unlike other expense tracking apps, FinTrack offers:

1. **Smart AI-like Categorization** - Automatic expense categorization using keyword matching
2. **Real-time Collaboration** - WebSocket-based chat and payment requests
3. **Receipt Management** - Easy photo uploads with each expense
4. **Advanced Filtering** - Powerful date range and sorting capabilities
5. **Subscription Flexibility** - Tiered plans with clear value propositions
6. **Developer-Friendly** - Clean code, well-documented APIs, extensible architecture

**Built with ❤️ for teams who value efficient expense management**

