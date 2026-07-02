import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, Store, Tag, Users, DollarSign, BarChart3, Settings, LogOut,
  Search, Plus, Pencil, Trash2, X, Check, TrendingUp, ShoppingBag,
  MousePointerClick, Clock, Palette, Type, Globe, Image, Save, Heart,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useStores, useDeals, useCategories } from '../hooks/useStores';
import { Store as StoreType, Deal, Category } from '../types';

type AdminTab = 'overview' | 'stores' | 'deals' | 'users' | 'transactions' | 'payouts' | 'settings';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
}

const allCountries = ['US', 'CA', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP', 'AU', 'BR', 'IN', 'MX', 'SG'];

function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You need admin privileges to access this area.</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">Go Home</Link>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'deals', label: 'Deals', icon: Tag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'payouts', label: 'Payouts', icon: DollarSign },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white z-30 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5" /></div>
            <div><p className="font-bold text-white">Admin Panel</p><p className="text-xs text-slate-400">{user?.email}</p></div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.id} to={`/admin${item.id === 'overview' ? '' : `/${item.id}`}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /><span>Log Out</span>
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Settings className="w-4 h-4 text-white" /></div>
            <span className="font-bold text-white">Admin</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <nav className="flex px-2 pb-2">
            {navItems.map((item) => (
              <Link key={item.id} to={`/admin${item.id === 'overview' ? '' : `/${item.id}`}`}
                className={`flex items-center gap-2 px-3 py-2 whitespace-nowrap text-sm font-medium rounded-lg mx-1 ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <item.icon className="w-4 h-4" /><span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
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
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

// ─── Overview Tab ───
function OverviewTab() {
  const { stores, loading: sLoading } = useStores();
  const { deals, loading: dLoading } = useDeals();
  const [userCount, setUserCount] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    supabase.from('users').select('id', { count: 'exact', head: true }).then(({ count }) => setUserCount(count || 0));
    supabase.from('transactions').select('id', { count: 'exact', head: true }).then(({ count }) => setTxCount(count || 0));
    supabase.from('transactions').select('amount').then(({ data }) => {
      if (data) setTotalRevenue(data.reduce((s, r) => s + Number(r.amount || 0), 0));
    });
    supabase.from('payouts').select('id', { count: 'exact', head: true }).eq('status', 'pending').then(({ count }) => setPendingPayouts(count || 0));
    supabase.from('clicks').select('id', { count: 'exact', head: true }).then(({ count }) => setClickCount(count || 0));
  }, []);

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Stores', value: stores.length, icon: Store, color: 'bg-green-100 text-green-600' },
    { label: 'Active Deals', value: deals.length, icon: Tag, color: 'bg-purple-100 text-purple-600' },
    { label: 'Transactions', value: txCount, icon: ShoppingBag, color: 'bg-orange-100 text-orange-600' },
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Pending Payouts', value: pendingPayouts, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Total Clicks', value: clickCount, icon: MousePointerClick, color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stores Tab ───
function StoresTab() {
  const { stores, loading, refetch } = useStores();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);

  const [formData, setFormData] = useState<Partial<StoreType>>({ name: '', slug: '', description: '', websiteUrl: '', cashbackRate: 0, cashbackType: 'percent', cashbackDetails: '', isFeatured: false, averageResponseTime: '', countries: ['US'], category: undefined, logoUrl: '' });

  const filtered = useMemo(() => {
    if (!searchQuery) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }, [searchQuery, stores]);

  const openAdd = () => {
    setEditingStore(null);
    setFormData({ name: '', slug: '', description: '', websiteUrl: '', cashbackRate: 0, cashbackType: 'percent', cashbackDetails: '', isFeatured: false, averageResponseTime: '', countries: ['US'], category: undefined, logoUrl: '' });
    setShowModal(true);
  };

  const openEdit = (store: StoreType) => { setEditingStore(store); setFormData({ ...store }); setShowModal(true); };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || '',
      website_url: formData.websiteUrl || '',
      logo_url: formData.logoUrl || '',
      cashback_rate: formData.cashbackRate || 0,
      cashback_type: formData.cashbackType || 'percent',
      cashback_details: formData.cashbackDetails || '',
      is_featured: formData.isFeatured || false,
      average_response_time: formData.averageResponseTime || '',
      countries: formData.countries || ['US'],
      category_id: formData.category?.id || null,
    };
    if (editingStore) {
      await supabase.from('stores').update(payload).eq('id', editingStore.id);
    } else {
      await supabase.from('stores').insert(payload);
    }
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this store?')) { await supabase.from('stores').delete().eq('id', id); refetch(); }
  };

  const toggleCountry = (country: string) => {
    const current = formData.countries || [];
    setFormData({ ...formData, countries: current.includes(country) ? current.filter((c) => c !== country) : [...current, country] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" />Add Store</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search stores..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left font-medium">Store</th><th className="px-4 py-3 text-left font-medium">Category</th><th className="px-4 py-3 text-left font-medium">Cashback</th><th className="px-4 py-3 text-left font-medium">Featured</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr> :
                filtered.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={store.logoUrl} alt="" className="w-8 h-8 object-contain rounded bg-gray-50" /><span className="font-medium text-gray-900">{store.name}</span></div></td>
                    <td className="px-4 py-3 text-gray-500">{store.category?.name}</td>
                    <td className="px-4 py-3"><span className="font-semibold text-green-600">{store.cashbackType === 'percent' ? `${store.cashbackRate}%` : `$${store.cashbackRate}`}</span></td>
                    <td className="px-4 py-3">{store.isFeatured ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEdit(store)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(store.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingStore ? 'Edit Store' : 'Add Store'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Name</label><input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Slug</label><input value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Description</label><textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Website URL</label><input value={formData.websiteUrl || ''} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Logo URL</label><input value={formData.logoUrl || ''} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Cashback Rate</label><input type="number" value={formData.cashbackRate || 0} onChange={(e) => setFormData({ ...formData, cashbackRate: parseFloat(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Type</label><select value={formData.cashbackType} onChange={(e) => setFormData({ ...formData, cashbackType: e.target.value as 'percent' | 'fixed' })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Response Time</label><input value={formData.averageResponseTime || ''} onChange={(e) => setFormData({ ...formData, averageResponseTime: e.target.value })} placeholder="e.g. 3-5 days" className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Cashback Details</label><input value={formData.cashbackDetails || ''} onChange={(e) => setFormData({ ...formData, cashbackDetails: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.filter((c) => c.slug !== 'all').map((cat) => (
                    <button key={cat.id} onClick={() => setFormData({ ...formData, category: cat })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.category?.id === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Countries</label>
                <div className="flex flex-wrap gap-2">
                  {allCountries.map((country) => (
                    <button key={country} onClick={() => toggleCountry(country)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(formData.countries || []).includes(country) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{country}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={formData.isFeatured || false} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Store</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4" />Save Store</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Deals Tab ───
function DealsTab() {
  const { deals, loading, refetch } = useDeals();
  const { stores } = useStores();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [formData, setFormData] = useState<Partial<Deal>>({ title: '', description: '', dealType: 'coupon', discountValue: '', discountType: 'percent', code: '', affiliateUrl: '', isExclusive: false, isVerified: true });

  const filtered = useMemo(() => {
    if (!searchQuery) return deals;
    const q = searchQuery.toLowerCase();
    return deals.filter((d) => d.title.toLowerCase().includes(q) || d.store.name.toLowerCase().includes(q));
  }, [searchQuery, deals]);

  const openAdd = () => {
    setEditingDeal(null);
    setFormData({ title: '', description: '', dealType: 'coupon', discountValue: '', discountType: 'percent', code: '', affiliateUrl: '', isExclusive: false, isVerified: true });
    setShowModal(true);
  };

  const openEdit = (deal: Deal) => { setEditingDeal(deal); setFormData({ ...deal }); setShowModal(true); };

  const handleSave = async () => {
    if (!formData.title) return;
    const payload = {
      store_id: formData.storeId || stores[0]?.id,
      title: formData.title,
      description: formData.description || '',
      deal_type: formData.dealType || 'coupon',
      discount_value: formData.discountValue || '',
      discount_type: formData.discountType || 'percent',
      code: formData.code || null,
      affiliate_url: formData.affiliateUrl || '',
      is_exclusive: formData.isExclusive || false,
      is_verified: formData.isVerified || true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    if (editingDeal) {
      await supabase.from('deals').update(payload).eq('id', editingDeal.id);
    } else {
      await supabase.from('deals').insert(payload);
    }
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (id: string) => { if (confirm('Delete this deal?')) { await supabase.from('deals').delete().eq('id', id); refetch(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deals & Coupons</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" />Add Deal</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search deals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left font-medium">Deal</th><th className="px-4 py-3 text-left font-medium">Store</th><th className="px-4 py-3 text-left font-medium">Type</th><th className="px-4 py-3 text-left font-medium">Code</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr> :
                filtered.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div><p className="font-medium text-gray-900">{deal.title}</p><p className="text-xs text-gray-500 truncate max-w-[200px]">{deal.description}</p></div></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><img src={deal.store.logoUrl} alt="" className="w-6 h-6 object-contain rounded" /><span className="text-gray-600">{deal.store.name}</span></div></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">{deal.dealType}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{deal.code || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={deal.isVerified ? 'active' : 'inactive'} /></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => openEdit(deal)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(deal.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900">{editingDeal ? 'Edit Deal' : 'Add Deal'}</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Title</label><input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Description</label><textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Deal Type</label><select value={formData.dealType} onChange={(e) => setFormData({ ...formData, dealType: e.target.value as 'coupon' | 'sale' | 'deal' })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"><option value="coupon">Coupon</option><option value="sale">Sale</option><option value="deal">Deal</option></select></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Discount Type</label><select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percent' | 'fixed' })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Discount Value</label><input value={formData.discountValue || ''} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1">Code</label><input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              </div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Affiliate URL</label><input value={formData.affiliateUrl || ''} onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><input type="checkbox" id="exclusive" checked={formData.isExclusive || false} onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="exclusive" className="text-sm font-medium text-gray-700">Exclusive</label></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="verified" checked={formData.isVerified || false} onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="verified" className="text-sm font-medium text-gray-700">Verified</label></div>
              </div>
              <div className="flex justify-end gap-3 pt-4"><button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Cancel</button><button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 flex items-center gap-2"><Save className="w-4 h-4" />Save Deal</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ───
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.from('users').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setUsers(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [searchQuery, users]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left font-medium">User</th><th className="px-4 py-3 text-left font-medium">Email</th><th className="px-4 py-3 text-left font-medium">Joined</th><th className="px-4 py-3 text-right font-medium">Balance</th><th className="px-4 py-3 text-right font-medium">Earned</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr> :
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={user.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" /><span className="font-medium text-gray-900">{user.full_name || 'User'}</span></div></td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${Number(user.cashback_balance || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">${Number(user.total_earned || 0).toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Transactions Tab ───
function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.from('transactions').select('*, stores(*)').order('transaction_date', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setTransactions(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((t) => (t.stores?.name || '').toLowerCase().includes(q));
  }, [searchQuery, transactions]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left font-medium">Store</th><th className="px-4 py-3 text-left font-medium">Order ID</th><th className="px-4 py-3 text-right font-medium">Amount</th><th className="px-4 py-3 text-right font-medium">Cashback</th><th className="px-4 py-3 text-left font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr> :
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><img src={tx.stores?.logo_url || ''} alt="" className="w-6 h-6 object-contain rounded" /><span className="font-medium text-gray-900">{tx.stores?.name}</span></div></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{tx.order_id}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${Number(tx.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">+${Number(tx.cashback_amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Payouts Tab ───
function PayoutsTab() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetch = () => {
    supabase.from('payouts').select('*, users(*)').order('requested_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setPayouts(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return payouts;
    const q = searchQuery.toLowerCase();
    return payouts.filter((p) => (p.users?.full_name || '').toLowerCase().includes(q));
  }, [searchQuery, payouts]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('payouts').update({ status, processed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', id);
    fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payouts</h1>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search payouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 text-sm focus:outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500"><tr><th className="px-4 py-3 text-left font-medium">User</th><th className="px-4 py-3 text-left font-medium">Method</th><th className="px-4 py-3 text-right font-medium">Amount</th><th className="px-4 py-3 text-left font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr> :
                filtered.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{payout.users?.full_name || 'User'}</td>
                    <td className="px-4 py-3 text-gray-500">{payout.method}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">${Number(payout.amount).toFixed(2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={payout.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payout.status === 'pending' && (<><button onClick={() => updateStatus(payout.id, 'completed')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">Approve</button><button onClick={() => updateStatus(payout.id, 'cancelled')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">Reject</button></>)}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ───
function SettingsTab() {
  const [settings, setSettings] = useState({ siteName: 'A1 Cashback', primaryColor: '#2563eb', accentColor: '#10b981', fontFamily: 'Inter', logoUrl: '', faviconUrl: '', metaTitle: 'A1 Cashback - Earn Cashback on Every Purchase', metaDescription: 'Shop at your favorite stores and earn cashback on every purchase.', contactEmail: 'support@a1cashback.com', minPayout: 10, referralBonus: 25, enableReferrals: true, enableSignup: true });

  const colors = [
    { name: 'Blue', value: '#2563eb' }, { name: 'Green', value: '#10b981' }, { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' }, { name: 'Purple', value: '#8b5cf6' }, { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }, { name: 'Slate', value: '#475569' },
  ];
  const fonts = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Lato'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4"><Image className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Branding</h3></div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Site Name</label><input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Logo URL</label><input value={settings.logoUrl} onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Favicon URL</label><input value={settings.faviconUrl} onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Colors</h3></div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-2">Primary Color</label><div className="flex flex-wrap gap-2">{colors.map((c) => (<button key={c.value} onClick={() => setSettings({ ...settings, primaryColor: c.value })} className={`w-10 h-10 rounded-xl border-2 transition-all ${settings.primaryColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c.value }} title={c.name} />))}</div><div className="mt-2 flex items-center gap-2"><input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /><span className="text-sm text-gray-500 font-mono">{settings.primaryColor}</span></div></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-2">Accent Color</label><div className="flex flex-wrap gap-2">{colors.map((c) => (<button key={c.value} onClick={() => setSettings({ ...settings, accentColor: c.value })} className={`w-10 h-10 rounded-xl border-2 transition-all ${settings.accentColor === c.value ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c.value }} title={c.name} />))}</div><div className="mt-2 flex items-center gap-2"><input type="color" value={settings.accentColor} onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /><span className="text-sm text-gray-500 font-mono">{settings.accentColor}</span></div></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4"><Type className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Typography</h3></div>
          <div><label className="text-sm font-medium text-gray-700 block mb-2">Font Family</label><div className="grid grid-cols-2 gap-2">{fonts.map((font) => (<button key={font} onClick={() => setSettings({ ...settings, fontFamily: font })} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${settings.fontFamily === font ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={{ fontFamily: font }}>{font}</button>))}</div></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">SEO & Meta</h3></div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Meta Title</label><input value={settings.metaTitle} onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Meta Description</label><textarea value={settings.metaDescription} onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4"><DollarSign className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-900">Business Rules</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Min Payout ($)</label><input type="number" value={settings.minPayout} onChange={(e) => setSettings({ ...settings, minPayout: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Referral Bonus ($)</label><input type="number" value={settings.referralBonus} onChange={(e) => setSettings({ ...settings, referralBonus: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1">Contact Email</label><input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none" /></div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2"><input type="checkbox" id="enableReferrals" checked={settings.enableReferrals} onChange={(e) => setSettings({ ...settings, enableReferrals: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="enableReferrals" className="text-sm font-medium text-gray-700">Enable Referrals</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="enableSignup" checked={settings.enableSignup} onChange={(e) => setSettings({ ...settings, enableSignup: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="enableSignup" className="text-sm font-medium text-gray-700">Enable Signups</label></div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end"><button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"><Save className="w-4 h-4" />Save All Settings</button></div>
    </div>
  );
}

// ─── Main Admin Page ───
export function AdminPage() {
  const location = useLocation();
  const activeTab: AdminTab = location.pathname.includes('/stores') ? 'stores' : location.pathname.includes('/deals') ? 'deals' : location.pathname.includes('/users') ? 'users' : location.pathname.includes('/transactions') ? 'transactions' : location.pathname.includes('/payouts') ? 'payouts' : location.pathname.includes('/settings') ? 'settings' : 'overview';

  const renderContent = () => {
    switch (activeTab) {
      case 'stores': return <StoresTab />;
      case 'deals': return <DealsTab />;
      case 'users': return <UsersTab />;
      case 'transactions': return <TransactionsTab />;
      case 'payouts': return <PayoutsTab />;
      case 'settings': return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  return <AdminLayout activeTab={activeTab}>{renderContent()}</AdminLayout>;
}
