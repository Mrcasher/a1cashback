import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Store, Category, Deal } from '../types';

function mapStore(row: Record<string, unknown>): Store {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    logoUrl: (row.logo_url as string) || '',
    description: (row.description as string) || '',
    websiteUrl: (row.website_url as string) || '',
    category: row.category
      ? {
          id: (row.category as Record<string, unknown>).id as string,
          name: (row.category as Record<string, unknown>).name as string,
          slug: (row.category as Record<string, unknown>).slug as string,
          icon: ((row.category as Record<string, unknown>).icon as string) || '',
          description: ((row.category as Record<string, unknown>).description as string) || '',
          storeCount: ((row.category as Record<string, unknown>).store_count as number) || 0,
        }
      : { id: '', name: '', slug: '', icon: '', description: '' },
    cashbackRate: Number(row.cashback_rate || 0),
    cashbackType: (row.cashback_type as 'percent' | 'fixed') || 'percent',
    cashbackDetails: (row.cashback_details as string) || '',
    isFeatured: Boolean(row.is_featured),
    averageResponseTime: (row.average_response_time as string) || '',
    dealCount: (row.deal_count as number) || 0,
    countries: (row.countries as string[]) || [],
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    icon: (row.icon as string) || '',
    description: (row.description as string) || '',
    storeCount: (row.store_count as number) || 0,
  };
}

function mapDeal(row: Record<string, unknown>): Deal {
  const store = row.stores ? mapStore(row.stores as Record<string, unknown>) : undefined;
  return {
    id: row.id as string,
    storeId: (row.store_id as string) || '',
    store: store || {
      id: '', name: '', slug: '', logoUrl: '', description: '', websiteUrl: '',
      category: { id: '', name: '', slug: '', icon: '', description: '' },
      cashbackRate: 0, cashbackType: 'percent', cashbackDetails: '', isFeatured: false,
      averageResponseTime: '', countries: [],
    },
    title: row.title as string,
    description: (row.description as string) || '',
    code: (row.code as string) || undefined,
    dealType: (row.deal_type as 'deal' | 'coupon' | 'sale') || 'coupon',
    discountValue: (row.discount_value as string) || '',
    discountType: (row.discount_type as 'percent' | 'fixed' | 'shipping') || undefined,
    startDate: (row.start_date as string) || new Date().toISOString(),
    endDate: (row.end_date as string) || new Date().toISOString(),
    affiliateUrl: (row.affiliate_url as string) || '',
    termsConditions: (row.terms_conditions as string) || undefined,
    isExclusive: Boolean(row.is_exclusive),
    isVerified: Boolean(row.is_verified),
    usageCount: (row.usage_count as number) || 0,
  };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setCategories(data.map(mapCategory));
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    supabase
      .from('stores')
      .select('*, category:categories(*)')
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setStores(data.map(mapStore));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stores, loading, refetch: fetch };
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    supabase
      .from('deals')
      .select('*, store:stores(*, category:categories(*))')
      .order('usage_count', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDeals(data.map(mapDeal));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { deals, loading, refetch: fetch };
}

export function useStoreBySlug(slug: string) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('stores')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setStore(mapStore(data));
        setLoading(false);
      });
  }, [slug]);

  return { store, loading };
}

export function useDealsByStore(storeId: string) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;
    supabase
      .from('deals')
      .select('*, store:stores(*, category:categories(*))')
      .eq('store_id', storeId)
      .then(({ data, error }) => {
        if (!error && data) setDeals(data.map(mapDeal));
        setLoading(false);
      });
  }, [storeId]);

  return { deals, loading };
}

export function useFeaturedStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('stores')
      .select('*, category:categories(*)')
      .eq('is_featured', true)
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setStores(data.map(mapStore));
        setLoading(false);
      });
  }, []);

  return { stores, loading };
}
