import { Link, useNavigate } from 'react-router-dom';
import { Heart, ExternalLink, Gift, Globe } from 'lucide-react';
import { useState } from 'react';
import { Store } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useUserData';
import { supabase } from '../lib/supabase';

interface StoreCardProps {
  store: Store;
  variant?: 'default' | 'featured' | 'compact';
}

export function StoreCard({ store, variant = 'default' }: StoreCardProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [isFavLoading, setIsFavLoading] = useState(false);

  const isFavorite = favorites.some((s) => s.id === store.id);

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

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }
    setIsFavLoading(true);
    await toggleFavorite(store.id);
    setIsFavLoading(false);
  };

  const cashbackDisplay = store.cashbackType === 'percent'
    ? `${store.cashbackRate}%`
    : `$${store.cashbackRate}`;

  if (variant === 'compact') {
    return (
      <Link
        to={`/store/${store.slug}`}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
      >
        <img
          src={store.logoUrl}
          alt={store.name}
          className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/48x48?text=${store.name.charAt(0)}`;
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{store.name}</p>
          <p className="text-xs text-gray-500">{store.category?.name}</p>
        </div>
        <div className="text-right">
          <span className="text-green-600 font-bold">{cashbackDisplay}</span>
          <p className="text-xs text-gray-500">Cashback</p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100 group">
        {store.isFeatured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
              Featured
            </span>
          </div>
        )}
        <Link to={`/store/${store.slug}`} className="block p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center p-3">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/80x80?text=${store.name}`;
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFavorite}
                disabled={isFavLoading}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {store.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{store.description}</p>
        </Link>
        <div className="px-6 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{cashbackDisplay}</p>
              <p className="text-xs text-gray-500">Cashback</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-gray-900">{store.dealCount || 0}</p>
              <p className="text-xs text-gray-500">Active Deals</p>
            </div>
          </div>
          <button
            onClick={handleShopNow}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
          >
            <span>Shop & Earn {cashbackDisplay}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden">
      <Link to={`/store/${store.slug}`} className="block p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
            <img
              src={store.logoUrl}
              alt={store.name}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/64x64?text=${store.name.charAt(0)}`;
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {store.name}
              </h3>
              <button
                onClick={handleFavorite}
                disabled={isFavLoading}
                className={`p-1.5 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{store.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">{store.category?.name}</span>
              {store.dealCount && store.dealCount > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-blue-600">{store.dealCount} deals</span>
                </>
              )}
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Globe className="w-3 h-3" />
                {store.countries.length > 3
                  ? `${store.countries.slice(0, 3).join(', ')} +${store.countries.length - 3}`
                  : store.countries.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-green-100 rounded-lg">
              <span className="text-green-700 font-bold text-lg">{cashbackDisplay}</span>
              <span className="text-green-600 text-xs ml-1">Cashback</span>
            </div>
            <Gift className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">+ deals</span>
          </div>
          <button
            onClick={handleShopNow}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
