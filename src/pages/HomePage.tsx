import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  TrendingUp,
  Clock,
  Shield,
  Gift,
  ChevronRight,
  Star,
  Sparkles,
  CreditCard,
  Zap,
} from 'lucide-react';
import { StoreCard } from '../components/StoreCard';
import { DealCard } from '../components/DealCard';
import { useFeaturedStores, useDeals, useCategories, useStores } from '../hooks/useStores';

const heroSlides = [
  {
    title: 'Earn Cashback on Every Purchase',
    subtitle: 'Shop at 1,500+ stores and earn up to 40% cashback automatically',
    stat: '$50M+',
    statLabel: 'Paid to Members',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b93d?w=1200&h=600&fit=crop',
    cta: 'Start Earning Today',
  },
  {
    title: 'Double Cashback Weekend',
    subtitle: 'Get 2x cashback on all featured stores this weekend only',
    stat: '2X',
    statLabel: 'Cashback Bonus',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed437c77d?w=1200&h=600&fit=crop',
    cta: 'See 2x Stores',
  },
  {
    title: 'Refer Friends, Earn $25 Each',
    subtitle: 'Share your referral link and earn $25 for every friend who signs up',
    stat: '$25',
    statLabel: 'Per Referral',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b973898525?w=1200&h=600&fit=crop',
    cta: 'Get Your Link',
  },
];

const statsData = [
  { value: '1,500+', label: 'Partner Stores' },
  { value: '$50M+', label: 'Paid to Members' },
  { value: '2M+', label: 'Happy Members' },
  { value: '45', label: 'Days to Pay-out' },
];

const features = [
  {
    icon: Search,
    title: 'Browse & Click',
    description: 'Find your favorite store and click through to shop as usual. Our tracking ensures you get credited.',
  },
  {
    icon: CreditCard,
    title: 'Shop Normally',
    description: 'Complete your purchase on the store site. No codes needed, prices are exactly the same.',
  },
  {
    icon: TrendingUp,
    title: 'Earn Cashback',
    description: 'Cashback appears in your account within days. Watch your earnings grow with every purchase.',
  },
  {
    icon: Gift,
    title: 'Get Paid',
    description: 'Request payment once you reach $10. PayPal, bank transfer, or gift cards - your choice.',
  },
];

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { stores: featuredStores, loading: fLoading } = useFeaturedStores();
  const { deals, loading: dLoading } = useDeals();
  const { categories, loading: cLoading } = useCategories();
  const { stores, loading: sLoading } = useStores();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/stores?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const hotDeals = deals.slice(0, 4);
  const trendingStores = stores.slice(0, 8);
  const displayCategories = categories.filter((c) => c.slug !== 'all').slice(0, 6);

  const iconMap: Record<string, string> = {
    fashion: '👕', electronics: '💻', travel: '✈️', 'home-garden': '🏠',
    'health-beauty': '💄', 'food-dining': '🍕', sports: '⚽', jewelry: '💎',
    finance: '💳', automotive: '🚗', pets: '🐾',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/80 to-transparent"></div>
          </div>
        ))}

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                NEW MEMBER BONUS
              </span>
            </div>

            <div className="transition-all duration-500">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8">
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {heroSlides[currentSlide].cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                How It Works
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Fast payouts</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-400" />
                <span>$10 min payout</span>
              </div>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative -mt-8 z-10 px-4 mb-8">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search 1,500+ stores for cashback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-32 py-5 text-lg focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <p className="text-3xl lg:text-4xl font-bold text-blue-600 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Stores */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Featured Stores</h2>
            <p className="text-gray-500 mt-1">Top cashback rates from our most popular stores</p>
          </div>
          <Link
            to="/stores"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
              ))
            : featuredStores.map((store) => (
                <StoreCard key={store.id} store={store} variant="featured" />
              ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 mt-1">Find stores in your favorite shopping categories</p>
          </div>
          <Link
            to="/categories"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
          >
            All Categories
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {cLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
              ))
            : displayCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/stores?category=${category.slug}`}
                  className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                    <span className="text-2xl">{iconMap[category.slug] || '🏪'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.storeCount} stores</p>
                </Link>
              ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16 lg:py-20 mb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">
                  Limited Time
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold">Hot Deals Today</h2>
              <p className="text-gray-400 mt-1">Exclusive coupons + stackable cashback</p>
            </div>
            <Link
              to="/deals"
              className="text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-xl h-48 animate-pulse" />
                ))
              : hotDeals.map((deal) => (
                  <div key={deal.id} className="bg-white/5 backdrop-blur-sm rounded-xl">
                    <DealCard deal={deal} variant="compact" />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Trending Stores */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Trending Now</h2>
            <p className="text-gray-500 mt-1">Most popular stores this week</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
              ))
            : trendingStores.map((store) => (
                <StoreCard key={store.id} store={store} variant="compact" />
              ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 lg:py-20 mb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              How A1Cashback Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Earn cashback on every purchase in four simple steps. It's completely free and takes just seconds.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                    <feature.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/signup"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              Start Earning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            What Our Members Say
          </h2>
          <p className="text-gray-500">Join 2 million+ happy members earning cashback every day</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Sarah Johnson',
              location: 'New York, NY',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
              quote: "I've earned over $500 in cashback in just 6 months. A1Cashback makes it so easy!",
              rating: 5,
            },
            {
              name: 'Michael Chen',
              location: 'San Francisco, CA',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
              quote: 'The referral program is amazing. I earned $100 just by telling my friends about it.',
              rating: 5,
            },
            {
              name: 'Emily Davis',
              location: 'Chicago, IL',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
              quote: "Fast payouts and great customer service. I've tried other cashback sites, but none compare to A1Cashback.",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 lg:py-20 mb-0">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Earning Cashback?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join over 2 million members who have earned cashback with A1Cashback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              Sign Up Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/stores"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all"
            >
              Browse Stores
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
