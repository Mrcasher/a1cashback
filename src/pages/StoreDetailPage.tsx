import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ExternalLink,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Share2,
  Gift,
  Tag,
  Store,
} from 'lucide-react';
import { DealCard } from '../components/DealCard';
import { useStoreBySlug, useDealsByStore, useStores } from '../hooks/useStores';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useUserData';
import { supabase } from '../lib/supabase';

export function StoreDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { store, loading: storeLoading } = useStoreBySlug(slug || '');
  const { deals, loading: dealsLoading } = useDealsByStore(store?.id || '');
  const { stores } = useStores();
  const { favorites, toggleFavorite } = useFavorites();

  const [showCashbackInfo, setShowCashbackInfo] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  const isFavorite = store ? favorites.some((s) => s.id === store.id) : false;

  const relatedStores = store
    ? stores.filter((s) => s.category?.id === store.category?.id && s.id !== store.id).slice(0, 4)
    : [];

  const cashbackDisplay = store?.cashbackType === 'percent'
    ? `${store.cashbackRate}%`
    : `$${store.cashbackRate}`;

  const handleShopNow = async () => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    if (store && user) {
      await supabase.from('clicks').insert({
        user_id: user.id,
        store_id: store.id,
        affiliate_url: store.websiteUrl,
        status: 'pending',
      });
      window.open(store.websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    if (!store) return;
    setIsFavLoading(true);
    await toggleFavorite(store.id);
    setIsFavLoading(false);
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-500 mb-6">The store you're looking for doesn't exist or has been removed.</p>
          <Link to="/stores" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Browse All Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/stores" className="hover:text-blue-600">Stores</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{store.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid lg:grid-cols-3 gap-0">
            <div className="lg:col-span-2 p-6 lg:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-3">
                  <img src={store.logoUrl} alt={store.name} className="max-w-full max-h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/96x96?text=${store.name}`; }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{store.name}</h1>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{store.category?.name}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{store.description}</p>
                  <div className="flex items-center gap-4">
                    <button onClick={handleFavorite} disabled={isFavLoading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isFavorite ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}>
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Cashback Offer</span>
                    </div>
                    <p className="text-4xl font-bold text-green-600 mb-2">{cashbackDisplay}</p>
                    <p className="text-sm text-gray-600">{store.cashbackDetails}</p>
                  </div>
                  <button onClick={() => setShowCashbackInfo(!showCashbackInfo)} className="p-2 text-gray-400 hover:text-gray-600">
                    <AlertCircle className="w-5 h-5" />
                  </button>
                </div>
                {showCashbackInfo && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <h4 className="font-medium text-gray-900 mb-2">How to earn cashback:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Click "Shop & Earn Cashback" on this page</li>
                      <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Complete your purchase as normal on {store.name}</li>
                      <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Cashback tracks within 24 hours</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:border-l border-gray-100 p-6 lg:p-8 bg-gray-50">
              <div className="sticky top-48">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-2">Average tracking time</p>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-gray-900">{store.averageResponseTime}</span>
                  </div>
                </div>
                <button onClick={handleShopNow}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 mb-4">
                  <span>Shop & Earn {cashbackDisplay}</span>
                  <ExternalLink className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Verified Store</span>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Active Deals</span><span className="font-semibold text-gray-900">{deals.length}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Cashback Type</span><span className="font-semibold text-gray-900 capitalize">{store.cashbackType}</span></div>
                  <div><span className="text-sm text-gray-500 block mb-2">Available In</span>
                    <div className="flex flex-wrap gap-1.5">
                      {store.countries.map((country) => (
                        <span key={country} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">{country}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {deals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Active Deals & Coupons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} variant="default" />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cashback Terms & Conditions</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Cashback is only available for purchases made after clicking through from A1Cashback</li>
            <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Cashback typically tracks within 24-48 hours of purchase</li>
            <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Cashback becomes payable after the store's return window closes</li>
            <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Using coupon codes not listed on A1Cashback may void your cashback</li>
            <li className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Gift card purchases are typically not eligible for cashback</li>
          </ul>
        </div>

        {relatedStores.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Stores</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedStores.map((s) => (
                <Link key={s.id} to={`/store/${s.slug}`} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3">
                  <img src={s.logoUrl} alt={s.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/48x48?text=${s.name.charAt(0)}`; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-sm text-green-600 font-semibold">{s.cashbackType === 'percent' ? `${s.cashbackRate}%` : `$${s.cashbackRate}`}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
