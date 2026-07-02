import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter,
  Grid3X3,
  Tag,
  Clock,
  Flame,
  ChevronDown,
  Zap,
  Sparkles,
  Gift,
} from 'lucide-react';
import { DealCard } from '../components/DealCard';
import { useDeals, useCategories, useStores } from '../hooks/useStores';

type DealType = 'all' | 'deal' | 'coupon' | 'sale';
type SortOption = 'popular' | 'expiring_soon' | 'newest' | 'discount_high';

export function DealsPage() {
  const [selectedType, setSelectedType] = useState<DealType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('expiring_soon');
  const [showFilters, setShowFilters] = useState(false);

  const { deals, loading: dealsLoading } = useDeals();
  const { categories, loading: catLoading } = useCategories();
  const { stores } = useStores();

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (selectedType !== 'all') {
      result = result.filter((d) => d.dealType === selectedType);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((d) => d.store.category?.slug === selectedCategory);
    }

    switch (sortBy) {
      case 'expiring_soon':
        result.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
      case 'discount_high':
        result.sort((a, b) => {
          const aVal = parseFloat(a.discountValue) || 0;
          const bVal = parseFloat(b.discountValue) || 0;
          return bVal - aVal;
        });
        break;
      default:
        result.sort((a, b) => b.usageCount - a.usageCount);
    }

    return result;
  }, [deals, selectedType, selectedCategory, sortBy]);

  const dealTypeFilters: { value: DealType; label: string; icon: typeof Gift }[] = [
    { value: 'all', label: 'All Deals', icon: Grid3X3 },
    { value: 'coupon', label: 'Coupons', icon: Tag },
    { value: 'sale', label: 'Sales', icon: Gift },
    { value: 'deal', label: 'Special Offers', icon: Zap },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'expiring_soon', label: 'Expiring Soon' },
    { value: 'newest', label: 'Newest First' },
    { value: 'discount_high', label: 'Highest Discount' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-yellow-300" />
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full animate-pulse">
              LIVE DEALS
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">Hot Deals & Coupons</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Save more with exclusive coupons and stackable cashback. Updated every hour.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">{deals.length}</div>
              <div className="text-sm text-white/80">Active Deals</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">{deals.filter((d) => d.isExclusive).length}</div>
              <div className="text-sm text-white/80">Exclusive Codes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">{deals.filter((d) => d.isVerified).length}</div>
              <div className="text-sm text-white/80">Verified Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[104px] lg:top-[140px] z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 lg:pb-0">
            {dealTypeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedType(filter.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedType === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            ))}

            <div className="lg:hidden ml-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2 bg-gray-100 rounded-xl text-sm font-medium cursor-pointer focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c.slug !== 'all').map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-48">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-1">
                  {catLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === 'all'
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.filter(c => c.slug !== 'all').map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.slug)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.slug
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-semibold">Deal of the Day</span>
                </div>
                <p className="text-lg font-bold mb-2">Up to 70% Off</p>
                <p className="text-sm text-white/80 mb-4">
                  Shop the biggest discounts of the season at participating stores.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Showing {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'}
                {selectedType !== 'all' && (
                  <span>
                    {' '}
                    in <span className="font-medium text-gray-700">{selectedType}s</span>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span>
                    {' '}
                    in <span className="font-medium text-gray-700">{categories.find(c => c.slug === selectedCategory)?.name}</span>
                  </span>
                )}
              </p>
            </div>

            {dealsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : filteredDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} variant="featured" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters to find more deals.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
