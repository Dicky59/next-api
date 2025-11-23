export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

