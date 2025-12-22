# FinTrack - New Features Documentation

This document describes the new features added to FinTrack that set it apart from competitors.

## 🎯 Unique Features

### 1. Smart Expense Categorization
**What it does:** Automatically suggests expense categories based on the expense name and description using keyword matching.

**How to use:**
- When creating a new expense, start typing the expense name
- After typing 3+ characters, the system will analyze the text
- If a category suggestion is found, it will appear as a blue banner above the category dropdown
- Click "Use This" to apply the suggested category, or manually select a different one

**Example:**
- Typing "Starbucks coffee" → Suggests "Meals & Entertainment"
- Typing "Amazon AWS hosting" → Suggests "Software & Subscriptions"
- Typing "Uber to airport" → Suggests "Travel"

### 2. Real-Time Chat & Payment Requests
**What it does:** Enables team members to communicate and send payment requests in real-time using WebSocket technology.

**Features:**
- **Real-time messaging:** Send and receive messages instantly with team members
- **Payment requests:** Send payment requests to specific users with amount and description
- **Notifications:** Get notified when someone sends you a message or payment request
- **Status tracking:** Track payment request status (pending, approved, rejected, paid)

**How to use:**
1. Navigate to Inbox
2. Switch to the "Chat" tab for messaging or "Payment Requests" tab
3. For payment requests: Click "Send Payment Request", enter recipient ID, amount, and description
4. Recipients will see the request in real-time and can approve/reject it

### 3. Receipt/Photo Upload
**What it does:** Attach photos of receipts or documents to expenses for better record-keeping.

**Supported formats:**
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF
- Max file size: 5MB per file

**How to use:**
1. When creating an expense, use the "Upload Receipt/Photo" field
2. Select a file from your device
3. The file will be uploaded and associated with the expense
4. Uploaded files are indicated with a camera icon in expense lists

### 4. Advanced Filtering & Sorting
**What it does:** Filter expenses by date range and sort by multiple criteria for better analysis.

**Filtering options:**
- Start Date: Show expenses from this date onwards
- End Date: Show expenses until this date

**Sorting options:**
- Date (Newest First)
- Date (Oldest First)
- Amount (High to Low)
- Amount (Low to High)

**How to use:**
1. Go to Reports page
2. Use the "Filter & Sort Expenses" section
3. Select date range and/or sorting preference
4. Results update automatically
5. Click "Clear Filters" to reset

### 5. CSV Export
**What it does:** Download filtered expense data as CSV for use in Excel, Google Sheets, or other tools.

**How to use:**
1. Apply any filters/sorting you want
2. Click "Export CSV" or "Export Report (CSV)"
3. File downloads automatically with format: `expenses-report-YYYY-MM-DD.csv`

**CSV includes:**
- Name, Amount, Date, Category, Status, Description

### 6. Workspace Subscription Limits
**What it does:** Enforces workspace limits based on subscription tier to encourage upgrades.

**Limits by tier:**
- **Free:** 1 workspace
- **Premium:** 5 workspaces
- **Enterprise:** Unlimited workspaces

**How it works:**
- Users are prevented from creating workspaces beyond their limit
- Clear messaging explains the limit and upgrade options
- Workspace count is displayed in the header

### 7. Stripe Payment Integration
**What it does:** Secure payment processing for subscription upgrades using Stripe.

**Features:**
- Secure checkout flow
- Automatic subscription activation
- Webhook handling for payment events
- Subscription status tracking

**How to use:**
1. Go to Account page
2. View current subscription
3. Click "Upgrade" on desired plan
4. Complete Stripe checkout
5. Subscription activates automatically

## 🔧 Technical Implementation

### Backend Technologies
- **Socket.io:** Real-time WebSocket communication
- **Multer:** File upload handling
- **Stripe:** Payment processing
- **Nodemailer:** Email invitations

### Frontend Technologies
- **Socket.io-client:** WebSocket client
- **@stripe/stripe-js:** Stripe integration
- **React Hooks:** State management for real-time features

### Database Models
- **PaymentRequest:** Payment request tracking
- **RecurringExpense:** Recurring expense management (future)
- **SplitExpense:** Split expense tracking (future)
- **BudgetGoal:** Budget goal tracking (future)

## 🚀 Coming Soon

The following features are planned but not yet implemented:

1. **Split Expenses:** Divide expenses among team members
2. **Budget Goals:** Set and track budget targets with alerts
3. **Recurring Expenses:** Automatic tracking of recurring payments
4. **Advanced Analytics:** Deep insights into spending patterns
5. **OCR Receipt Scanning:** Extract data from receipt images

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fintrack
FRONTEND_URL=http://localhost:3000

# Email configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🐛 Known Issues

1. Email invitations require SMTP configuration
2. WebSocket connections may need reconnection handling for unstable networks
3. File uploads limited to 5MB (configurable in multer.js)

## 📚 API Endpoints

### New Endpoints

**POST /api/expenses/suggest-category**
- Suggests category based on expense name and description
- Body: `{ name: string, description?: string }`
- Returns: `{ success: boolean, suggestedCategory: string }`

**POST /api/expenses/:id/upload**
- Uploads receipt/photo for an expense
- Form-data with field: `receipt`
- Returns: `{ success: boolean, file: string, expense: object }`

**POST /api/payment-requests**
- Creates a new payment request
- Body: `{ senderId, senderName, recipientId, amount, description }`

**GET /api/payment-requests/user/:userId**
- Gets payment requests for a user
- Query: `?type=sent|received`

**PATCH /api/payment-requests/:id/status**
- Updates payment request status
- Body: `{ status: 'approved'|'rejected'|'paid' }`

**POST /api/stripe/create-checkout-session**
- Creates Stripe checkout session
- Body: `{ userId, plan: 'premium'|'enterprise', successUrl, cancelUrl }`

**POST /api/workspaces/invite**
- Sends workspace invitation email
- Body: `{ email, workspaceName, workspaceId, role, invitedBy }`

## 🎨 UI Components

### AddExpenseModal
- Modal dialog for creating expenses
- Smart category suggestions
- File upload support
- Real-time validation

### Inbox Tabs
- Pending Expenses
- Payment Requests
- Chat

### Features Page
- Showcases unique features
- Interactive feature explorer
- Coming soon badges

## 🔐 Security

- File uploads validated by type and size
- Stripe webhooks verified with signatures
- WebSocket connections authenticated
- API routes protected with JWT tokens

## 💡 Tips for Users

1. **Use smart categorization:** Let the system suggest categories to save time
2. **Upload receipts:** Keep digital records of all expenses
3. **Set date filters:** Analyze expenses for specific periods
4. **Export regularly:** Download CSV backups of expense data
5. **Use payment requests:** Streamline team expense reimbursements
