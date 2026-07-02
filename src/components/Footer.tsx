import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 lg:py-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A1</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">A1</span>
                <span className="text-xl font-bold text-blue-400">Cashback</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-md">
              A1Cashback.com is your ultimate destination for earning cashback on every purchase.
              Shop at over 1,500+ stores and earn up to 40% cashback on your purchases.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/stores" className="text-sm hover:text-blue-400 transition-colors">
                  All Stores
                </Link>
              </li>
              <li>
                <Link to="/deals" className="text-sm hover:text-blue-400 transition-colors">
                  Hot Deals
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm hover:text-blue-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm hover:text-blue-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/referral" className="text-sm hover:text-blue-400 transition-colors">
                  Refer & Earn
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/dashboard" className="text-sm hover:text-blue-400 transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/earnings" className="text-sm hover:text-blue-400 transition-colors">
                  Earnings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/favorites" className="text-sm hover:text-blue-400 transition-colors">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/dashboard/settings" className="text-sm hover:text-blue-400 transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-sm hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-sm">support@a1cashback.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-sm">1-800-A1-CASH</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-sm">New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} A1Cashback.com. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
