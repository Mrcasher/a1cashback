import { Link } from 'react-router-dom';
import { Clock, Copy, Check, Tag, Flame, ExternalLink, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Deal } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DealCardProps {
  deal: Deal;
  variant?: 'default' | 'featured' | 'compact';
}

export function DealCard({ deal, variant = 'default' }: DealCardProps) {
  const { isAuthenticated } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGetDeal = () => {
    if (!isAuthenticated) {
      window.location.href = '/signup';
      return;
    }
    window.open(deal.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(deal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const isExpiringSoon = daysLeft <= 3;

  const cashbackDisplay = deal.store.cashbackType === 'percent'
    ? `${deal.store.cashbackRate}%`
    : `$${deal.store.cashbackRate}`;

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all p-4">
        <div className="flex items-start gap-3">
          <Link to={`/store/${deal.store.slug}`} className="flex-shrink-0">
            <img
              src={deal.store.logoUrl}
              alt={deal.store.name}
              className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/48x48?text=${deal.store.name.charAt(0)}`;
              }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{deal.title}</p>
            <p className="text-xs text-gray-500">{deal.store.name}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <span className="text-green-600 font-bold text-sm">{deal.discountValue}</span>
            <p className="text-xs text-gray-500">Off</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {deal.isExclusive && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Exclusive
            </span>
          )}
          {deal.isVerified && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
        <Link to={`/store/${deal.store.slug}`} className="block p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2">
              <img
                src={deal.store.logoUrl}
                alt={deal.store.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/64x64?text=${deal.store.name}`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium">{deal.store.name}</p>
              <h3 className="font-bold text-lg text-gray-900 mt-1 line-clamp-2">{deal.title}</h3>
            </div>
          </div>
        </Link>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                {deal.dealType}
              </span>
              <span className="text-xs text-gray-500">
                {deal.usageCount.toLocaleString()} uses
              </span>
            </div>
            <div className={`flex items-center gap-1 ${isExpiringSoon ? 'text-red-500' : 'text-gray-500'}`}>
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                {daysLeft === 0 ? 'Ends today' : `${daysLeft} days left`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 text-center border border-red-100">
              <p className="text-2xl font-bold text-red-600">{deal.discountValue}</p>
              <p className="text-xs text-gray-500">Discount</p>
            </div>
            <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-2xl font-bold text-green-600">{cashbackDisplay}</p>
              <p className="text-xs text-gray-500">Cashback</p>
            </div>
          </div>
          {deal.code ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-center border-2 border-dashed border-gray-300">
                <span className="font-mono font-bold text-lg tracking-wider text-gray-900">
                  {deal.code}
                </span>
              </div>
              <button
                onClick={() => handleCopyCode(deal.code!)}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isCopied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          ) : null}
          <button
            onClick={handleGetDeal}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
          >
            <span>Get Deal + {cashbackDisplay} Cashback</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Link to={`/store/${deal.store.slug}`} className="flex-shrink-0">
            <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center p-2">
              <img
                src={deal.store.logoUrl}
                alt={deal.store.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/56x56?text=${deal.store.name.charAt(0)}`;
                }}
              />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">{deal.store.name}</span>
              {deal.isExclusive && (
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  Exclusive
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{deal.title}</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-red-600">
                <Tag className="w-4 h-4" />
                <span className="font-bold">{deal.discountValue}</span>
              </div>
              <span className="text-gray-300">+</span>
              <div className="flex items-center gap-1 text-green-600">
                <span className="font-bold">{cashbackDisplay}</span>
                <span className="text-xs text-gray-500">cashback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {deal.code ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-gray-700 bg-white px-3 py-1.5 rounded border">
                {deal.code}
              </span>
              <button
                onClick={() => handleCopyCode(deal.code!)}
                className={`p-1.5 rounded transition-colors ${
                  isCopied ? 'text-green-500' : 'text-gray-400 hover:text-blue-600'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs">
                {daysLeft === 0 ? 'Ends today' : `${daysLeft} days left`}
              </span>
            </div>
          )}
          <button
            onClick={handleGetDeal}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            Get Deal
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
