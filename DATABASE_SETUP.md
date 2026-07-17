# Database Setup & Configuration Guide

Since your application uses **Supabase** for storing users, groups, and leads, the appropriate database tables and functions must exist in your database instance before you can log in or register.

Follow these two simple steps to set up your database and connect it to your application.

---

## Step 1: Run the Database Migration SQL
Copy and run the following SQL script in your **Supabase SQL Editor** to create all the necessary tables, foreign key constraints, seed the super admin account, and set up the automatic auto-increment sequence sync RPC function:

```sql
-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  phone VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  can_create_group BOOLEAN DEFAULT FALSE,
  can_register_members BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Super Admin User (phone: 254775499650, password: admin123)
INSERT INTO users (phone, name, password, status, can_create_group, can_register_members)
VALUES ('254775499650', 'Super Admin', 'admin123', 'active', TRUE, TRUE)
ON CONFLICT (phone) DO UPDATE
SET name = EXCLUDED.name, password = EXCLUDED.password, status = EXCLUDED.status,
    can_create_group = TRUE, can_register_members = TRUE;

-- 3. Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_by_phone VARCHAR(50) REFERENCES users(phone) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country_name VARCHAR(255),
  country_code VARCHAR(10),
  dial_code VARCHAR(10),
  raw_number VARCHAR(50),
  full_number VARCHAR(50) NOT NULL,
  ref_user_phone VARCHAR(50) REFERENCES users(phone) ON DELETE CASCADE,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  exported BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  seen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  user_phone VARCHAR(50) REFERENCES users(phone) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_phone)
);

-- 6. Create group_requests table
CREATE TABLE IF NOT EXISTS group_requests (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  requested_by_phone VARCHAR(50) REFERENCES users(phone) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Sequence Sync Function (auto-heals leads PK sequence drift)
CREATE OR REPLACE FUNCTION sync_leads_sequence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM setval(pg_get_serial_sequence('leads', 'id'), coalesce(max(id), 0) + 1, false) FROM leads;
END;
$$;

-- 8. Create Bullet-proof Round-Robin Lead Assignment Function with Row Locks
CREATE OR REPLACE FUNCTION create_lead_with_round_robin(
  p_name VARCHAR,
  p_country_name VARCHAR,
  p_country_code VARCHAR,
  p_dial_code VARCHAR,
  p_raw_number VARCHAR,
  p_full_number VARCHAR,
  p_ref_user_phone VARCHAR,
  p_group_id INTEGER
)
RETURNS TABLE (
  out_lead_id INTEGER,
  out_created_at TIMESTAMP WITH TIME ZONE,
  out_assigned_phone VARCHAR,
  out_status VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_phone VARCHAR;
  v_lead_id INTEGER;
  v_created_at TIMESTAMP WITH TIME ZONE;
  v_dup_phone VARCHAR;
END;
$$;

-- Note: The above is a placeholder shell signature to allow dropping/recreating.
-- Below is the actual implementation:
CREATE OR REPLACE FUNCTION create_lead_with_round_robin(
  p_name VARCHAR,
  p_country_name VARCHAR,
  p_country_code VARCHAR,
  p_dial_code VARCHAR,
  p_raw_number VARCHAR,
  p_full_number VARCHAR,
  p_ref_user_phone VARCHAR,
  p_group_id INTEGER
)
RETURNS TABLE (
  out_lead_id INTEGER,
  out_created_at TIMESTAMP WITH TIME ZONE,
  out_assigned_phone VARCHAR,
  out_status VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_phone VARCHAR;
  v_lead_id INTEGER;
  v_created_at TIMESTAMP WITH TIME ZONE;
  v_dup_phone VARCHAR;
BEGIN
  -- 1. Duplicate check within group scope
  IF p_group_id IS NOT NULL THEN
    SELECT ref_user_phone INTO v_dup_phone
    FROM leads
    WHERE full_number = p_full_number AND group_id = p_group_id
    LIMIT 1;

    IF v_dup_phone IS NOT NULL THEN
      RETURN QUERY SELECT NULL::INTEGER, NULL::TIMESTAMP WITH TIME ZONE, v_dup_phone, 'duplicate'::VARCHAR;
      RETURN;
    END IF;
  END IF;

  -- 2. Resolve default/fallback phone
  v_assigned_phone := p_ref_user_phone;
  IF v_assigned_phone IS NULL OR v_assigned_phone = '' THEN
    v_assigned_phone := '254775499650';
  END IF;

  -- 3. Round-robin assignment if group_id is provided
  IF p_group_id IS NOT NULL THEN
    -- Lock the group_members rows using FOR UPDATE to serialize concurrent round-robin selections
    PERFORM 1 
    FROM group_members 
    WHERE group_id = p_group_id 
    FOR UPDATE;

    -- Query member with oldest last lead
    SELECT gm.user_phone INTO v_assigned_phone
    FROM group_members gm
    INNER JOIN users u ON gm.user_phone = u.phone
    LEFT JOIN (
      SELECT ref_user_phone, MAX(leads.created_at) as last_lead_time
      FROM leads
      WHERE group_id = p_group_id
      GROUP BY ref_user_phone
    ) l ON gm.user_phone = l.ref_user_phone
    WHERE gm.group_id = p_group_id AND u.status = 'active'
    ORDER BY COALESCE(l.last_lead_time, '-infinity'::timestamp with time zone) ASC, gm.user_phone ASC
    LIMIT 1;

    IF v_assigned_phone IS NULL THEN
      v_assigned_phone := COALESCE(p_ref_user_phone, '254775499650');
    END IF;
  END IF;

  -- 4. Try insertion with sequence synchronization on unique key failure
  BEGIN
    INSERT INTO leads (
      name,
      country_name,
      country_code,
      dial_code,
      raw_number,
      full_number,
      ref_user_phone,
      group_id
    ) VALUES (
      p_name,
      p_country_name,
      p_country_code,
      p_dial_code,
      p_raw_number,
      p_full_number,
      v_assigned_phone,
      p_group_id
    )
    RETURNING id, leads.created_at INTO v_lead_id, v_created_at;
  EXCEPTION WHEN unique_violation THEN
    -- Auto-heal leads primary key sequence drift
    PERFORM sync_leads_sequence();
    INSERT INTO leads (
      name,
      country_name,
      country_code,
      dial_code,
      raw_number,
      full_number,
      ref_user_phone,
      group_id
    ) VALUES (
      p_name,
      p_country_name,
      p_country_code,
      p_dial_code,
      p_raw_number,
      p_full_number,
      v_assigned_phone,
      p_group_id
    )
    RETURNING id, leads.created_at INTO v_lead_id, v_created_at;
  END;

  RETURN QUERY SELECT v_lead_id, v_created_at, v_assigned_phone, 'success'::VARCHAR;
END;
$$;


```

---

## Step 2: Configure Environment Secrets in AI Studio

To allow the application container to communicate with your database, you must configure your secrets in **Google AI Studio**.

1. In the **Google AI Studio** workspace for your app, open the **Settings** menu or **Secrets / Environment Variables** panel.
2. Add the following keys and paste the values you provided:

| Secret Name | Value | Description |
|---|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `SUPABASE_SECRET_KEY` | `YOUR_SUPABASE_SECRET_KEY` | Your Supabase service role / secret key |
| `SUPABASE_PUBLISHABLE_KEY` | `YOUR_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon / publishable key |
| `SUPABASE_JWKS_URL` | `https://your-project.supabase.co/auth/v1/.well-known/jwks.json` | JWKS endpoint for validating user tokens |

3. Save the secrets and redeploy or refresh your dev preview.

---

## Log In Credentials (Default Admin)
Once Step 1 and Step 2 are completed, you will be able to log in using the pre-seeded credentials:
* **Phone Number**: `254775499650` (or `0775499650`)
* **Password**: `admin123`

You can also register new user accounts using the registration screen inside the application.
