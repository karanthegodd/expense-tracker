import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import Button from '../components/Button';

const Homepage = () => {
  const authenticated = isAuthenticated();

  return (
    <div className="container mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 10 }}>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block mb-4 px-3 py-1.5 bg-gradient-to-r from-orange/10 to-light-blue/10 rounded-full border border-orange/20">
          <span className="text-orange font-semibold text-sm">✨ Your Financial Companion</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Welcome to <span className="text-orange-300">Ontario Tech</span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">ExpenseTrack</h2>
        <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
          Take control of your finances with our intuitive expense tracking system.
          Track income, manage expenses, set budgets, and visualize your financial health.
        </p>
        {!authenticated && (
          <div className="flex justify-center space-x-4 flex-wrap gap-4">
            <Link to="/signup">
              <Button variant="primary" className="text-lg px-10 py-4 text-lg">
                🚀 Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="text-lg px-10 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        )}
        {authenticated && (
          <Link to="/dashboard">
            <Button variant="primary" className="text-lg px-10 py-4 text-lg">
              📊 Go to Dashboard
            </Button>
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="glass-card p-6 text-center hover:-translate-y-2 transition-all duration-300 group">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Track Income</h3>
          <p className="text-white/80 leading-relaxed">
            Record all your income sources and keep track of your earnings over time with beautiful visualizations.
          </p>
        </div>

        <div className="glass-card p-6 text-center hover:-translate-y-2 transition-all duration-300 group">
          <div className="w-16 h-16 bg-gradient-to-br from-orange to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <span className="text-2xl">💸</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Manage Expenses</h3>
          <p className="text-white/80 leading-relaxed">
            Categorize and track all your expenses to understand where your money goes with smart insights.
          </p>
        </div>

        <div className="glass-card p-6 text-center hover:-translate-y-2 transition-all duration-300 group">
          <div className="w-16 h-16 bg-gradient-to-br from-light-blue to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <span className="text-2xl">📈</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Set Budgets</h3>
          <p className="text-white/80 leading-relaxed">
            Create budgets for different categories and stay within your financial limits with real-time alerts.
          </p>
        </div>
      </div>

      {/* Trusted by Ontario Tech Students Section */}
      <div className="mt-12 mb-10 text-center">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-6">
          Trusted by Ontario Tech Students
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
          <div className="text-white/40 text-2xl font-bold">Ontario Tech</div>
          <div className="text-white/40 text-xl font-semibold">Software Engineering</div>
          <div className="text-white/40 text-xl font-semibold">Business & IT</div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-12 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
            What Ontario Tech Students Are Saying
          </h2>
          <p className="text-base text-white/80 max-w-2xl mx-auto">
            Join thousands of students who are taking control of their finances
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Testimonial 1 - Karan Kalra */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-base">
              "This app completely changed how I manage my budget at Ontario Tech. I've saved over $500 in just three months by tracking my campus spending!"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 shadow-md ring-2 ring-gray-200 relative">
                <img 
                  src="/images/karan-kalra.png" 
                  alt="Karan Kalra"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg" style={{ display: 'none' }}>
                  KK
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900">Karan Kalra</p>
                <p className="text-sm text-gray-600">Software Engineering, Ontario Tech</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 - Wali Ahmad */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-base">
              "The monthly summaries help me understand where my student loan money goes. Perfect for managing expenses while studying at Ontario Tech."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 shadow-md ring-2 ring-gray-200 relative">
                <img 
                  src="/images/wali-ahmad.png" 
                  alt="Wali Ahmad"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg" style={{ display: 'none' }}>
                  WA
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900">Wali Ahmad</p>
                <p className="text-sm text-gray-600">Software Engineering, Ontario Tech</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 - Vandan Petal */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed text-base">
              "Between labs and lectures, I needed something fast. ExpenseTrack takes seconds to use and helps me stay on budget during the semester."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0 shadow-md ring-2 ring-gray-200 relative">
                <img 
                  src="/images/vandan-patel.png" 
                  alt="Vandan Patel"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg" style={{ display: 'none' }}>
                  VP
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900">Vandan Patel</p>
                <p className="text-sm text-gray-600">Software Engineering, Ontario Tech</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dark Blue CTA Section */}
      <div className="mt-20 mb-20 bg-gradient-to-r from-[#002145] to-[#00356B] rounded-2xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Start Managing Your Finances at Ontario Tech
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of students taking control of their financial future
          </p>
          <Link to="/signup">
            <Button variant="primary" className="text-lg px-12 py-4 bg-white text-[#002145] hover:bg-gray-100 shadow-2xl font-bold">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="mt-32 pt-16 pb-8 border-t border-white/10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-[#002145] font-bold text-xl">OT</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Ontario Tech</h3>
                <p className="text-white/80 text-sm">ExpenseTrack</p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6 leading-relaxed max-w-md">
              Empowering Ontario Tech students to take control of their finances with smart expense tracking and budgeting tools.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white/60 hover:bg-white/10 transition-all">
                <span className="text-sm font-bold">f</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white/60 hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white/60 hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center text-white hover:border-white/60 hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* For Students Column */}
          <div>
            <h4 className="text-white font-bold mb-4">For Students</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Future Students</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Current Students</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Campus Services</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Financial Aid</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">FAQ</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Tutorials</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Security</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 pt-8 border-t border-white/10">
          <div className="lg:col-span-3"></div>
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-2">Stay Updated</h4>
            <p className="text-white/70 text-sm mb-4">Get tips and updates for Ontario Tech students.</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors"
              />
              <Button variant="primary" type="submit" className="px-6 py-2">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2025 Ontario Tech University ExpenseTrack. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-white/40">|</span>
            <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a>
            <span className="text-white/40">|</span>
            <a href="#" className="text-white/60 hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;

