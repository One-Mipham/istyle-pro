const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await res.json();

  if (!res.ok) {
    throw new ApiRequestError(body.message ?? 'Request failed', body.statusCode ?? res.status, body.error);
  }

  return body as T;
}

export class ApiRequestError extends Error {
  constructor(message: string, public statusCode: number, public code: string) {
    super(message);
  }
}
