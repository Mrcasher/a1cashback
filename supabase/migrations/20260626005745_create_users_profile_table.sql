/*
# Create users profile table with admin role support

1. New Tables
- `users` — extends Supabase auth.users with app-specific profile data
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique)
  - `full_name` (text)
  - `avatar_url` (text)
  - `cashback_balance` (numeric, default 0)
  - `total_earned` (numeric, default 0)
  - `referral_code` (text)
  - `role` (text, default 'user') — either 'user' or 'admin'
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `users`
- Authenticated users can read their own profile
- Authenticated users can update their own profile
- Admins can read all user profiles
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  cashback_balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  referral_code text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON users;
CREATE POLICY "select_own_profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_admin" ON users;
CREATE POLICY "select_all_profiles_admin"
  ON users FOR SELECT
  TO authenticated
  USING (role = 'admin');

DROP POLICY IF EXISTS "update_own_profile" ON users;
CREATE POLICY "update_own_profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON users;
CREATE POLICY "insert_own_profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
