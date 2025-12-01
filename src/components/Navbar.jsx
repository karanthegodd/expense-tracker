import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, logout, getCurrentUser } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      const user = await getCurrentUser();
      setAuthenticated(auth);
      setCurrentUser(user);
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setCurrentUser(null);
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const navLinkClass = (path) => {
    const base = 'px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 relative group mx-1.5';
    if (isActive(path)) {
      return `${base} bg-white/20 text-white shadow-lg backdrop-blur-sm`;
    }
    return `${base} text-white/80 hover:text-white hover:bg-white/10`;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const navLinks = authenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', color: 'orange' },
    { path: '/income', label: 'Income', icon: '💰', color: 'green-400' },
    { path: '/expenses', label: 'Expenses', icon: '💸', color: 'red-400' },
    { path: '/budgets', label: 'Financial Planning', icon: '💰', color: 'light-blue' },
    { path: '/comparison', label: 'Comparison', icon: '📊', color: 'blue-400' },
    { path: '/upcoming-expenses', label: 'Upcoming', icon: '📅', color: 'purple-400' },
    { path: '/recurring-payments', label: 'Recurring', icon: '🔄', color: 'pink-400' },
    { path: '/settings', label: 'Settings', icon: '⚙️', color: 'gray-400' },
  ] : [
    { path: '/login', label: 'Login', icon: '🔐', color: 'blue-400' },
  ];

  return (
    <>
      <nav className="glass-card sticky top-0 z-50 mb-6 mx-2 sm:mx-4 mt-2 sm:mt-4 shadow-xl backdrop-blur-xl" style={{ position: 'relative', zIndex: 100 }}>
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-lg sm:text-xl md:text-2xl font-bold text-white hover:scale-105 transition-transform duration-300 active:scale-95 -ml-2 sm:-ml-3 md:-ml-4">
              <span className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">📊</span>
                <span className="hidden sm:inline">Ontario Tech <span className="text-orange">ExpenseTrack</span></span>
                <span className="sm:hidden">ExpenseTrack</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
              {authenticated ? (
                <>
                  {navLinks.slice(0, -1).map((link) => (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={navLinkClass(link.path)}
                    >
                      <span className="text-sm xl:text-base">{link.icon}</span>
                      <span className="text-sm xl:text-base">{link.label}</span>
                      {isActive(link.path) && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange to-orange-600 rounded-full"></span>
                      )}
                    </Link>
                  ))}
                  {currentUser && (
                    <div className="flex items-center space-x-3 ml-8 pl-8 border-l border-white/20">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {getInitials(currentUser.email)}
                      </div>
                      <span className="text-white/80 text-sm">{currentUser.email}</span>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn-gradient ml-6"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={navLinkClass('/login')}>
                    <span>🔐</span>
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="btn-gradient">
                    ✨ Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] glass-card z-[9998] transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Menu</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white/60 hover:text-white text-3xl leading-none transition-colors"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          {authenticated && currentUser && (
            <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center text-white font-bold shadow-lg text-lg">
                  {getInitials(currentUser.email)}
                </div>
                <div>
                  <p className="text-white font-semibold">User</p>
                  <p className="text-white/80 text-sm">{currentUser.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {authenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full btn-gradient mt-4"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive('/login')
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-xl">🔐</span>
                    <span className="font-medium">Login</span>
                  </span>
                </Link>
                <Link
                  to="/signup"
                  className="block w-full btn-gradient text-center mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✨ Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;

