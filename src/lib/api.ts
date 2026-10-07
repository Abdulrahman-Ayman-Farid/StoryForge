import { User, CreateUserInput, UpdateUserInput } from "@/types/user";

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, error.error || "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  users: {
    getAll: () => fetchApi<{ data: User[] }>("/api/users"),
    getById: (id: string) => fetchApi<{ data: User }>(`/api/users/${id}`),
    create: (input: CreateUserInput) =>
      fetchApi<{ data: User }>("/api/users", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: UpdateUserInput) =>
      fetchApi<{ data: User }>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    delete: (id: string) =>
      fetchApi<void>(`/api/users/${id}`, { method: "DELETE" }),
  },
  health: () => fetchApi<{ ok: boolean; timestamp: string }>("/api/health"),
};
