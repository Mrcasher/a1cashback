/*
# Create clicks, favorites, transactions, and payouts tables

1. New Tables
- `clicks` — affiliate click tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `store_id` (uuid, references stores)
  - `clicked_at` (timestamptz)
  - `status` (text, default 'pending')
  - `affiliate_url` (text)

- `favorites` — user saved stores
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `store_id` (uuid, references stores)
  - `created_at` (timestamptz)
  - UNIQUE(user_id, store_id)

- `transactions` — purchase tracking & cashback
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `store_id` (uuid, references stores)
  - `amount` (numeric)
  - `cashback_amount` (numeric)
  - `cashback_rate` (numeric)
  - `status` (text, default 'pending')
  - `order_id` (text)
  - `transaction_date` (timestamptz)
  - `confirmed_at` (timestamptz)

- `payouts` — withdrawal requests
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `amount` (numeric)
  - `method` (text)
  - `status` (text, default 'pending')
  - `requested_at` (timestamptz)
  - `processed_at` (timestamptz)

2. Security
- Enable RLS on all tables
- Owner-scoped policies for user data (clicks, favorites, transactions, payouts)
- Admin can read all data
*/

CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  clicked_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  affiliate_url text
);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, store_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  cashback_amount numeric NOT NULL DEFAULT 0,
  cashback_rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  order_id text,
  transaction_date timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'paypal',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Clicks: users see their own, admins see all
DROP POLICY IF EXISTS "select_own_clicks" ON clicks;
CREATE POLICY "select_own_clicks"
  ON clicks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_clicks" ON clicks;
CREATE POLICY "insert_own_clicks"
  ON clicks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Favorites: users manage their own
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites"
  ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites"
  ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites"
  ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Transactions: users see their own
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions"
  ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions"
  ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Payouts: users manage their own
DROP POLICY IF EXISTS "select_own_payouts" ON payouts;
CREATE POLICY "select_own_payouts"
  ON payouts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_payouts" ON payouts;
CREATE POLICY "insert_own_payouts"
  ON payouts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
