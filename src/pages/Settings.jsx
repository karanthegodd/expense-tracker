import { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/auth';
import Card from '../components/Card';
import Button from '../components/Button';
import { useToast } from '../components/ToastContainer';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setEmail(user?.email || '');
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Note: Supabase requires email confirmation for email changes
    // This would need to be done through Supabase Auth API
    setError('Email changes require email confirmation. Please contact support or use the Supabase dashboard to update your email.');
    showToast('Email changes require confirmation. Please use Supabase dashboard.', 'info');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 fade-in">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-white/80 text-lg">Manage your account preferences</p>
      </div>

      {loading ? (
        <Card className="max-w-2xl slide-up">
          <div className="text-center py-8 text-white/60">Loading...</div>
        </Card>
      ) : (
      <Card className="max-w-2xl slide-up">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">⚙️</span> Account Settings
          </h2>

        {message && (
          <div className="bg-green-500/20 backdrop-blur-sm border-2 border-green-400/50 text-green-200 px-4 py-3 rounded-xl mb-6 flex items-center space-x-3 shadow-lg">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="flex-1 font-medium">{message || 'Email updated successfully!'}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center space-x-3 shadow-lg">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleUpdateEmail} className="space-y-6">
          <div>
              <label className="block text-white/90 font-semibold mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-glass w-full pl-10"
                  placeholder="Enter your email"
                />
              </div>
          </div>

          <Button type="submit" variant="primary" className="shadow-md">
            💾 Update Email
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t-2 border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">ℹ️</span> About
          </h3>
          <div className="space-y-3 text-white/80">
            <p>
              <strong className="text-white">Ontario Tech ExpenseTrack</strong> is a full-stack expense tracking application.
            </p>
            <p>
              Your data is securely stored in Supabase database with Row Level Security for maximum privacy and security.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-sm font-semibold text-white/60">Version:</span>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-mono text-white">1.0.0</span>
            </div>
          </div>
        </div>
      </Card>
      )}
    </div>
  );
};

export default Settings;

