import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
}

// Create a Supabase client with service role key for server-side operations
// This bypasses RLS (Row Level Security) for admin operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper to get user ID from request (you can implement auth later)
// For now, using a default user ID from env or a placeholder
export function getUserId(): string {
  // TODO: Replace with actual user authentication
  // For now, use environment variable or default
  return process.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000000";
}

