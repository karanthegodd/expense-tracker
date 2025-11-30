# Ontario Tech ExpenseTrack

A fully functional expense tracking application built with React, Vite, and TailwindCSS. All data is stored locally in the browser using localStorage - no backend required!

## Features

- ✅ **User Authentication** - Sign up and login with localStorage
- ✅ **Income Management** - Add, edit, and delete income entries
- ✅ **Expense Management** - Track expenses by category
- ✅ **Budget Management** - Set budgets per category with spending tracking
- ✅ **Dashboard** - Visual charts and financial overview
- ✅ **Settings** - Update your email address
- ✅ **100% Client-Side** - No backend, no server, runs entirely in the browser

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **LocalStorage** - Data persistence

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
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

## Color Scheme

- **Navy**: `#002145`
- **Orange**: `#FF6A00`
- **Light Blue**: `#00AEEF`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.jsx
│   ├── Button.jsx
│   └── Card.jsx
├── pages/           # Page components
│   ├── Homepage.jsx
│   ├── Signup.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Income.jsx
│   ├── Expenses.jsx
│   ├── Budgets.jsx
│   └── Settings.jsx
├── utils/           # Utility functions
│   ├── auth.js      # Authentication helpers
│   └── localStorage.js  # Data management
├── App.jsx          # Main app component with routing
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## LocalStorage Keys

- `users` - Array of all registered users
- `user` - Current logged-in user
- `isLoggedIn` - Login state flag
- `user_income` - Income entries
- `user_expenses` - Expense entries
- `user_budgets` - Budget entries

## Deployment

This app can be easily deployed to:
- **Netlify** - Drag and drop the `dist` folder after building
- **Vercel** - Connect your Git repository
- **GitHub Pages** - Static hosting
- Any static hosting service

## Notes

- All data is stored in browser localStorage
- Data persists across browser sessions
- No backend or database required
- Password is stored in plain text (for simplicity - hash in production)

## License

MIT

