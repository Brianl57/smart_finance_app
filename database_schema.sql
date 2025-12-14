-- =====================================================
-- SMART FINANCE APP - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Navigate to: Supabase Dashboard > SQL Editor > New Query
-- =====================================================

-- =====================================================
-- 1. CREATE PUBLIC USERS TABLE
-- =====================================================
-- This table stores user profile information
-- It references auth.users which is managed by Supabase Auth

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- =====================================================
-- 2. UPDATE PLAID_ITEMS TABLE
-- =====================================================
-- Add user_id column if it doesn't exist
-- Link plaid items to users

ALTER TABLE public.plaid_items
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON public.plaid_items(user_id);

-- Enable Row Level Security on plaid_items table
ALTER TABLE public.plaid_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own plaid items" ON public.plaid_items;
DROP POLICY IF EXISTS "Users can insert own plaid items" ON public.plaid_items;
DROP POLICY IF EXISTS "Users can update own plaid items" ON public.plaid_items;
DROP POLICY IF EXISTS "Users can delete own plaid items" ON public.plaid_items;

-- Policy: Users can only view their own plaid items
CREATE POLICY "Users can view own plaid items" 
  ON public.plaid_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own plaid items
CREATE POLICY "Users can insert own plaid items" 
  ON public.plaid_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own plaid items
CREATE POLICY "Users can update own plaid items" 
  ON public.plaid_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own plaid items
CREATE POLICY "Users can delete own plaid items" 
  ON public.plaid_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE TRIGGER TO AUTO-CREATE USER PROFILES
-- =====================================================
-- When a user signs up via Supabase Auth, automatically
-- create their profile in the public.users table

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 4. VERIFY SETUP
-- =====================================================
-- Run these queries to verify everything is set up correctly

-- Check if users table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- Check if plaid_items has user_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'plaid_items' 
  AND column_name = 'user_id';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'plaid_items');

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables and policies are created
-- 3. Configure Supabase Auth settings:
--    - Go to Authentication > Settings
--    - Disable "Enable email confirmations" for MVP
--    - Set Site URL to: http://localhost:3000
--    - Add Redirect URLs: http://localhost:3000/auth/callback
-- =====================================================
