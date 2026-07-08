"use client";

import { useState, useEffect, useId } from "react";
import { api } from "../../../lib/api";
import { getAuth, addInvoice } from "../../../lib/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAY_BASE = process.env.NEXT_PUBLIC_APP_URL+"/pay";

function payUrl(code) {
  return `${PAY_BASE}/${code}`;
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
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

function ChevronLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function CopyIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="w-14 h-14 text-green-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
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

function AlertIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Field components ──────────────────────────────────────────────────────────

function Label({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-slate-700 mb-1.5"
    >
      {children}
      {required && (
        <span className="text-indigo-500 ml-0.5" aria-hidden="true">*</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition bg-white";

// ── Success card ──────────────────────────────────────────────────────────────

function SuccessCard({ invoice, onReset }) {
  const [copied, setCopied] = useState(false);
  const url = payUrl(invoice.invoice_code);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon */}
      <div className="mb-4">
        <CheckCircleIcon />
      </div>

      <h2 className="text-xl font-black text-slate-900 mb-1">
        Tagihan Berhasil Dibuat!
      </h2>
      <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
        Bagikan tautan pembayaran berikut kepada klien Anda. Mereka dapat
        membayar langsung melalui browser.
      </p>

      {/* Invoice code */}
      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
        <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
          Kode Invoice
        </p>
        <p className="font-mono text-base font-bold text-indigo-600 tracking-wider">
          {invoice.invoice_code}
        </p>
      </div>

      {/* Payment URL */}
      <div className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-indigo-500 mb-1.5 font-medium uppercase tracking-wide">
          Tautan Pembayaran
        </p>
        <p className="font-mono text-xs text-indigo-800 break-all leading-relaxed">
          {url}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl transition text-sm ${
            copied
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200/60"
          }`}
        >
          {copied ? (
            <>
              <CheckIcon />
              Tersalin!
            </>
          ) : (
            <>
              <CopyIcon />
              Salin Tautan
            </>
          )}
        </button>

        <a
          href="/dashboard"
          className="flex-1 flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-sm"
        >
          Lihat Dashboard
        </a>
      </div>

      <button
        onClick={onReset}
        className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition"
      >
        + Buat Tagihan Baru
      </button>
    </div>
  );
}

// ── Create invoice form ───────────────────────────────────────────────────────

const INITIAL_FORM = {
  client_name: "",
  client_email: "",
  description: "",
  amount_xlm: "",
};

export default function NewInvoicePage() {
  const [auth, setAuthState] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  // null = form view, object = success view (the created invoice)
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // Stable IDs for form fields (React 19 / strict mode safe)
  const nameId = useId();
  const emailId = useId();
  const descId = useId();
  const amountId = useId();

  // ── Auth guard ───────────────────────────────────────────────────────────

  useEffect(() => {
    const a = getAuth();
    if (!a) {
      window.location.href = "/login";
      return;
    }
    setAuthState(a);
  }, []);

  // ── Form helpers ─────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear per-field error on edit
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  }

  function validate() {
    const e = {};
    if (!form.client_name.trim()) e.client_name = "Nama klien wajib diisi.";
    if (!form.client_email.trim()) {
      e.client_email = "Email klien wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.client_email.trim())) {
      e.client_email = "Format email tidak valid.";
    }
    const amt = parseFloat(form.amount_xlm);
    if (!form.amount_xlm) {
      e.amount_xlm = "Jumlah wajib diisi.";
    } else if (isNaN(amt) || amt <= 0) {
      e.amount_xlm = "Jumlah harus lebih dari 0.";
    }
    return e;
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    if (!auth) return;
    setSubmitting(true);

    try {
      const body = {
        client_name: form.client_name.trim(),
        client_email: form.client_email.trim(),
        amount_xlm: parseFloat(form.amount_xlm),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      };

      const res = await api.post("/invoices", body, auth.token);
      const invoice = res.data;

      // Persist to localStorage so the dashboard can display it
      addInvoice(auth.user.id, invoice);

      setCreatedInvoice(invoice);
    } catch (err) {
      setApiError(err.message || "Gagal membuat tagihan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCreatedInvoice(null);
    setForm(INITIAL_FORM);
    setErrors({});
    setApiError(null);
  }

  // ── Guard ────────────────────────────────────────────────────────────────

  if (!auth) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Back link */}
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6 pt-7 pb-0">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium transition"
        >
          <ChevronLeftIcon />
          Dashboard
        </a>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-100 px-7 py-8">
          {createdInvoice ? (
            /* ── Success state ─────────────────────────────────────────────── */
            <SuccessCard invoice={createdInvoice} onReset={handleReset} />
          ) : (
            /* ── Form state ────────────────────────────────────────────────── */
            <>
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow shadow-indigo-200">
                    <span className="text-white font-black text-base select-none">C</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 leading-tight">
                      Buat Tagihan
                    </h1>
                    <p className="text-xs text-slate-400">
                      Invoice pembayaran Stellar
                    </p>
                  </div>
                </div>
              </div>

              {/* API error banner */}
              {apiError && (
                <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <span className="text-red-500 mt-0.5">
                    <AlertIcon />
                  </span>
                  <p className="text-sm text-red-700 leading-relaxed">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-5">
                  {/* Nama Klien */}
                  <div>
                    <Label htmlFor={nameId} required>
                      Nama Klien
                    </Label>
                    <input
                      id={nameId}
                      name="client_name"
                      type="text"
                      value={form.client_name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      autoComplete="off"
                      className={`${inputClass} ${errors.client_name ? "border-red-300 focus:ring-red-400" : ""}`}
                      aria-describedby={errors.client_name ? `${nameId}-err` : undefined}
                      aria-invalid={!!errors.client_name}
                    />
                    {errors.client_name && (
                      <p id={`${nameId}-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.client_name}
                      </p>
                    )}
                  </div>

                  {/* Email Klien */}
                  <div>
                    <Label htmlFor={emailId} required>
                      Email Klien
                    </Label>
                    <input
                      id={emailId}
                      name="client_email"
                      type="email"
                      value={form.client_email}
                      onChange={handleChange}
                      placeholder="klien@contoh.com"
                      autoComplete="off"
                      className={`${inputClass} ${errors.client_email ? "border-red-300 focus:ring-red-400" : ""}`}
                      aria-describedby={errors.client_email ? `${emailId}-err` : undefined}
                      aria-invalid={!!errors.client_email}
                    />
                    {errors.client_email && (
                      <p id={`${emailId}-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.client_email}
                      </p>
                    )}
                  </div>

                  {/* Deskripsi Proyek */}
                  <div>
                    <Label htmlFor={descId}>Deskripsi Proyek</Label>
                    <textarea
                      id={descId}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Opsional — tuliskan detail pekerjaan atau proyek"
                      rows={3}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Jumlah XLM */}
                  <div>
                    <Label htmlFor={amountId} required>
                      Jumlah (XLM)
                    </Label>
                    <div className="relative">
                      <input
                        id={amountId}
                        name="amount_xlm"
                        type="number"
                        value={form.amount_xlm}
                        onChange={handleChange}
                        placeholder="0.0000001"
                        min="0.0000001"
                        step="0.0000001"
                        className={`${inputClass} pr-14 ${errors.amount_xlm ? "border-red-300 focus:ring-red-400" : ""}`}
                        aria-describedby={errors.amount_xlm ? `${amountId}-err` : `${amountId}-hint`}
                        aria-invalid={!!errors.amount_xlm}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                        XLM
                      </span>
                    </div>
                    {errors.amount_xlm ? (
                      <p id={`${amountId}-err`} className="mt-1.5 text-xs text-red-600">
                        {errors.amount_xlm}
                      </p>
                    ) : (
                      <p id={`${amountId}-hint`} className="mt-1.5 text-xs text-slate-400">
                        Minimal 0.0000001 XLM · Biaya jaringan Stellar sangat rendah
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 disabled:from-indigo-400 disabled:to-purple-400 text-white font-bold py-3 px-5 rounded-xl transition text-sm shadow-lg shadow-indigo-200/60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Spinner />
                        Membuat tagihan…
                      </>
                    ) : (
                      "Buat Tagihan"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
