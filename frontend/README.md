# FinTrack Frontend

Next.js 14 frontend application for FinTrack expense management system.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Clerk Authentication
- Axios for API calls
- Lucide React for icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Clerk keys and API URL
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `MONGODB_URI` - MongoDB connection string

## Features

### Landing Page
- Single unified "Manage Your Expenses" card
- Clerk authentication integration
- Company values and benefits showcase

### Dashboard
- Real-time expense statistics from backend
- Recent expenses list
- Quick action buttons

### Reports
- Create new expenses with full form
- Category selection
- Real-time submission to backend API

### Inbox
- View pending expenses
- Approve/reject functionality
- Real-time updates

### Workspace
- Invite members via email
- Team management
- Role-based access

### Account
- Subscription management
- Profile information
- Sign out functionality

## API Integration

The frontend connects to the Express backend at `http://localhost:5000/api` (configurable via environment variable).

All API calls use axios and include proper error handling.

## Building for Production

```bash
npm run build
npm start
```
