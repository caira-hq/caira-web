"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../lib/api";
import {
  getAuth,
  clearAuth,
  getInvoices,
  patchInvoiceStatus,
  shortWallet,
} from "../../lib/auth";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

// ── Helpers ───────────────────────────────────────────────────────────────────

const IDN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd} ${IDN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatXlm(val) {
  const n = Number(val);
  if (isNaN(n)) return "0";
  // Remove trailing zeros but keep up to 7 decimal places
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7,
  });
}

const PAY_BASE = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/pay";

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`${className} animate-spin`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      className="w-16 h-16 text-indigo-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function XlmIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function PaidIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-4">
        <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-28 bg-slate-100 rounded animate-pulse mb-1.5" />
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 border rounded-xl px-4 py-3 text-sm font-medium shadow-lg max-w-xs ${styles[type] ?? styles.info}`}
    >
      {type === "success" && (
        <CheckIcon className="w-4 h-4 shrink-0 text-green-600" />
      )}
      {type === "error" && (
        <svg
          className="w-4 h-4 shrink-0 text-red-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 opacity-60 hover:opacity-100 transition"
        aria-label="Tutup notifikasi"
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [auth, setAuthState] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  // Map of invoice_code → true while its copy timer is active
  const [copiedCodes, setCopiedCodes] = useState({});
  // The single invoice_code currently being verified
  const [verifyingCode, setVerifyingCode] = useState(null);
  // { message: string, type: 'success'|'error'|'info' } | null
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Mount: auth check + load invoices ──────────────────────────────────────

  useEffect(() => {
    const a = getAuth();
    if (!a) {
      window.location.href = "/login";
      return;
    }
    setAuthState(a);

    const cached = getInvoices(a.user.id);
    // Show cached data immediately so the page isn't blank
    setInvoices(cached);

    if (cached.length === 0) {
      setLoading(false);
      return;
    }

    // Re-fetch fresh status for every invoice in parallel
    Promise.allSettled(
      cached.map((inv) =>
        api.get("/invoices/" + inv.invoice_code).then((res) => ({
          code: inv.invoice_code,
          status: res.data?.status ?? inv.status,
        })),
      ),
    ).then((results) => {
      setInvoices((prev) =>
        prev.map((inv) => {
          const hit = results.find(
            (r) =>
              r.status === "fulfilled" && r.value.code === inv.invoice_code,
          );
          return hit ? { ...inv, status: hit.value.status } : inv;
        }),
      );
      setLoading(false);
    });
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const totalRevenue = paidInvoices.reduce(
    (sum, i) => sum + Number(i.amount_xlm || 0),
    0,
  );

  // ── Action handlers ───────────────────────────────────────────────────────

  async function handleCopy(code) {
    const url = `${PAY_BASE}/${code}`;
    console.log("Copying URL:", url);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedCodes((prev) => ({ ...prev, [code]: true }));
    setTimeout(
      () =>
        setCopiedCodes((prev) => {
          const n = { ...prev };
          delete n[code];
          return n;
        }),
      2000,
    );
  }

  async function handleVerify(code) {
    if (!auth || verifyingCode) return;
    setVerifyingCode(code);
    try {
      const res = await api.post(`/invoices/${code}/verify`, {}, auth.token);
      // Determine new status from response
      const newStatus = res.invoice?.status ?? (res.success ? "PAID" : null);
      if (newStatus) {
        patchInvoiceStatus(auth.user.id, code, newStatus);
        setInvoices((prev) =>
          prev.map((i) =>
            i.invoice_code === code ? { ...i, status: newStatus } : i,
          ),
        );
      }
      showToast(res.message || "Pembayaran berhasil dikonfirmasi!", "success");
    } catch (err) {
      showToast(err.message || "Gagal memeriksa pembayaran.", "error");
    } finally {
      setVerifyingCode(null);
    }
  }

  function handleLogout() {
    clearAuth();
    window.location.href = "/login";
  }

  // ── Guard: still redirecting ───────────────────────────────────────────────

  if (!auth) return null;

  const initials = auth.user.display_name?.[0]?.toUpperCase() ?? "U";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ── Profile Drawer (slide-in dari kanan) ───────────────────────────── */}
      {profileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setProfileOpen(false)}
          />
          {/* Panel */}
          <aside className="fixed top-0 right-0 h-full w-80 max-w-full z-50 bg-white shadow-2xl flex flex-col">
            {/* Header panel */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 pt-8 pb-6 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-white/5 rounded-full" />
              <button
                onClick={() => setProfileOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition"
                aria-label="Tutup"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {/* Avatar besar */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3 relative">
                <span className="text-white font-black text-2xl select-none">
                  {initials}
                </span>
              </div>
              <h2 className="text-white font-bold text-lg leading-tight">
                {auth.user.display_name}
              </h2>
              <p className="text-indigo-200 text-xs mt-0.5">Merchant Caira</p>
            </div>

            {/* Body panel */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Stellar Wallet */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Stellar Wallet
                </p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="font-mono text-xs text-slate-700 break-all leading-relaxed">
                    {auth.user.stellar_wallet}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(auth.user.stellar_wallet)
                  }
                  className="mt-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
                >
                  Salin alamat
                </button>
              </div>

              {/* Network */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Jaringan
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Testnet
                  </span>
                  <span className="text-xs text-slate-400">
                    Stellar Test Network
                  </span>
                </div>
              </div>

              {/* Stats ringkas */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ringkasan Akun
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-indigo-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-indigo-600">
                      {invoices.length}
                    </p>
                    <p className="text-xs text-indigo-400 mt-0.5">
                      Total Invoice
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-green-600">
                      {paidInvoices.length}
                    </p>
                    <p className="text-xs text-green-400 mt-0.5">Lunas</p>
                  </div>
                  <div className="col-span-2 bg-purple-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-purple-600">
                      {formatXlm(totalRevenue)} XLM
                    </p>
                    <p className="text-xs text-purple-400 mt-0.5">
                      Total Pendapatan
                    </p>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="pt-1">
                <Link
                  href="https://laboratory.stellar.org/#account-creator?network=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 py-2 border-b border-slate-100 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Isi Saldo Testnet (gratis)
                </Link>
                <Link
                  href="https://stellar.expert/explorer/testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 py-2 border-b border-slate-100 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Lihat Transaksi di Explorer
                </Link>
              </div>
            </div>

            {/* Footer panel */}
            <div className="px-6 py-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-xl py-2.5 transition"
              >
                <LogoutIcon />
                Keluar dari Caira
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              
              {/* Bagian Kiri: Logo + Testnet badge */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Caira Logo" 
                  width={66} // Diubah dari 100 ke 36 agar muat di navbar
                  height={66}
                  className="object-contain"
                />
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full ml-1">
                  Testnet
                </span>
              </Link>
      
              {/* Bagian Kanan: Nama + Avatar (Klik buka profile) */}
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2.5 hover:bg-slate-50 rounded-2xl px-3 py-1.5 transition group"
                aria-label="Lihat profil"
              >
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  {/* Tambahkan optional chaining (?) untuk berjaga-jaga jika data user telat dimuat */}
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                    {auth?.user?.display_name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {shortWallet(auth?.user?.stellar_wallet)}
                  </span>
                </div>
                
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow shadow-indigo-200 ring-2 ring-white group-hover:ring-indigo-200 transition">
                  <span className="text-white font-bold text-sm select-none">
                    {initials}
                  </span>
                </div>
              </button>
      
            </div>
          </nav>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading + primary CTA */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Kelola invoice &amp; pembayaran Anda
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm shadow-lg shadow-indigo-200/60 shrink-0"
          >
            <PlusIcon />
            Buat Tagihan
          </Link>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Card: Total Invoice */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <InvoiceIcon />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Total Invoice</p>
              <p className="text-2xl font-black text-indigo-600 leading-tight">
                {invoices.length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Semua tagihan</p>
            </div>
          </div>

          {/* Card: Total Pendapatan */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <XlmIcon />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Total Pendapatan (XLM)</p>
              <p className="text-2xl font-black text-purple-600 leading-tight truncate">
                {formatXlm(totalRevenue)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Dari tagihan lunas
              </p>
            </div>
          </div>

          {/* Card: Sudah Lunas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <PaidIcon />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Sudah Lunas</p>
              <p className="text-2xl font-black text-green-600 leading-tight">
                {paidInvoices.length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Dari {invoices.length} tagihan
              </p>
            </div>
          </div>
        </div>

        {/* ── Invoice table card ────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-800">Daftar Tagihan</h2>
            <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5 font-medium">
              {invoices.length} tagihan
            </span>
          </div>

          {/* ── Loading skeleton ─────────────────────────────────────────── */}
          {loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["Status", "Klien", "Jumlah", "Tanggal", "Aksi"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </tbody>
              </table>
            </div>
          )}

          {/* ── Empty state ──────────────────────────────────────────────── */}
          {!loading && invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <FileIcon />
              <h3 className="mt-5 text-lg font-bold text-slate-700">
                Belum ada tagihan
              </h3>
              <p className="text-slate-400 text-sm mt-1.5 max-w-xs leading-relaxed">
                Buat tagihan pertama Anda dan bagikan tautannya untuk mulai
                menerima pembayaran Stellar.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-6 flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-sm shadow-lg shadow-indigo-200/60"
              >
                <PlusIcon />
                Buat Tagihan Pertama
              </Link>
            </div>
          )}

          {/* ── Invoice table ─────────────────────────────────────────────── */}
          {!loading && invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["Status", "Klien", "Jumlah", "Tanggal", "Aksi"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const isPaid = inv.status === "PAID";
                    const isCopied = !!copiedCodes[inv.invoice_code];
                    const isVerifying = verifyingCode === inv.invoice_code;

                    return (
                      <tr
                        key={inv.invoice_code}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Status badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                              Lunas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                              Menunggu
                            </span>
                          )}
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">
                            {inv.client_name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {inv.client_email}
                          </p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-700">
                            {formatXlm(inv.amount_xlm)}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            XLM
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                          {formatDate(inv.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Copy payment link */}
                            <button
                              onClick={() => handleCopy(inv.invoice_code)}
                              className={`flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-2.5 py-1.5 transition whitespace-nowrap ${
                                isCopied
                                  ? "border-green-300 bg-green-50 text-green-700"
                                  : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600"
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <CheckIcon className="w-3.5 h-3.5" />
                                  Tersalin!
                                </>
                              ) : (
                                <>
                                  <CopyIcon />
                                  Salin Tautan
                                </>
                              )}
                            </button>

                            {/* Verify payment */}
                            <button
                              onClick={() => handleVerify(inv.invoice_code)}
                              disabled={
                                isVerifying || isPaid || !!verifyingCode
                              }
                              className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 text-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {isVerifying ? (
                                <>
                                  <Spinner className="w-3.5 h-3.5" />
                                  Memeriksa…
                                </>
                              ) : (
                                <>
                                  <RefreshIcon />
                                  Cek Bayar
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}
    </div>
  );
}
