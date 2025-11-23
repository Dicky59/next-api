// Shared storage for API keys
// In production, replace this with a database

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

// Use a global variable to persist across hot reloads in development
// This prevents the array from being reset during Next.js hot module reloading
declare global {

  var __apiKeys__: ApiKey[] | undefined;
}

// Initialize storage - persist across hot reloads in development
const getApiKeys = (): ApiKey[] => {
  if (!globalThis.__apiKeys__) {
    globalThis.__apiKeys__ = [];
  }
  return globalThis.__apiKeys__;
};

const apiKeys = getApiKeys();

export function getAllKeys(): ApiKey[] {
  return [...apiKeys];
}

export function getKeyById(id: string): ApiKey | undefined {
  return apiKeys.find((k) => k.id === id);
}

export function createKey(name: string, key: string): ApiKey {
  const newKey: ApiKey = {
    id: crypto.randomUUID(),
    name,
    key,
    createdAt: new Date().toISOString(),
  };
  apiKeys.push(newKey);
  return newKey;
}

export function updateKey(id: string, name: string): ApiKey | null {
  const keyIndex = apiKeys.findIndex((k) => k.id === id);
  if (keyIndex === -1) return null;
  apiKeys[keyIndex] = {
    ...apiKeys[keyIndex],
    name,
  };
  return apiKeys[keyIndex];
}

export function deleteKey(id: string): boolean {
  const keyIndex = apiKeys.findIndex((k) => k.id === id);
  if (keyIndex === -1) return false;
  apiKeys.splice(keyIndex, 1);
  return true;
}

// Generate a random API key
export function generateApiKey(): string {
  const prefix = "sk_";
  const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${randomPart}`;
}



