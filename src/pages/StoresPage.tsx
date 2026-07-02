import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid3X3, List, SlidersHorizontal, Store, X, ChevronDown, Globe } from 'lucide-react';
import { StoreCard } from '../components/StoreCard';
import { useStores, useCategories } from '../hooks/useStores';

type SortOption = 'popularity' | 'cashback_high' | 'cashback_low' | 'alpha_a_z' | 'alpha_z_a';
type ViewMode = 'grid' | 'list';

export function StoresPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [minCashback, setMinCashback] = useState<string>('');

  const { stores, loading: storesLoading } = useStores();
  const { categories, loading: catLoading } = useCategories();

  const allCountries = Array.from(new Set(stores.flatMap((s) => s.countries))).sort();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const filteredStores = useMemo(() => {
    let result = [...stores];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category?.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((s) => s.category?.slug === selectedCategory);
    }

    if (selectedCountry && selectedCountry !== 'all') {
      result = result.filter((s) => s.countries.includes(selectedCountry));
    }

    if (minCashback) {
      const minRate = parseFloat(minCashback);
      result = result.filter((s) => s.cashbackRate >= minRate);
    }

    switch (sortBy) {
      case 'cashback_high':
        result.sort((a, b) => b.cashbackRate - a.cashbackRate);
        break;
      case 'cashback_low':
        result.sort((a, b) => a.cashbackRate - b.cashbackRate);
        break;
      case 'alpha_a_z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'alpha_z_a':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [stores, searchQuery, selectedCategory, selectedCountry, sortBy, minCashback]);

  const sortByOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'cashback_high', label: 'Highest Cashback' },
    { value: 'cashback_low', label: 'Lowest Cashback' },
    { value: 'alpha_a_z', label: 'A-Z' },
    { value: 'alpha_z_a', label: 'Z-A' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-8 h-8 text-yellow-400" />
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
              {stores.length}+ Stores
            </span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">All Stores</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Browse our complete list of stores and earn cashback on every purchase.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-[104px] lg:top-[140px] z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchParams({});
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`lg:hidden px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm font-medium">Filters</span>
              </button>

              <div className="relative hidden lg:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-gray-100 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortByOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
                >
                  {sortByOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Min Cashback Rate</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={minCashback}
                  onChange={(e) => setMinCashback(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
                >
                  <option value="all">All Countries</option>
                  {allCountries.map((country) => (
                    <option key={country} value={country}>{country}</option>
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
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.slug
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <span className="text-xs text-gray-400">{category.storeCount}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Cashback Rate</h3>
                  <input
                    type="number"
                    placeholder="Min %"
                    value={minCashback}
                    onChange={(e) => setMinCashback(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Country
                  </h3>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="all">All Countries</option>
                    {allCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'}
                  {selectedCategory !== 'all' && (
                    <span> in <span className="font-medium text-gray-700">{categories.find(c => c.slug === selectedCategory)?.name}</span></span>
                  )}
                  {searchQuery && (
                    <span> matching "<span className="font-medium text-gray-700">{searchQuery}</span>"</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCountry('all');
                  setSearchQuery('');
                  setMinCashback('');
                  setSearchParams({});
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>

            {storesLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-40 animate-pulse" />
                ))}
              </div>
            ) : filteredStores.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredStores.map((store) => (
                  <StoreCard key={store.id} store={store} variant={viewMode === 'list' ? 'compact' : 'default'} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCountry('all');
                    setSearchQuery('');
                    setMinCashback('');
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
