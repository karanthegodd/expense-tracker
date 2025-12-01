# Ontario Tech ExpenseTrack

A fully functional expense tracking application built with React, Vite, TailwindCSS, and Supabase. Features secure user authentication and cloud-based data storage.

## 🌟 Features

* ✅ **User Authentication** - Secure sign up and login with Supabase Auth
* ✅ **Income Management** - Add, edit, and delete income entries
* ✅ **Expense Management** - Track expenses by category with detailed analytics
* ✅ **Budget Management** - Set budgets per category with real-time spending tracking
* ✅ **Savings Goals** - Create and track progress toward financial goals
* ✅ **Recurring Payments** - Automatically track recurring expenses
* ✅ **Upcoming Expenses** - Plan and forecast future expenses
* ✅ **Dashboard** - Visual charts and comprehensive financial overview
* ✅ **24/7 Session Management** - Automatic session refresh to keep you logged in
* ✅ **Cloud Storage** - All data securely stored in Supabase PostgreSQL database
* ✅ **Per-User Data** - Row-level security ensures data privacy

## 🛠 Tech Stack

* **React 18** - UI framework
* **Vite** - Build tool and dev server
* **React Router** - Navigation
* **TailwindCSS** - Styling
* **Recharts** - Data visualization
* **Supabase** - Backend-as-a-Service
  * PostgreSQL Database
  * Authentication
  * Row Level Security (RLS)

## 🚀 Getting Started

### Prerequisites

* Node.js 16+ and npm
* A Supabase account (free tier works great!)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/karanthegodd/expense-tracker.git
cd expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
   - Get your project URL and anon key from Settings > API

4. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview Production Build

Preview the production build:
```bash
npm run preview
```

## 🎨 Color Scheme

* **Navy**: `#002145`
* **Orange**: `#FF6A00`
* **Light Blue**: `#00AEEF`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Modal.jsx
│   ├── Toast.jsx
│   └── ToastContainer.jsx
├── pages/              # Page components
│   ├── Homepage.jsx
│   ├── Signup.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Income.jsx
│   ├── Expenses.jsx
│   ├── FinancialPlanning.jsx
│   ├── RecurringPayments.jsx
│   ├── UpcomingExpenses.jsx
│   └── Settings.jsx
├── utils/              # Utility functions
│   ├── auth.js         # Supabase authentication helpers
│   ├── supabase.js     # Supabase client configuration
│   ├── sessionKeepAlive.js  # 24/7 session management
│   └── localStorage.js # Database operations (Supabase-backed)
├── App.jsx             # Main app component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🔒 Security

* **Row Level Security (RLS)** - Users can only access their own data
* **Secure Authentication** - Supabase handles password hashing and session management
* **Environment Variables** - Sensitive keys stored securely
* **Automatic Session Refresh** - Keeps sessions active 24/7

## 📊 Database Schema

The app uses the following Supabase tables:
* `incomes` - Income entries
* `expenses` - Expense entries
* `budgets` - Budget categories and amounts
* `savings_goals` - Savings goals with progress tracking
* `upcoming_expenses` - Future expense planning
* `recurring_payments` - Recurring payment tracking

All tables include:
* `user_id` - Links data to authenticated users
* `created_at` - Timestamp tracking
* Row Level Security policies for data isolation

## 🌐 Deployment

This app is deployed on **Vercel** and can be easily deployed to:

* **Vercel** - Connect your Git repository (recommended)
* **Netlify** - Connect your Git repository
* **GitHub Pages** - Static hosting
* Any static hosting service

See `DEPLOY.md` for detailed deployment instructions.

**Important:** Don't forget to add your Supabase environment variables in your hosting platform's settings!

## 🔄 Session Management

The app includes a 24/7 session keep-alive service that:
* Automatically refreshes tokens every 30 minutes
* Refreshes tokens before expiration (5 minutes before)
* Refreshes when you return to the tab
* Keeps you logged in continuously

## 📝 Notes

* All data is stored securely in Supabase PostgreSQL database
* Data persists across devices when logged in with the same account
* Session tokens are automatically refreshed to prevent expiration
* The app uses Supabase's free tier which is perfect for personal use

## 🔗 Links

* **Live App**: [expense-tracker-one-zeta-71.vercel.app](https://expense-tracker-one-zeta-71.vercel.app)
* **GitHub Repository**: [github.com/karanthegodd/expense-tracker](https://github.com/karanthegodd/expense-tracker)

## 📄 License

MIT

## 👥 Contributors

* Karan Kalra - Initial development

---

Built with ❤️ using React, Vite, and Supabase

