import { getUserId, supabase } from "@/lib/supabase";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

// Database row interface (matches Supabase schema)
interface ApiKeyRow {
  id: string;
  name: string;
  value: string;
  usage: number;
  user_id: string;
  created_at: string;
  last_used?: string;
}

// Convert database row to ApiKey interface
function rowToApiKey(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    name: row.name,
    key: row.value,
    createdAt: row.created_at,
    lastUsed: row.last_used || undefined,
  };
}

// Get all API keys for the current user
export async function getAllKeys(): Promise<ApiKey[]> {
  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      throw error;
    }

    return (data || []).map(rowToApiKey);
  } catch (error) {
    console.error("Failed to get all keys:", error);
    throw error;
  }
}

// Get a specific API key by ID
export async function getKeyById(id: string): Promise<ApiKey | null> {
  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching API key:", error);
      throw error;
    }

    return data ? rowToApiKey(data as ApiKeyRow) : null;
  } catch (error) {
    console.error("Failed to get key by ID:", error);
    throw error;
  }
}

// Create a new API key
export async function createKey(name: string, key: string): Promise<ApiKey> {
  try {
    const userId = getUserId();
    const newKey: Omit<ApiKeyRow, "id" | "created_at"> = {
      name,
      value: key,
      usage: 0,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from("api_keys")
      .insert(newKey)
      .select()
      .single();

    if (error) {
      console.error("Error creating API key:", error);
      throw error;
    }

    return rowToApiKey(data as ApiKeyRow);
  } catch (error) {
    console.error("Failed to create key:", error);
    throw error;
  }
}

// Update an API key (name only for now)
export async function updateKey(
  id: string,
  name: string
): Promise<ApiKey | null> {
  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from("api_keys")
      .update({ name })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error updating API key:", error);
      throw error;
    }

    return data ? rowToApiKey(data as ApiKeyRow) : null;
  } catch (error) {
    console.error("Failed to update key:", error);
    throw error;
  }
}

// Delete an API key
export async function deleteKey(id: string): Promise<boolean> {
  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("Error deleting API key:", error);
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error("Failed to delete key:", error);
    throw error;
  }
}

// Generate a random API key
export function generateApiKey(): string {
  const prefix = "dick_";
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${randomPart}`;
}

// Increment usage count for an API key
export async function incrementUsage(id: string): Promise<void> {
  try {
    const userId = getUserId();
    const { error } = await supabase.rpc("increment_api_key_usage", {
      key_id: id,
      user_id: userId,
    });

    // If RPC function doesn't exist, use a manual update
    if (error && error.code === "42883") {
      const { data: currentKey } = await supabase
        .from("api_keys")
        .select("usage")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (currentKey) {
        await supabase
          .from("api_keys")
          .update({
            usage: (currentKey.usage || 0) + 1,
            last_used: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("user_id", userId);
      }
    } else if (error) {
      console.error("Error incrementing usage:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to increment usage:", error);
    // Don't throw - usage tracking failure shouldn't break the app
  }
}
