import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import FinancialPlanning from './pages/FinancialPlanning';
import UpcomingExpenses from './pages/UpcomingExpenses';
import RecurringPayments from './pages/RecurringPayments';
import Settings from './pages/Settings';
import { isAuthenticated } from './utils/auth';
import { ToastProvider } from './components/ToastContainer';

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setAuth(authenticated);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Debug: Check if App is rendering
  console.log('App component is rendering');
  
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen" style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
          <Navbar />
          <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/income"
            element={
              <PrivateRoute>
                <Income />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <Expenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <PrivateRoute>
                <FinancialPlanning />
              </PrivateRoute>
            }
          />
          <Route
            path="/savings-goals"
            element={
              <PrivateRoute>
                <FinancialPlanning />
              </PrivateRoute>
            }
          />
          <Route
            path="/financial-planning"
            element={
              <PrivateRoute>
                <FinancialPlanning />
              </PrivateRoute>
            }
          />
          <Route
            path="/upcoming-expenses"
            element={
              <PrivateRoute>
                <UpcomingExpenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring-payments"
            element={
              <PrivateRoute>
                <RecurringPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;

