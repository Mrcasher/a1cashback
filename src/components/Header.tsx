import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Wallet,
  Heart,
  Gift,
  LogOut,
  Menu as MenuIcon,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { categories } from '../data/mockData';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/stores?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A1</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">A1</span>
              <span className="text-xl font-bold text-blue-600">Cashback</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search 1,500+ stores for cashback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/stores"
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              All Stores
            </Link>
            <Link
              to="/deals"
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Hot Deals
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Categories
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user?.avatarUrl || 'https://via.placeholder.com/40'}
                    alt={user?.fullName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-100"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">
                      ${user?.cashbackBalance?.toFixed(2)}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Available Balance</span>
                        <span className="text-lg font-bold text-green-600">${user?.cashbackBalance?.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Earned</span>
                        <span className="text-sm font-semibold text-gray-900">${user?.totalEarned?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm font-medium">My Dashboard</span>
                      </Link>
                      <Link
                        to="/dashboard/earnings"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Wallet className="w-5 h-5" />
                        <span className="text-sm font-medium">Earnings</span>
                      </Link>
                      <Link
                        to="/dashboard/favorites"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">Favorite Stores</span>
                      </Link>
                      <Link
                        to="/referral"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Gift className="w-5 h-5" />
                        <span className="text-sm font-medium">Refer & Earn $25</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span className="text-sm font-medium">Admin Panel</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none"
                />
              </div>
            </form>
            <nav className="space-y-1">
              <Link
                to="/stores"
                className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                All Stores
              </Link>
              <Link
                to="/deals"
                className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Hot Deals
              </Link>
              <Link
                to="/categories"
                className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Categories
              </Link>
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2.5 border border-gray-200 rounded-lg font-medium text-gray-700"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      <div className="hidden lg:block bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap">
              <MenuIcon className="w-4 h-4" />
              <span className="font-medium">All Categories</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {categories.slice(2, 10).map((category) => (
              <Link
                key={category.id}
                to={`/stores?category=${category.slug}`}
                className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
