const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(
      payload?.error?.message || payload?.error || payload?.message || 'Request failed'
    );
  }
  if (res.status === 204) return null;
  const payload = await res.json();
  // Unwrap InvoiceLab-style { success, data } envelope
  return payload?.data !== undefined ? payload.data : payload;
}

export const api = {
  get:    (path)       => http(path),
  post:   (path, body) => http(path, { method: 'POST',   body }),
  put:    (path, body) => http(path, { method: 'PUT',    body }),
  delete: (path)       => http(path, { method: 'DELETE' }),
};
