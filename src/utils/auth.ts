import { User, Transaction, Click, Payout } from '../types';
import { stores } from '../data/mockData';

const STORAGE_KEY = 'a1cashback_user';

export const mockUser: User = {
  id: 'user_001',
  email: 'john.doe@example.com',
  fullName: 'John Doe',
  avatarUrl: 'https://images.unsplash.com/photo-1472099625465-123a664f060d?w=100&h=100&fit=crop&crop=face',
  cashbackBalance: 127.84,
  totalEarned: 1842.56,
  referralCode: 'ABC123XYZ',
  createdAt: '2023-06-15T00:00:00Z',
  role: 'admin',
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    storeId: '1',
    store: stores[0],
    amount: 299.99,
    cashbackAmount: 9.00,
    cashbackRate: 3.0,
    status: 'confirmed',
    orderId: 'ORD-2024-001234',
    transactionDate: '2024-01-15T10:30:00Z',
    confirmedAt: '2024-01-20T14:00:00Z',
    userName: 'John Doe',
  },
  {
    id: 'tx_002',
    storeId: '2',
    store: stores[1],
    amount: 159.99,
    cashbackAmount: 12.80,
    cashbackRate: 8.0,
    status: 'confirmed',
    orderId: 'ORD-2024-001235',
    transactionDate: '2024-01-12T15:45:00Z',
    confirmedAt: '2024-01-18T09:00:00Z',
    userName: 'Jane Smith',
  },
  {
    id: 'tx_003',
    storeId: '10',
    store: stores[9],
    amount: 85.00,
    cashbackAmount: 5.10,
    cashbackRate: 6.0,
    status: 'pending',
    orderId: 'ORD-2024-001236',
    transactionDate: '2024-01-18T11:20:00Z',
    userName: 'Mike Johnson',
  },
  {
    id: 'tx_004',
    storeId: '4',
    store: stores[3],
    amount: 549.99,
    cashbackAmount: 22.00,
    cashbackRate: 4.0,
    status: 'pending',
    orderId: 'ORD-2024-001237',
    transactionDate: '2024-01-19T09:15:00Z',
    userName: 'Sarah Wilson',
  },
  {
    id: 'tx_005',
    storeId: '5',
    store: stores[4],
    amount: 67.45,
    cashbackAmount: 2.36,
    cashbackRate: 3.5,
    status: 'confirmed',
    orderId: 'ORD-2024-001238',
    transactionDate: '2024-01-10T16:30:00Z',
    confirmedAt: '2024-01-16T10:00:00Z',
    userName: 'John Doe',
  },
  {
    id: 'tx_006',
    storeId: '7',
    store: stores[6],
    amount: 420.00,
    cashbackAmount: 25.20,
    cashbackRate: 6.0,
    status: 'pending',
    orderId: 'ORD-2024-001239',
    transactionDate: '2024-01-20T08:00:00Z',
    userName: 'Jane Smith',
  },
];

export const mockClicks: Click[] = [
  {
    id: 'click_001',
    storeId: '1',
    store: stores[0],
    clickedAt: '2024-01-21T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'click_002',
    storeId: '11',
    store: stores[10],
    clickedAt: '2024-01-20T15:30:00Z',
    status: 'pending',
  },
  {
    id: 'click_003',
    storeId: '9',
    store: stores[8],
    clickedAt: '2024-01-19T11:45:00Z',
    status: 'converted',
  },
];

export const mockPayouts: Payout[] = [
  {
    id: 'payout_001',
    amount: 150.00,
    method: 'paypal',
    status: 'completed',
    requestedAt: '2024-01-01T12:00:00Z',
    processedAt: '2024-01-03T09:00:00Z',
    userName: 'John Doe',
  },
  {
    id: 'payout_002',
    amount: 200.00,
    method: 'paypal',
    status: 'pending',
    requestedAt: '2023-11-15T14:30:00Z',
    userName: 'Jane Smith',
  },
  {
    id: 'payout_003',
    amount: 75.00,
    method: 'bank_transfer',
    status: 'pending',
    requestedAt: '2024-01-20T09:00:00Z',
    userName: 'Mike Johnson',
  },
];

export const mockUsers: User[] = [
  mockUser,
  {
    id: 'user_002',
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    cashbackBalance: 45.20,
    totalEarned: 320.50,
    referralCode: 'JANE2024',
    createdAt: '2023-08-20T00:00:00Z',
    role: 'user',
  },
  {
    id: 'user_003',
    email: 'mike.johnson@example.com',
    fullName: 'Mike Johnson',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    cashbackBalance: 12.80,
    totalEarned: 89.00,
    referralCode: 'MIKE88',
    createdAt: '2023-10-05T00:00:00Z',
    role: 'user',
  },
  {
    id: 'user_004',
    email: 'sarah.wilson@example.com',
    fullName: 'Sarah Wilson',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    cashbackBalance: 234.60,
    totalEarned: 567.30,
    referralCode: 'SARAH99',
    createdAt: '2023-09-12T00:00:00Z',
    role: 'user',
  },
];

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function generateReferralLink(code: string): string {
  return `https://a1cashback.com/join?ref=${code}`;
}
