# Supabase Setup Guide

## Database Schema

Create a table called `api_keys` in your Supabase database with the following columns:

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  usage INTEGER DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ -- Optional: tracks when the key was last used
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Create an index on created_at for sorting
CREATE INDEX idx_api_keys_created_at ON api_keys(created_at DESC);
```

## Environment Variables

Create a `.env.local` file in the root of your project with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DEFAULT_USER_ID=your_user_uuid_here
```

### Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **service_role** key (keep this secret!) → `SUPABASE_SERVICE_ROLE_KEY`

## Row Level Security (RLS)

If you want to enable RLS, create a policy:

```sql
-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own keys
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own keys
CREATE POLICY "Users can insert their own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own keys
CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own keys
CREATE POLICY "Users can delete their own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid() = user_id);
```

**Note:** If you enable RLS, you'll need to use the anon key instead of the service_role key for client-side operations, or ensure your server-side code properly authenticates requests.

## Authentication Integration

Currently, the code uses a `DEFAULT_USER_ID` environment variable. To integrate with Supabase Auth:

1. Install `@supabase/auth-helpers-nextjs` or use Supabase Auth
2. Update `lib/supabase.ts` to get the user ID from the authenticated session
3. Update `getUserId()` function to extract user ID from request headers/cookies

## Testing

After setting up:

1. Start your development server: `npm run dev`
2. Create an API key through the dashboard
3. Verify it appears in your Supabase database
