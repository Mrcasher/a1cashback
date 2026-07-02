import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Heart,
  Clock,
  Gift,
  Settings,
  LogOut,
  User,
  ChevronRight,
  TrendingUp,
  DollarSign,
  CreditCard,
  Store,
  ExternalLink,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StoreCard } from '../components/StoreCard';
import { useTransactions, usePayouts, useClicks, useFavorites } from '../hooks/useUserData';

type DashboardTab = 'overview' | 'earnings' | 'favorites' | 'clicks' | 'payouts' | 'settings';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: DashboardTab;
}

function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  const navItems: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'clicks', label: 'Visit History', icon: Clock },
    { id: 'payouts', label: 'Payouts', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-[104px] lg:top-[140px] bottom-0 w-64 bg-white border-r border-gray-100 z-30 hidden lg:block">
        <div className="p-6 h-full flex flex-col">
          <div className="flex-1">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl || 'https://via.placeholder.com/48'}
                  alt={user?.fullName || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/dashboard${item.id === 'overview' ? '' : `/${item.id}`}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed top-[104px] left-0 right-0 bg-white border-b border-gray-100 z-20">
        <div className="overflow-x-auto">
          <nav className="flex">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={`/dashboard${item.id === 'overview' ? '' : `/${item.id}`}`}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-medium ${
                  activeTab === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="lg:ml-64 pt-4 lg:pt-0">
        <div className="p-4 lg:p-8 mt-12 lg:mt-0">{children}</div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    paid: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    converted: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();

  const activeTab: DashboardTab = location.pathname.includes('/earnings')
    ? 'earnings'
    : location.pathname.includes('/favorites')
    ? 'favorites'
    : location.pathname.includes('/clicks')
    ? 'clicks'
    : location.pathname.includes('/payouts')
    ? 'payouts'
    : location.pathname.includes('/settings')
    ? 'settings'
    : 'overview';

  const { transactions, loading: txLoading } = useTransactions();
  const { payouts, loading: poLoading, requestPayout } = usePayouts();
  const { clicks, loading: clLoading } = useClicks();
  const { favorites, loading: favLoading } = useFavorites();

  const stats = {
    totalEarned: user?.totalEarned || 0,
    availableBalance: user?.cashbackBalance || 0,
    pendingCashback: transactions
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + t.cashbackAmount, 0),
    totalTransactions: transactions.length,
    confirmedThisMonth: transactions
      .filter((t) => t.status === 'confirmed')
      .reduce((sum, t) => sum + t.cashbackAmount, 0),
  };

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');
  const confirmedTransactions = transactions.filter((t) => t.status !== 'pending');

  const handleRequestPayout = async () => {
    if (stats.availableBalance < 10) return;
    await requestPayout(stats.availableBalance, 'paypal');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'earnings':
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings History</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalEarned.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Available</p>
                <p className="text-3xl font-bold text-green-600">${stats.availableBalance.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">${stats.pendingCashback.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">All Transactions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {txLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center gap-4">
                      <img src={tx.store.logoUrl} alt={tx.store.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{tx.store.name}</p>
                        <p className="text-sm text-gray-500">Order: {tx.orderId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">+${tx.cashbackAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{tx.cashbackRate}% cashback</p>
                      </div>
                      <StatusBadge status={tx.status} />
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No transactions yet. Start shopping to earn cashback!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Favorite Stores</h1>
            {favLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">Save stores to quickly find them here.</p>
                <Link to="/stores" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl">
                  Browse Stores
                </Link>
              </div>
            )}
          </div>
        );

      case 'clicks':
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Visit History</h1>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Clicks</h3>
                <p className="text-sm text-gray-500">These show your recent store visits tracked for cashback.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {clLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : clicks.length > 0 ? (
                  clicks.map((click) => (
                    <div key={click.id} className="p-4 flex items-center gap-4">
                      <img src={click.store.logoUrl} alt={click.store.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{click.store.name}</p>
                        <p className="text-sm text-gray-500">Visited {new Date(click.clickedAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={click.status} />
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No clicks yet. Visit a store to start tracking!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'payouts':
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Payouts</h1>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Available Balance</p>
                  <p className="text-4xl font-bold">${stats.availableBalance.toFixed(2)}</p>
                </div>
                <button
                  onClick={handleRequestPayout}
                  disabled={stats.availableBalance < 10}
                  className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Payout
                </button>
              </div>
              {stats.availableBalance < 10 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-100">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Minimum payout is $10</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Payout History</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {poLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : payouts.length > 0 ? (
                  payouts.map((payout) => (
                    <div key={payout.id} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">${payout.amount.toFixed(2)} payout</p>
                        <p className="text-sm text-gray-500">
                          Requested {new Date(payout.requestedAt).toLocaleDateString()} • {payout.method}
                        </p>
                      </div>
                      <StatusBadge status={payout.status} />
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No payouts yet. Earn at least $10 to request your first payout!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
            <div className="max-w-2xl">
              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                    <input type="text" defaultValue={user?.fullName} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                    <input type="email" defaultValue={user?.email} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none" readOnly />
                  </div>
                  <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl">Save Changes</button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payout Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">PayPal Email</label>
                    <input type="email" placeholder="your@paypal.com" className="w-full px-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Referral Code</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-mono text-lg">{user?.referralCode}</div>
                  <button className="px-4 py-3 bg-blue-600 text-white font-medium rounded-xl">Copy</button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Share your code and earn $25 for each friend who signs up!</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">${stats.availableBalance.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Pending Cashback</p>
                <p className="text-2xl font-bold text-yellow-600">${stats.pendingCashback.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-blue-600">${stats.totalEarned.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Refer a Friend & Earn $25</h3>
                  <p className="text-blue-100">Share your referral link and earn $25 for every friend who signs up and makes a purchase.</p>
                </div>
                <Link to="/referral" className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                  <Gift className="w-5 h-5" />
                  Get Your Link
                </Link>
              </div>
            </div>

            {pendingTransactions.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-8">
                <div className="p-4 bg-yellow-50 border-b border-gray-100">
                  <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Cashback
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center gap-4">
                      <img src={tx.store.logoUrl} alt={tx.store.name} className="w-10 h-10 object-contain rounded bg-gray-50 p-1" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tx.store.name}</p>
                        <p className="text-sm text-gray-500">${tx.amount.toFixed(2)} purchase</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">+${tx.cashbackAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">pending</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {confirmedTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center gap-4">
                    <img src={tx.store.logoUrl} alt={tx.store.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{tx.store.name}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.transactionDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+${tx.cashbackAmount.toFixed(2)}</p>
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>
                ))}
                {confirmedTransactions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No confirmed transactions yet.</div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 text-center">
                <Link to="/dashboard/earnings" className="text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center justify-center gap-1">
                  View All Transactions
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
