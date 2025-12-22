FinTrack

FinTrack is a modern fintech dashboard and expense tracking application built with Next.js, Tailwind CSS, Clerk for authentication, and a Node.js/Express backend with MongoDB. Users can track expenses, generate reports, manage approvals, and collaborate with a team.

Features

User authentication and management via Clerk

Dashboard with key statistics:

Total expenses

Monthly expenses

Pending approvals

Average daily spend

Recent expenses list

Quick actions:

Add new expense

Generate reports

Invite team members

Responsive design with a mobile-friendly sidebar

Secure API calls using JWT tokens

Modern UI with Tailwind CSS and icons via Lucide

Tech Stack

Frontend: Next.js 13 (App Router), React, Tailwind CSS, Lucide Icons, Clerk for auth

Backend: Node.js, Express, MongoDB (Mongoose)

API Requests: Axios

Authentication: JWT via Clerk

Styling: Tailwind CSS

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
Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

Backend (.env)
PORT=5001
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your_jwt_secret


Make sure to replace all placeholders with your own keys/URIs.

4️⃣ Start the backend server
cd backend
npm run dev


You should see:

Server running on port 5001
Connected to MongoDB


Test the backend API in browser or Postman:

http://localhost:5001/api/expenses/stats

5️⃣ Start the frontend
cd frontend
npm run dev


Open your browser:

http://localhost:3000


You should see the landing page of FinTrack.
Usage

Sign up / Sign in via Clerk authentication.

Navigate to Dashboard:

View key expense stats

Check recent expenses

Use quick actions for adding expenses or generating reports

Team Collaboration:

Invite team members via workspace

Track approvals and shared expenses

Common Issues

1. Axios Network Error

Ensure backend is running at the correct port (5001)

Check NEXT_PUBLIC_API_URL points to your backend

2. Hydration Warning (Next.js)

Suppress warnings on <html> in app/layout.jsx:

<html lang="en" suppressHydrationWarning>



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

