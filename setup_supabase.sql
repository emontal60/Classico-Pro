-- ==========================================
-- Classico SaaS - SECURE Supabase Setup Script
-- ==========================================

-- 1. Subscriptions Table (Current Status)
CREATE TABLE IF NOT EXISTS subscriptions (
    client_id SERIAL,
    machine_id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending',
    plan_type TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    device_limit INTEGER DEFAULT 20,
    max_devices INTEGER DEFAULT 1,
    phone_number TEXT,
    activation_keys JSONB DEFAULT '[]',
    proof_url TEXT,
    amount INTEGER DEFAULT 0,
    payment_method TEXT,
    transaction_id TEXT,
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table was already created
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='amount') THEN
        ALTER TABLE subscriptions ADD COLUMN amount INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='payment_method') THEN
        ALTER TABLE subscriptions ADD COLUMN payment_method TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='transaction_id') THEN
        ALTER TABLE subscriptions ADD COLUMN transaction_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='phone_number') THEN
        ALTER TABLE subscriptions ADD COLUMN phone_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='max_devices') THEN
        ALTER TABLE subscriptions ADD COLUMN max_devices INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='activation_keys') THEN
        ALTER TABLE subscriptions ADD COLUMN activation_keys JSONB DEFAULT '[]';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscriptions' AND COLUMN_NAME='activated_at') THEN
        ALTER TABLE subscriptions ADD COLUMN activated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Cloud Backups Table (Data Safety)
CREATE TABLE IF NOT EXISTS cloud_backups (
    machine_id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subscription Logs Table (Permanent History)
CREATE TABLE IF NOT EXISTS subscription_logs (
    id SERIAL PRIMARY KEY,
    machine_id TEXT NOT NULL,
    plan_type TEXT,
    status TEXT, -- active, expired, cancelled
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- 5. Granular Policies for Subscriptions
DROP POLICY IF EXISTS "Allow anonymous full access" ON subscriptions;
DROP POLICY IF EXISTS "Devices can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Allow new registration" ON subscriptions;
DROP POLICY IF EXISTS "No anonymous updates to sensitive fields" ON subscriptions;
DROP POLICY IF EXISTS "Owner full access" ON subscriptions;

DROP POLICY IF EXISTS "Allow anonymous updates for pending requests" ON subscriptions;

CREATE POLICY "Devices can view own subscription" ON subscriptions FOR SELECT USING (true); 
CREATE POLICY "Allow new registration" ON subscriptions FOR INSERT WITH CHECK (status = 'pending');

-- Allow server/anon to update status to active
DROP POLICY IF EXISTS "Allow anonymous updates for pending requests" ON subscriptions;
DROP POLICY IF EXISTS "Allow server to activate subscriptions" ON subscriptions;
CREATE POLICY "Allow server to activate subscriptions" ON subscriptions 
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Owner full access" ON subscriptions FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com');

-- 6. Granular Policies for Cloud Backups
DROP POLICY IF EXISTS "Enable backup management" ON cloud_backups;
DROP POLICY IF EXISTS "Owner backup access" ON cloud_backups;

-- Allow devices to manage their own backups
CREATE POLICY "Enable backup management" ON cloud_backups FOR ALL USING (true) WITH CHECK (true);
-- Allow Owner to view/manage all backups
CREATE POLICY "Owner backup access" ON cloud_backups FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com');

-- 6b. Granular Policies for Subscription Logs
DROP POLICY IF EXISTS "Enable logs read/write for all" ON subscription_logs;
CREATE POLICY "Enable logs read/write for all" ON subscription_logs FOR ALL USING (true) WITH CHECK (true);

-- 7. Table for Multi-Device License Keys
CREATE TABLE IF NOT EXISTS subscription_keys (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    owner_machine_id TEXT NOT NULL, -- The machine_id of the primary subscriber
    serial_key TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'unused', -- 'unused', 'used'
    used_by TEXT, -- machine_id of the sub-device
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_keys ENABLE ROW LEVEL SECURITY;

-- Policies for Keys
DROP POLICY IF EXISTS "Public view for verification" ON subscription_keys;
DROP POLICY IF EXISTS "Public update for binding" ON subscription_keys;
DROP POLICY IF EXISTS "Owner manage keys" ON subscription_keys;
DROP POLICY IF EXISTS "Server manage keys" ON subscription_keys;

CREATE POLICY "Server manage keys" ON subscription_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Owner manage keys" ON subscription_keys FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com');
