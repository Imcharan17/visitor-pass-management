const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');
const BASE = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : 'http://localhost:5000/api';
export async function api(path, options = {}) {
  const token = localStorage.getItem('vp_token');
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { if (response.status === 401 && token) window.dispatchEvent(new CustomEvent('session-expired')); throw new Error(data.message || 'Request failed.'); }
  return data;
}
export function queryString(params) { const qs = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => v && qs.set(k, v)); const s = qs.toString(); return s ? `?${s}` : ''; }
