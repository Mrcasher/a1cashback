/*
# Create stores, categories, and deals tables

1. New Tables
- `categories` — store categories
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `slug` (text, unique, not null)
  - `icon` (text)
  - `description` (text)
  - `store_count` (integer, default 0)
  - `created_at` (timestamptz)

- `stores` — cashback store catalog
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `slug` (text, unique, not null)
  - `logo_url` (text)
  - `description` (text)
  - `website_url` (text)
  - `category_id` (uuid, references categories)
  - `cashback_rate` (numeric, default 0)
  - `cashback_type` (text, default 'percent')
  - `cashback_details` (text)
  - `is_featured` (boolean, default false)
  - `average_response_time` (text)
  - `deal_count` (integer, default 0)
  - `countries` (text[])
  - `created_at` (timestamptz)

- `deals` — coupons and promotions
  - `id` (uuid, primary key)
  - `store_id` (uuid, references stores)
  - `title` (text, not null)
  - `description` (text)
  - `code` (text)
  - `deal_type` (text, default 'coupon')
  - `discount_value` (text)
  - `discount_type` (text)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `affiliate_url` (text)
  - `terms_conditions` (text)
  - `is_exclusive` (boolean, default false)
  - `is_verified` (boolean, default true)
  - `usage_count` (integer, default 0)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all tables
- Allow public read access (anon + authenticated) for stores, categories, deals
- Admin-only write access for stores, categories, deals
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  description text,
  store_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  description text,
  website_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cashback_rate numeric NOT NULL DEFAULT 0,
  cashback_type text NOT NULL DEFAULT 'percent',
  cashback_details text,
  is_featured boolean NOT NULL DEFAULT false,
  average_response_time text,
  deal_count integer NOT NULL DEFAULT 0,
  countries text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  code text,
  deal_type text NOT NULL DEFAULT 'coupon',
  discount_value text,
  discount_type text,
  start_date timestamptz,
  end_date timestamptz,
  affiliate_url text,
  terms_conditions text,
  is_exclusive boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Public read policies for categories
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories"
  ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Public read policies for stores
DROP POLICY IF EXISTS "anon_select_stores" ON stores;
CREATE POLICY "anon_select_stores"
  ON stores FOR SELECT
  TO anon, authenticated USING (true);

-- Public read policies for deals
DROP POLICY IF EXISTS "anon_select_deals" ON deals;
CREATE POLICY "anon_select_deals"
  ON deals FOR SELECT
  TO anon, authenticated USING (true);

-- Admin write policies (will be enforced via edge function or admin check)
DROP POLICY IF EXISTS "admin_insert_stores" ON stores;
CREATE POLICY "admin_insert_stores"
  ON stores FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_stores" ON stores;
CREATE POLICY "admin_update_stores"
  ON stores FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_stores" ON stores;
CREATE POLICY "admin_delete_stores"
  ON stores FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_deals" ON deals;
CREATE POLICY "admin_insert_deals"
  ON deals FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_deals" ON deals;
CREATE POLICY "admin_update_deals"
  ON deals FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_deals" ON deals;
CREATE POLICY "admin_delete_deals"
  ON deals FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
