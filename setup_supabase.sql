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
    action TEXT, -- approved, rejected, deleted
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure action column exists if table was already created
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscription_logs' AND COLUMN_NAME='action') THEN
        ALTER TABLE subscription_logs ADD COLUMN action TEXT;
    END IF;
END $$;

-- 7. Table for Multi-Device License Keys
CREATE TABLE IF NOT EXISTS subscription_keys (
    id SERIAL PRIMARY KEY,
    owner_machine_id TEXT NOT NULL, -- معرف الجهاز الرئيسي
    serial_key TEXT UNIQUE NOT NULL, -- كود التفعيل
    status TEXT DEFAULT 'unused', -- unused أو used
    used_by TEXT, -- معرف الجهاز الذي استخدم الكود
    device_name TEXT, -- اسم الجهاز/الفرع
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- تاريخ انتهاء الاشتراك
);

-- Ensure device_name column exists if table was already created
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='subscription_keys' AND COLUMN_NAME='device_name') THEN
        ALTER TABLE subscription_keys ADD COLUMN device_name TEXT;
    END IF;
END $$;


-- 4. Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_keys ENABLE ROW LEVEL SECURITY;


-- 5. SECURE RLS Policies for Subscriptions
DROP POLICY IF EXISTS "Allow anonymous full access" ON subscriptions;
DROP POLICY IF EXISTS "Devices can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Allow new registration" ON subscriptions;
DROP POLICY IF EXISTS "No anonymous updates to sensitive fields" ON subscriptions;
DROP POLICY IF EXISTS "Owner full access" ON subscriptions;
DROP POLICY IF EXISTS "Allow anonymous updates for pending requests" ON subscriptions;
DROP POLICY IF EXISTS "Allow server to activate subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow public delete subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Allow public update subscriptions" ON subscriptions;

-- Owner has absolute access (authenticated via email)
CREATE POLICY "Owner full access" ON subscriptions 
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com');

