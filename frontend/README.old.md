# FinTrack - Expense Tracker Application

A comprehensive expense management system built with Next.js, Express, MongoDB, and Clerk authentication.

## Features

### Landing Page
- **Hero Section**: Company benefits and signup options for different user types (Personal/Business)
- **Navbar**: Company logo and login button with Clerk authentication
- **Values Section**: Company mission, values, and statistics
- **Benefits Section**: Feature cards showcasing expense management, travel, invoices, reimbursements, and more
- **Footer**: Complete footer with links and contact information

### Dashboard
- **Main Dashboard**: Overview of expenses with statistics and recent activity
- **Inbox**: Manage pending expenses and messages/notes
- **Reports**: Create new expenses and generate detailed reports
- **Workspace**: Create workspaces, invite team members, and manage collaboration
- **Account**: View subscription details, payment gateway, and account settings

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Icons**: Lucide React
- **Backend**: Express.js (existing backend can be integrated)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Clerk account for authentication

### Installation

1. Navigate to the fintrack directory:
```bash
cd fintrack
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the fintrack directory with the following:

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/fintrack

# App Configuration
NEXT_PUBLIC_APP_NAME=FinTrack
```

4. Get your Clerk keys:
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your Publishable Key and Secret Key
   - Update the `.env.local` file with your keys

5. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
fintrack/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── inbox/         # Inbox page
│   │   ├── reports/       # Reports page
│   │   ├── workspace/     # Workspace page
│   │   ├── account/       # Account page
│   │   ├── layout.tsx     # Dashboard layout
│   │   └── page.tsx       # Main dashboard
│   ├── sign-in/           # Sign-in page
│   ├── sign-up/           # Sign-up page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── dashboard/         # Dashboard components
│   │   └── Sidebar.tsx
│   └── landing/           # Landing page components
│       ├── Navbar.tsx
│       ├── HeroSection.tsx
│       ├── ValuesSection.tsx
│       ├── BenefitsSection.tsx
│       └── Footer.tsx
├── lib/
│   ├── db/               # Database configuration
│   │   └── mongodb.ts
│   └── models/           # Mongoose models
│       ├── User.ts
│       ├── Expense.ts
│       ├── Workspace.ts
│       └── Message.ts
└── middleware.ts         # Clerk middleware

```

## Features in Detail

### User Types
- **Personal Expense**: For individual users managing their own expenses
- **Business Expense**: For businesses managing employee expenses

### Inbox Component
- View pending expense requests
- Personal notes and messages
- Approve/reject expenses
- Real-time notifications

### Reports Component
- Create new expenses with detailed information
- Generate monthly and custom date range reports
- Category-wise expense analysis
- Export reports

### Workspace Component
- Create multiple workspaces
- Invite team members with different roles (Admin/Member/Viewer)
- Manage workspace settings
- Track workspace-specific expenses

### Account Dashboard
- View subscription plan details
- Manage payment methods
- Track subscription days remaining
- Upgrade/downgrade plans
- Sign out functionality

## Styling

The application uses Tailwind CSS with a modern, gradient-based design system:
- Blue to Purple gradients for primary actions
- Responsive design for all screen sizes
- Accessible color contrasts
- Smooth transitions and hover effects
- User-friendly interface for non-technical users

## Database Models

### User
- Clerk ID integration
- User type (personal/business)
- Workspace associations
- Subscription information

### Expense
- Name, amount, date, category
- Status (pending/approved/rejected)
- Workspace association
- Attachments support

### Workspace
- Name and description
- Owner and members with roles
- Timestamps

### Message
- Sender and recipient
- Message type (expense_request/note/notification)
- Related expense association
- Read status

## Building for Production

```bash
npm run build
npm start
```

## Contributing

This is a comprehensive expense tracking system designed to be user-friendly for both technical and non-technical users.

## License

This project is part of the Expense Tracker BEE repository.

