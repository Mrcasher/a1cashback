import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    navigate('/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A1</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">A1</span>
              <span className="text-xl font-bold text-blue-600">Cashback</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Log in to your account to start earning cashback</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-700">
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed437c77d?w=800"
            alt="Shopping"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Start Earning Cashback Today</h2>
            <p className="text-xl text-blue-100 mb-8">
              Shop at 1,500+ stores and earn up to 40% cashback on every purchase.
            </p>
            <div className="flex items-center justify-center gap-8">
              <div>
                <p className="text-3xl font-bold">$50M+</p>
                <p className="text-blue-200">Paid to Members</p>
              </div>
              <div className="w-px h-12 bg-blue-500"></div>
              <div>
                <p className="text-3xl font-bold">2M+</p>
                <p className="text-blue-200">Happy Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    const result = await signup(email, password, fullName);
    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }
    navigate('/dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b93d?w=800"
            alt="Shopping"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center max-w-lg">
            <h2 className="text-4xl font-bold mb-6">Join 2 Million+ Savvy Shoppers</h2>
            <p className="text-xl text-blue-100 mb-8">
              Earn cashback on every purchase at over 1,500 stores.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Check className="w-8 h-8 mb-3 mx-auto text-green-400" />
                <p className="font-semibold">100% Free</p>
                <p className="text-sm text-blue-200">No fees ever</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Check className="w-8 h-8 mb-3 mx-auto text-green-400" />
                <p className="font-semibold">$10 Bonus</p>
                <p className="text-sm text-blue-200">Just for signing up</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Check className="w-8 h-8 mb-3 mx-auto text-green-400" />
                <p className="font-semibold">Fast Payouts</p>
                <p className="text-sm text-blue-200">Within 45 days</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <Check className="w-8 h-8 mb-3 mx-auto text-green-400" />
                <p className="font-semibold">1,500+ Stores</p>
                <p className="text-sm text-blue-200">To choose from</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md mx-auto w-full">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">A1</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">A1</span>
              <span className="text-xl font-bold text-blue-600">Cashback</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Start earning cashback on every purchase</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 mt-1"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ReferralPage() {
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = user
    ? `https://a1cashback.com/join?ref=${user.referralCode}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Log in to get your referral link</h1>
          <p className="text-gray-500 mb-8">Share your unique link and earn $25 for every friend who joins.</p>
          <Link to="/login" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 lg:p-12 text-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 3v1.5c0 .28.22.5.5.5h2zm-7 4C3.5 10 2 8.5 2 6.5S3.5 3 5.5 3h2a2 2 0 110 4h-2a.5.5 0 00-.5.5c0 .28.22.5.5.5h2a2 2 0 110 4h-2a.5.5 0 00-.5.5c0 .28.22.5.5.5h2a2 2 0 110 4h-2C3.5 17 2 15.5 2 13.5S3.5 10 5.5 10z" />
              </svg>
            </div>
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
              EARN $25 PER FRIEND
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Refer Friends, Earn Cash</h1>
          <p className="text-xl text-blue-100 mb-8">
            Share your unique link and earn $25 for every friend who signs up and makes their first purchase.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
            <p className="text-sm text-blue-200 mb-2">Your Referral Link</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white rounded-lg px-4 py-3 text-gray-900 font-mono text-sm truncate">
                {referralLink}
              </div>
              <button
                onClick={handleCopy}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-white text-blue-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
            <div>
              <p className="text-sm text-blue-200">Your Code</p>
              <p className="text-2xl font-bold">{user?.referralCode}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(user?.referralCode || '')}
              className="px-4 py-2 bg-white text-blue-700 font-medium rounded-lg"
            >
              Copy Code
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-500">Send your unique referral link to friends via email, social media, or text.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Friend Signs Up</h3>
              <p className="text-sm text-gray-500">Your friend creates a free account using your referral link.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">$</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Both Earn $25</h3>
              <p className="text-sm text-gray-500">After they make their first purchase, you both receive $25 bonus!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (supaError) {
      setError(supaError.message);
    } else {
      setSent(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-500">Enter your email and we will send you a reset link.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-500 mb-4">We sent a password reset link to {email}.</p>
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="you@example.com" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 text-sm">
                  Remember your password? Log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
