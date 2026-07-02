export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  storeCount?: number;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  websiteUrl: string;
  category: Category;
  cashbackRate: number;
  cashbackType: 'percent' | 'fixed';
  cashbackDetails: string;
  isFeatured: boolean;
  averageResponseTime: string;
  dealCount?: number;
  featuredBanner?: string;
  countries: string[];
}

export interface Deal {
  id: string;
  storeId: string;
  store: Store;
  title: string;
  description: string;
  code?: string;
  dealType: 'deal' | 'coupon' | 'sale';
  discountValue: string;
  discountType?: 'percent' | 'fixed' | 'shipping';
  startDate: string;
  endDate: string;
  affiliateUrl: string;
  termsConditions?: string;
  isExclusive: boolean;
  isVerified: boolean;
  usageCount: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  cashbackBalance: number;
  totalEarned: number;
  referralCode: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface Transaction {
  id: string;
  storeId: string;
  store: Store;
  amount: number;
  cashbackAmount: number;
  cashbackRate: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  orderId: string;
  transactionDate: string;
  confirmedAt?: string;
  userName?: string;
}

export interface Click {
  id: string;
  storeId: string;
  store: Store;
  clickedAt: string;
  status: 'pending' | 'converted' | 'expired';
}

export interface Payout {
  id: string;
  amount: number;
  method: 'paypal' | 'bank_transfer' | 'gift_card';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requestedAt: string;
  processedAt?: string;
  userName?: string;
}
