# Troubleshooting Supabase Schema Issues

## Error: "Could not find the 'user_id' column of 'api_keys' in the schema cache"

This error (PGRST204) means Supabase's PostgREST can't find the `user_id` column. Here's how to fix it:

### Step 1: Verify the Table Structure

Run this SQL in Supabase SQL Editor to check if the column exists:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'api_keys'
ORDER BY ordinal_position;
```

You should see:

- id (uuid)
- name (text)
- value (text)
- usage (integer)
- user_id (uuid)
- created_at (timestamp with time zone)
- last_used (timestamp with time zone)

### Step 2: If Column is Missing, Add It

If `user_id` is missing, add it:

```sql
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
```

### Step 3: Refresh Supabase Schema Cache

Supabase caches the schema. To refresh it:

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Click **"Reload schema"** or **"Refresh schema"** button
4. Wait a few seconds for the cache to refresh

Alternatively, you can restart your Supabase project (if you have access to project settings).

### Step 4: Verify Column Name Case

PostgreSQL/Supabase is case-sensitive for quoted identifiers. Make sure the column is lowercase `user_id`, not `User_ID` or `USER_ID`.

If you created it with quotes like `"user_id"`, you'll need to reference it the same way. The best practice is to use lowercase without quotes.

### Step 5: Recreate Table (If Needed)

If the above doesn't work, you can drop and recreate the table:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS api_keys CASCADE;

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  usage INTEGER DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_created_at ON api_keys(created_at DESC);
```

Then refresh the schema cache again.
