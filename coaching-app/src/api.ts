const BASE = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '/api';
const ACCESS_TOKEN_KEY = 'fitgoal.accessToken';

function authorizationHeaders(): Record<string, string> {
  const token = typeof window === 'undefined'
    ? null
    : window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setAccessToken(token: string): void {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function getErrorMessage(response: Response): Promise<string> {
  const body = await response.text();
  if (!body) return `Erreur ${response.status}`;

  try {
    const payload: unknown = JSON.parse(body);
    if (typeof payload === 'object' && payload !== null) {
      const error = payload as { detail?: unknown; message?: unknown };
      if (typeof error.detail === 'string') return error.detail;
      if (typeof error.message === 'string') return error.message;
    }
  } catch {
    // Utilise le message HTTP si le serveur ne renvoie pas de JSON.
  }

  return `Erreur ${response.status}`;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authorizationHeaders() });
  if (!res.ok) {
    if (res.status === 401) clearAccessToken();
    throw new Error(await getErrorMessage(res));
  }
  return res.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authorizationHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 401) clearAccessToken();
    throw new Error(await getErrorMessage(res));
  }
  return res.json() as Promise<T>;
}

export async function patchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: authorizationHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) clearAccessToken();
    throw new Error(await getErrorMessage(res));
  }
  return res.json() as Promise<T>;
}