-- Devices can only see their own subscription via x-machine-id header (or sub-devices checking their owner's subscription)
CREATE POLICY "Devices can view own subscription" ON subscriptions 
FOR SELECT TO anon 
USING (
    machine_id = (current_setting('request.headers', true)::json->>'x-machine-id')
    OR
    machine_id IN (
        SELECT owner_machine_id 
        FROM subscription_keys 
        WHERE used_by = (current_setting('request.headers', true)::json->>'x-machine-id')
    )
); 

-- Allow anyone to request a new subscription, but it must be pending
CREATE POLICY "Allow new registration" ON subscriptions 
FOR INSERT TO anon 
WITH CHECK (status = 'pending');

-- Devices can delete their own subscription record (e.g. factory reset)
CREATE POLICY "Allow public delete subscriptions" ON subscriptions 
FOR DELETE TO anon 
USING (machine_id = (current_setting('request.headers', true)::json->>'x-machine-id'));

-- Devices can update their heartbeat/details BUT cannot change status or expires_at unless already active
CREATE POLICY "Allow public update subscriptions" ON subscriptions 
FOR UPDATE TO anon 
USING (machine_id = (current_setting('request.headers', true)::json->>'x-machine-id'))
WITH CHECK (
    machine_id = (current_setting('request.headers', true)::json->>'x-machine-id') AND
    (status = (SELECT status FROM subscriptions WHERE machine_id = (current_setting('request.headers', true)::json->>'x-machine-id'))) AND
    (expires_at = (SELECT expires_at FROM subscriptions WHERE machine_id = (current_setting('request.headers', true)::json->>'x-machine-id')))
);


-- Helper function to check cross-device access within the same subscription group
CREATE OR REPLACE FUNCTION has_backup_access(requester TEXT, target TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
    req_owner TEXT;
    tgt_owner TEXT;
    tgt_clean TEXT;
BEGIN
    IF requester IS NULL OR requester = '' THEN
        RETURN FALSE;
    END IF;

    -- 1. Direct match
    IF requester = target THEN
        RETURN TRUE;
    END IF;

    -- 2. Handle shared users row pattern
    IF target LIKE 'shared_users_%' THEN
        tgt_clean := substring(target from 14);
    ELSE
        tgt_clean := target;
    END IF;

    -- 3. If requester is owner of the shared users / backup target
    IF requester = tgt_clean THEN
        RETURN TRUE;
    END IF;

    -- 4. Get owner of the requester device
    SELECT owner_machine_id INTO req_owner FROM subscription_keys WHERE used_by = requester LIMIT 1;
    IF req_owner IS NULL THEN
        req_owner := requester;
    END IF;

    -- 5. Get owner of the target device
    SELECT owner_machine_id INTO tgt_owner FROM subscription_keys WHERE used_by = tgt_clean LIMIT 1;
    IF tgt_owner IS NULL THEN
        tgt_owner := tgt_clean;
    END IF;

    -- 6. Grant access if they belong to the same subscription owner
    IF req_owner = tgt_owner THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 6. SECURE RLS Policies for Cloud Backups
DROP POLICY IF EXISTS "Enable backup management" ON cloud_backups;
DROP POLICY IF EXISTS "Owner backup access" ON cloud_backups;
DROP POLICY IF EXISTS "Devices can manage own backups" ON cloud_backups;

-- Owner has absolute access
CREATE POLICY "Owner backup access" ON cloud_backups 
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com');

-- Devices can ONLY read and write their own backup or backups in their subscription group
CREATE POLICY "Devices can manage own backups" ON cloud_backups 
FOR ALL TO anon 
USING (has_backup_access(
    (current_setting('request.headers', true)::json->>'x-machine-id'),
    machine_id
)) 
WITH CHECK (has_backup_access(
    (current_setting('request.headers', true)::json->>'x-machine-id'),
    machine_id
));


-- 7. SECURE RLS Policies for Subscription Keys
DROP POLICY IF EXISTS "Public view for verification" ON subscription_keys;
DROP POLICY IF EXISTS "Public update for binding" ON subscription_keys;
DROP POLICY IF EXISTS "Owner manage keys" ON subscription_keys;
DROP POLICY IF EXISTS "Server manage keys" ON subscription_keys;
DROP POLICY IF EXISTS "Allow public delete keys" ON subscription_keys;
DROP POLICY IF EXISTS "Devices can select keys" ON subscription_keys;
DROP POLICY IF EXISTS "Devices can update own keys" ON subscription_keys;

-- Owner has absolute access
CREATE POLICY "Owner manage keys" ON subscription_keys 
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'emontal.33@yahoo.com');

-- Devices can only see unused keys (for verification) or keys they currently bind/own
CREATE POLICY "Devices can select keys" ON subscription_keys 
FOR SELECT TO anon 
USING (
    status = 'unused' OR 
    used_by = (current_setting('request.headers', true)::json->>'x-machine-id') OR 
    owner_machine_id = (current_setting('request.headers', true)::json->>'x-machine-id')
);

-- Devices can update key status to bind to it, or the owner machine can unlink/rename it
CREATE POLICY "Devices can update own keys" ON subscription_keys 
FOR UPDATE TO anon 
USING (
    owner_machine_id = (current_setting('request.headers', true)::json->>'x-machine-id') OR 
    status = 'unused'
) 
WITH CHECK (
    owner_machine_id = (current_setting('request.headers', true)::json->>'x-machine-id') OR 
    used_by = (current_setting('request.headers', true)::json->>'x-machine-id')
);

-- Owner machine can delete its own sub-keys
CREATE POLICY "Allow public delete keys" ON subscription_keys 
FOR DELETE TO anon 
USING (owner_machine_id = (current_setting('request.headers', true)::json->>'x-machine-id'));


-- 8. SECURE RLS Policies for Subscription Logs
DROP POLICY IF EXISTS "Enable logs read/write for all" ON subscription_logs;
DROP POLICY IF EXISTS "Allow public insert logs" ON subscription_logs;
DROP POLICY IF EXISTS "Devices can insert logs" ON subscription_logs;
DROP POLICY IF EXISTS "Devices can view own logs" ON subscription_logs;

-- Devices can only insert logs for themselves
CREATE POLICY "Devices can insert logs" ON subscription_logs 
FOR INSERT TO anon 
WITH CHECK (machine_id = (current_setting('request.headers', true)::json->>'x-machine-id'));

-- Devices can only read logs for themselves
CREATE POLICY "Devices can view own logs" ON subscription_logs 
FOR SELECT TO anon 
USING (machine_id = (current_setting('request.headers', true)::json->>'x-machine-id'));


-- ==========================================================
-- SECURE PUBLIC TOURNAMENT REGISTRATION RPC FUNCTIONS
-- ==========================================================

-- Function 1: Fetch sanitized tournament details for public registration (No financial leak)
CREATE OR REPLACE FUNCTION get_public_tournament(target_machine_id TEXT, target_tournament_id TEXT)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
    backup_data JSONB;
    tour_item JSONB;
    found_tour JSONB;
BEGIN
    SELECT data INTO backup_data FROM cloud_backups WHERE machine_id = target_machine_id;
    IF backup_data IS NULL THEN
        RETURN NULL;
    END IF;

    found_tour := NULL;

    FOR tour_item IN SELECT jsonb_array_elements(backup_data->'classico_tournaments') LOOP
        IF target_tournament_id IS NOT NULL AND target_tournament_id != '' THEN
            IF tour_item->>'id' = target_tournament_id THEN
                found_tour := tour_item;
                EXIT;
            END IF;
        ELSE
            -- No ID specified, find the first in 'registration' status, or 'active', or fallback to the last one
            IF tour_item->>'status' = 'registration' THEN
                found_tour := tour_item;
                EXIT;
            ELSIF tour_item->>'status' = 'active' AND found_tour IS NULL THEN
                found_tour := tour_item;
            ELSIF found_tour IS NULL THEN
                found_tour := tour_item;
            END IF;
        END IF;
    END LOOP;

    IF found_tour IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN jsonb_build_object(
        'id', found_tour->'id',
        'name', found_tour->'name',
        'fee', found_tour->'fee',
        'maxPlayers', found_tour->'maxPlayers',
        'type', found_tour->'type',
        'status', found_tour->'status',
        'paymentMethod', found_tour->'paymentMethod',
        'paymentNumberCash', found_tour->'paymentNumberCash',
        'paymentNumberInstapay', found_tour->'paymentNumberInstapay',
        'paymentNumberWallet', found_tour->'paymentNumberWallet',
        'players', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', p->'id',
                    'nickname', p->'nickname',
                    'logoId', p->'logoId',
                    'isPendingApproval', p->'isPendingApproval'
                )
            ), '[]'::jsonb)
            FROM jsonb_array_elements(CASE WHEN jsonb_typeof(found_tour->'players') = 'array' THEN found_tour->'players' ELSE '[]'::jsonb END) p
        )
    );
