import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, Payout, Click, Store } from '../types';

function mapTransaction(row: Record<string, unknown>): Transaction {
  const store = row.stores
    ? {
        id: (row.stores as Record<string, unknown>).id as string,
        name: (row.stores as Record<string, unknown>).name as string,
        slug: (row.stores as Record<string, unknown>).slug as string,
        logoUrl: ((row.stores as Record<string, unknown>).logo_url as string) || '',
        description: ((row.stores as Record<string, unknown>).description as string) || '',
        websiteUrl: ((row.stores as Record<string, unknown>).website_url as string) || '',
        category: { id: '', name: '', slug: '', icon: '', description: '' },
        cashbackRate: Number((row.stores as Record<string, unknown>).cashback_rate || 0),
        cashbackType: ((row.stores as Record<string, unknown>).cashback_type as 'percent' | 'fixed') || 'percent',
        cashbackDetails: ((row.stores as Record<string, unknown>).cashback_details as string) || '',
        isFeatured: Boolean((row.stores as Record<string, unknown>).is_featured),
        averageResponseTime: ((row.stores as Record<string, unknown>).average_response_time as string) || '',
        countries: ((row.stores as Record<string, unknown>).countries as string[]) || [],
      }
    : {
        id: '', name: '', slug: '', logoUrl: '', description: '', websiteUrl: '',
        category: { id: '', name: '', slug: '', icon: '', description: '' },
        cashbackRate: 0, cashbackType: 'percent', cashbackDetails: '', isFeatured: false,
        averageResponseTime: '', countries: [],
      };
  return {
    id: row.id as string,
    storeId: (row.store_id as string) || '',
    store,
    amount: Number(row.amount || 0),
    cashbackAmount: Number(row.cashback_amount || 0),
    cashbackRate: Number(row.cashback_rate || 0),
    status: (row.status as 'pending' | 'confirmed' | 'paid' | 'cancelled') || 'pending',
    orderId: (row.order_id as string) || '',
    transactionDate: (row.transaction_date as string) || new Date().toISOString(),
    confirmedAt: (row.confirmed_at as string) || undefined,
  };
}

function mapPayout(row: Record<string, unknown>): Payout {
  return {
    id: row.id as string,
    amount: Number(row.amount || 0),
    method: (row.method as 'paypal' | 'bank_transfer' | 'gift_card') || 'paypal',
    status: (row.status as 'pending' | 'processing' | 'completed' | 'cancelled') || 'pending',
    requestedAt: (row.requested_at as string) || new Date().toISOString(),
    processedAt: (row.processed_at as string) || undefined,
  };
}

function mapClick(row: Record<string, unknown>): Click {
  const store = row.stores
    ? {
        id: (row.stores as Record<string, unknown>).id as string,
        name: (row.stores as Record<string, unknown>).name as string,
        slug: (row.stores as Record<string, unknown>).slug as string,
        logoUrl: ((row.stores as Record<string, unknown>).logo_url as string) || '',
        description: ((row.stores as Record<string, unknown>).description as string) || '',
        websiteUrl: ((row.stores as Record<string, unknown>).website_url as string) || '',
        category: { id: '', name: '', slug: '', icon: '', description: '' },
        cashbackRate: Number((row.stores as Record<string, unknown>).cashback_rate || 0),
        cashbackType: ((row.stores as Record<string, unknown>).cashback_type as 'percent' | 'fixed') || 'percent',
        cashbackDetails: ((row.stores as Record<string, unknown>).cashback_details as string) || '',
        isFeatured: Boolean((row.stores as Record<string, unknown>).is_featured),
        averageResponseTime: ((row.stores as Record<string, unknown>).average_response_time as string) || '',
        countries: ((row.stores as Record<string, unknown>).countries as string[]) || [],
      }
    : {
        id: '', name: '', slug: '', logoUrl: '', description: '', websiteUrl: '',
        category: { id: '', name: '', slug: '', icon: '', description: '' },
        cashbackRate: 0, cashbackType: 'percent', cashbackDetails: '', isFeatured: false,
        averageResponseTime: '', countries: [],
      };
  return {
    id: row.id as string,
    storeId: (row.store_id as string) || '',
    store,
    clickedAt: (row.clicked_at as string) || new Date().toISOString(),
    status: (row.status as 'pending' | 'converted' | 'expired') || 'pending',
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('transactions')
      .select('*, stores(*)')
      .eq('user_id', userData.user.id)
      .order('transaction_date', { ascending: false });
    if (!error && data) setTransactions(data.map(mapTransaction));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { transactions, loading, refetch: fetch };
}

export function usePayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('requested_at', { ascending: false });
    if (!error && data) setPayouts(data.map(mapPayout));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const requestPayout = async (amount: number, method: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('payouts').insert({
      user_id: userData.user.id,
      amount,
      method,
      status: 'pending',
    });
    if (!error) await fetch();
    return { error: error?.message };
  };

  return { payouts, loading, refetch: fetch, requestPayout };
}

export function useClicks() {
  const [clicks, setClicks] = useState<Click[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('clicks')
      .select('*, stores(*)')
      .eq('user_id', userData.user.id)
      .order('clicked_at', { ascending: false });
    if (!error && data) setClicks(data.map(mapClick));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { clicks, loading, refetch: fetch };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('favorites')
      .select('*, store:stores(*)')
      .eq('user_id', userData.user.id);
    if (!error && data) {
      setFavorites(
        data.map((row: Record<string, unknown>) => {
          const s = row.store as Record<string, unknown>;
          return {
            id: s.id as string,
            name: s.name as string,
            slug: s.slug as string,
            logoUrl: (s.logo_url as string) || '',
            description: (s.description as string) || '',
            websiteUrl: (s.website_url as string) || '',
            category: { id: '', name: '', slug: '', icon: '', description: '' },
            cashbackRate: Number(s.cashback_rate || 0),
            cashbackType: (s.cashback_type as 'percent' | 'fixed') || 'percent',
            cashbackDetails: (s.cashback_details as string) || '',
            isFeatured: Boolean(s.is_featured),
            averageResponseTime: (s.average_response_time as string) || '',
            countries: (s.countries as string[]) || [],
          };
        })
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleFavorite = async (storeId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: 'Not authenticated' };
    const isFav = favorites.some((s) => s.id === storeId);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', userData.user.id).eq('store_id', storeId);
    } else {
      await supabase.from('favorites').insert({ user_id: userData.user.id, store_id: storeId });
    }
    await fetch();
    return { error: null };
  };

  return { favorites, loading, refetch: fetch, toggleFavorite };
}
