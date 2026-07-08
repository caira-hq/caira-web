"use client";

import { useState } from "react";
import { isConnected, requestAccess } from "@stellar/freighter-api";
import { api } from "../../lib/api";
import { shortWallet } from "../../lib/auth";
import Link from "next/link";

// ── Inline SVG icons ─────────────────────────────────────────────────────────

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

function WalletIcon() {
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
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
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

function InfoIcon() {
  return (
    <svg
      className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function PartyIcon() {
  return (
    <svg
      className="w-10 h-10 text-indigo-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_INDEX = { form: 0, connecting: 1, connected: 2, registering: 2 };
const STEP_LABELS = ["Nama", "Dompet", "Konfirmasi"];

function StepIndicator({ step }) {
  const active = STEP_INDEX[step] ?? 0;
  return (
    <div
      className="flex items-center justify-center gap-1 mb-8"
      aria-label="Langkah pendaftaran"
    >
      {STEP_LABELS.map((label, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done
                    ? "bg-indigo-600 text-white"
                    : current
                      ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1"
                      : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={[
                  "text-xs font-medium hidden sm:block",
                  done
                    ? "text-indigo-500"
                    : current
                      ? "text-indigo-700"
                      : "text-slate-400",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={[
                  "w-6 h-px mx-1 transition-colors",
                  i < active ? "bg-indigo-400" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [walletPubKey, setWalletPubKey] = useState(null);
  // step: 'form' | 'connecting' | 'connected' | 'registering' | 'success'
  const [step, setStep] = useState("form");
  const [error, setError] = useState(null);
  const [freighterMissing, setFreighterMissing] = useState(false);

  const isBusy = step === "connecting" || step === "registering";

  async function handleConnectWallet() {
    setError(null);
    setFreighterMissing(false);
    setStep("connecting");
    try {
      const { isConnected: connected } = await isConnected();
      if (!connected) {
        setFreighterMissing(true);
        setStep("form");
        return;
      }
      const { address, error: accessError } = await requestAccess();
      if (accessError) {
        throw new Error(accessError.message ?? "Akses dompet ditolak.");
      }
      setWalletPubKey(address);
      setStep("connected");
    } catch (err) {
      setError(err.message || "Gagal menghubungkan dompet. Coba lagi.");
      setStep("form");
    }
  }

  async function handleRegister() {
    if (!walletPubKey || !displayName.trim()) return;
    setError(null);
    setStep("registering");
    try {
      await api.post("/users", {
        stellar_wallet: walletPubKey,
        display_name: displayName.trim(),
      });
      setStep("success");
    } catch (err) {
      setError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
      setStep("connected");
    }
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <PartyIcon />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Akun Berhasil Dibuat!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Selamat datang di Caira,{" "}
              <strong className="text-slate-700">{displayName}</strong>! Silakan
              masuk untuk mulai menggunakan dashboard Anda.
            </p>
            <Link
              href="/login"
              className="block w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition text-sm text-center shadow-lg shadow-indigo-200"
            >
              Masuk Sekarang →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl px-8 py-9">
          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
              <span className="text-white font-black text-xl select-none">
                C
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Daftar ke Caira
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 text-center max-w-xs leading-relaxed">
              Buat akun merchant dan mulai terima pembayaran Stellar
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator step={step} />

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertIcon />
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Freighter missing hint */}
          {freighterMissing && !error && (
            <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <InfoIcon />
              <p className="text-sm text-amber-800 leading-relaxed">
                Freighter belum terpasang di browser Anda.{" "}
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2"
                >
                  Pasang Freighter
                </a>{" "}
                lalu muat ulang halaman ini.
              </p>
            </div>
          )}

          {/* ── Step 1: Display name ── */}
          <div className="mb-5">
            <label
              htmlFor="display-name"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Nama Bisnis / Merchant
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  displayName.trim() &&
                  step === "form"
                ) {
                  handleConnectWallet();
                }
              }}
              placeholder="cth. Warung Kopi Bu Sari"
              disabled={isBusy || step === "connected"}
              maxLength={64}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* ── Step 2: Connect wallet (shown when not yet connected) ── */}
          {step !== "connected" && (
            <button
              onClick={handleConnectWallet}
              disabled={!displayName.trim() || isBusy}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-5 rounded-xl transition text-sm"
            >
              {step === "connecting" ? <Spinner /> : <WalletIcon />}
              {step === "connecting"
                ? "Menghubungkan…"
                : "Hubungkan Dompet Freighter"}
            </button>
          )}

          {/* ── Step 3: Wallet connected — show address + register ── */}
          {step === "connected" && (
            <div className="space-y-4">
              {/* Wallet confirmation badge */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-indigo-600 mb-1.5">
                    Dompet terhubung
                  </p>
                  <code className="block text-xs text-slate-600 break-all font-mono leading-relaxed">
                    {walletPubKey}
                  </code>
                  <span className="inline-block mt-2 bg-indigo-100 text-indigo-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                    {shortWallet(walletPubKey)}
                  </span>
                </div>
              </div>

              {/* Register button */}
              <button
                onClick={handleRegister}
                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-bold py-3 px-5 rounded-xl transition text-sm shadow-lg shadow-indigo-200/60"
              >
                Daftar Sekarang →
              </button>

              {/* Re-connect with different wallet */}
              <button
                onClick={() => {
                  setWalletPubKey(null);
                  setStep("form");
                  setError(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-1 transition"
              >
                Gunakan dompet lain
              </button>
            </div>
          )}
        </div>

        {/* Bottom link */}
        <p className="text-center text-sm text-slate-500 mt-5">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
