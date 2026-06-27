const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Wrapper fetch dengan error handling terpusat.
 * Lempar Error dengan message dari API jika response tidak OK.
 */
async function apiFetch(path, { body, token, ...rest } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Server error ${res.status}`);
  }

  return data;
}

export const api = {
  get: (path, token) => apiFetch(path, { method: "GET", token }),
  post: (path, body, token) => apiFetch(path, { method: "POST", body, token }),
};
