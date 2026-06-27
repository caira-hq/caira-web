/**
 * Manajemen state autentikasi & invoice di localStorage.
 * Semua fungsi aman dipanggil di SSR (cek typeof window).
 */

const AUTH_KEY = "caira_auth";
const invoicesKey = (userId) => `caira_invoices_${userId}`;

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** @returns {{ token: string, user: { id, display_name, stellar_wallet } } | null} */
export function getAuth() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

export function setAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

// ─── Invoice cache (per user) ─────────────────────────────────────────────────

export function getInvoices(userId) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(invoicesKey(userId))) || [];
  } catch {
    return [];
  }
}

export function addInvoice(userId, invoice) {
  const list = getInvoices(userId);
  // Cegah duplikat
  const updated = [
    invoice,
    ...list.filter((i) => i.invoice_code !== invoice.invoice_code),
  ];
  localStorage.setItem(invoicesKey(userId), JSON.stringify(updated));
}

export function patchInvoiceStatus(userId, code, status) {
  const list = getInvoices(userId);
  const updated = list.map((i) =>
    i.invoice_code === code ? { ...i, status } : i
  );
  localStorage.setItem(invoicesKey(userId), JSON.stringify(updated));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format wallet address pendek: GABC…WXYZ */
export function shortWallet(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