END;
$$ LANGUAGE plpgsql;


-- Function 2: Transactional server-side player registration (Handles duplicate check & avoids race conditions)
CREATE OR REPLACE FUNCTION register_public_player(
    target_machine_id TEXT,
    target_tournament_id TEXT,
    new_player JSONB
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
    backup_row RECORD;
    backup_data JSONB;
    tournaments_list JSONB;
    tour_item JSONB;
    tour_idx INT;
    players_list JSONB;
    player_item JSONB;
    t_id TEXT;
    max_players INT;
    nickname TEXT;
    phone TEXT;
BEGIN
    -- Select backup row for update to lock it and prevent concurrent registration race conditions
    SELECT * INTO backup_row FROM cloud_backups WHERE machine_id = target_machine_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'لم يتم العثور على قاعدة بيانات الصالة.');
    END IF;

    backup_data := backup_row.data;
    tournaments_list := backup_data->'classico_tournaments';
    IF tournaments_list IS NULL OR jsonb_array_length(tournaments_list) = 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'لا توجد بطولات نشطة في الصالة حالياً.');
    END IF;

    -- Find target tournament index
    tour_idx := -1;
    FOR i IN 0..jsonb_array_length(tournaments_list) - 1 LOOP
        tour_item := tournaments_list->i;
        IF tour_item->>'id' = target_tournament_id THEN
            tour_idx := i;
            EXIT;
        END IF;
    END LOOP;

    IF tour_idx = -1 THEN
        RETURN jsonb_build_object('success', false, 'message', 'البطولة غير موجودة أو تم حذفها.');
    END IF;

    tour_item := tournaments_list->tour_idx;
    IF tour_item->>'status' != 'registration' THEN
        RETURN jsonb_build_object('success', false, 'message', 'عذراً، التسجيل في هذه البطولة مغلق حالياً.');
    END IF;

    players_list := tour_item->'players';
    IF players_list IS NULL OR jsonb_typeof(players_list) != 'array' THEN
        players_list := '[]'::jsonb;
    END IF;

    max_players := (tour_item->>'maxPlayers')::int;
    IF jsonb_array_length(players_list) >= max_players THEN
        RETURN jsonb_build_object('success', false, 'message', 'عذراً، البطولة مكتملة العدد بالفعل ولا يمكن قبول تسجيل إضافي.');
    END IF;

    -- Uniqueness Validation
    nickname := lower(trim(new_player->>'nickname'));
    phone := trim(new_player->>'phone');

    FOR i IN 0..jsonb_array_length(players_list) - 1 LOOP
        player_item := players_list->i;
        IF lower(trim(player_item->>'nickname')) = nickname THEN
            RETURN jsonb_build_object('success', false, 'message', 'هذا الاسم المستعار مسجل بالفعل! يرجى اختيار اسم مستعار آخر.');
        END IF;
        IF trim(player_item->>'phone') = phone THEN
            RETURN jsonb_build_object('success', false, 'message', 'رقم الهاتف هذا مسجل بالفعل في هذه البطولة!');
        END IF;
    END LOOP;

    -- Append new player to array
    players_list := players_list || jsonb_build_array(new_player);
    tour_item := jsonb_set(tour_item, '{players}', players_list);
    
    -- Put back updated tournament in list
    tournaments_list := jsonb_set(tournaments_list, array[tour_idx::text], tour_item);
    backup_data := jsonb_set(backup_data, '{classico_tournaments}', tournaments_list);

    -- Write back and save
    UPDATE cloud_backups 
    SET data = backup_data, updated_at = NOW() 
    WHERE machine_id = target_machine_id;

    -- Return success and sanitized tournament object for UI sync
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'تم التسجيل بنجاح!', 
        'tournament', jsonb_build_object(
            'id', tour_item->'id',
            'name', tour_item->'name',
            'fee', tour_item->'fee',
            'maxPlayers', tour_item->'maxPlayers',
            'type', tour_item->'type',
            'status', tour_item->'status',
            'paymentMethod', tour_item->'paymentMethod',
            'paymentNumberCash', tour_item->'paymentNumberCash',
            'paymentNumberInstapay', tour_item->'paymentNumberInstapay',
            'paymentNumberWallet', tour_item->'paymentNumberWallet',
            'players', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', p->'id',
                        'nickname', p->'nickname',
                        'logoId', p->'logoId',
                        'isPendingApproval', p->'isPendingApproval'
                    )
                )
                FROM jsonb_array_elements(tour_item->'players') p
            )
        )
    );
END;
$$ LANGUAGE plpgsql;
