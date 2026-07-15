"use client";

import { useState } from "react";
import {
  isConnected,
  requestAccess,
  signMessage,
} from "@stellar/freighter-api";
import { api } from "../../lib/api";
import { setAuth } from "../../lib/auth";
import Link from "next/link";

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function Spinner({ size = "md" }) {
  const cls = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <svg
      className={`${cls} animate-spin`}
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
      className="w-5 h-5"
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

function ShieldIcon() {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="w-5 h-5 text-red-500 shrink-0"
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

function ExternalLinkIcon() {
  return (
    <svg
      className="w-3 h-3 inline-block ml-0.5 align-middle"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ── Step progress display ─────────────────────────────────────────────────────

const STATUS_META = {
  idle: { label: null, step: -1 },
  connecting: { label: "Connecting wallet...", step: 0 },
  signing: { label: "Waiting for signature in Freighter...", step: 1 },
  verifying: { label: "Verifying...", step: 2 },
  error: { label: null, step: -1 },
};

const FLOW_STEPS = [
  { key: "connecting", label: "Connect" },
  { key: "signing", label: "Sign" },
  { key: "verifying", label: "Verify" },
];

function FlowProgress({ status }) {
  const activeStep = STATUS_META[status]?.step ?? -1;
  if (activeStep < 0) return null;

  return (
    <div className="mb-6">
      {/* Step dots */}
      <div className="flex items-center justify-center gap-1 mb-5">
        {FLOW_STEPS.map((s, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <div key={s.key} className="flex items-center gap-1">
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
                  {s.label}
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div
                  className={[
                    "w-6 h-px mx-1 transition-colors",
                    i < activeStep ? "bg-indigo-400" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current status label */}
      <div className="flex items-center justify-center gap-2 text-sm text-indigo-700 font-medium">
        <Spinner size="sm" />
        <span>{STATUS_META[status].label}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  // status: 'idle' | 'connecting' | 'signing' | 'verifying' | 'error'
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [freighterMissing, setFreighterMissing] = useState(false);

  const isBusy =
    status === "connecting" || status === "signing" || status === "verifying";

  async function handleLogin() {
    setError(null);
    setFreighterMissing(false);

    // ── 1. Check Freighter is installed ────────────────────────────────────
    setStatus("connecting");
    let walletPubKey;
    try {
      const { isConnected: connected } = await isConnected();
      if (!connected) {
        setFreighterMissing(true);
        setStatus("idle");
        return;
      }

      const { address, error: accessError } = await requestAccess();
      if (accessError) {
        throw new Error(accessError.message ?? "Wallet access denied.");
      }
      walletPubKey = address;
    } catch (err) {
      setError(err.message || "Failed to connect wallet. Please try again.");
      setStatus("error");
      return;
    }

    // ── 2. Fetch challenge ─────────────────────────────────────────────────
    let challengeMessage;
    try {
      const { data } = await api.post("/auth/challenge", {
        stellar_wallet: walletPubKey,
      });
      challengeMessage = data.message;
    } catch (err) {
      setError(err.message || "Failed to get challenge from server.");
      setStatus("error");
      return;
    }

    // ── 3. Sign the challenge in Freighter ─────────────────────────────────
    setStatus("signing");
    let signature;
    try {
      // Pass the raw challenge string — Freighter signs its UTF-8 bytes,
      // which is exactly what the backend verifies:
      //   keypair.verify(Buffer.from(message), Buffer.from(sig, 'base64'))
      const result = await signMessage(challengeMessage, {
        address: walletPubKey,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Signing cancelled.");
      }

      const { signedMessage } = result;

      if (!signedMessage) {
        throw new Error("No signature received from Freighter.");
      }

      // signedMessage is a base64 string (v4 protocol) or Buffer-like (v3)
      if (typeof signedMessage === "string") {
        signature = signedMessage;
      } else {
        let bytes;
        if (signedMessage instanceof Uint8Array) {
          bytes = signedMessage;
        } else if (Array.isArray(signedMessage)) {
          bytes = new Uint8Array(signedMessage);
        } else if (signedMessage?.data && Array.isArray(signedMessage.data)) {
          bytes = new Uint8Array(signedMessage.data);
        } else {
          bytes = new Uint8Array(Object.values(signedMessage));
        }
        signature = btoa(String.fromCharCode(...bytes));
      }
    } catch (err) {
      setError(err.message || "Signing failed or cancelled.");
      setStatus("error");
      return;
    }

    // ── 4. Verify with backend ─────────────────────────────────────────────
    setStatus("verifying");
    try {
      const { data } = await api.post("/auth/verify", {
        stellar_wallet: walletPubKey,
        signature,
      });
      setAuth({ token: data.token, user: data.user });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setStatus("error");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setError(null);
    setFreighterMissing(false);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
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
              Log In to Caira
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 text-center max-w-xs leading-relaxed">
              No password required. Just verify with your Stellar wallet.
            </p>
          </div>

          {/* Flow progress (visible during active steps) */}
          <FlowProgress status={status} />

          {/* Freighter missing hint */}
          {freighterMissing && (
            <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <InfoIcon />
              <p className="text-sm text-amber-800 leading-relaxed">
                Freighter is not installed.
                <Link
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2"
                >
                  Install Freighter
                  <ExternalLinkIcon />
                </Link>{" "}
                then reload this page.
              </p>
            </div>
          )}

          {/* Error state */}
          {status === "error" && error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertIcon />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-700 mb-0.5">
                  An error occurred
                </p>
                <p className="text-sm text-red-600 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* CTA button */}
          {status === "idle" || status === "error" ? (
            <button
              onClick={status === "error" ? handleRetry : handleLogin}
              className="w-full flex items-center justify-center gap-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-bold py-3.5 px-5 rounded-xl transition text-sm shadow-lg shadow-indigo-200/60"
            >
              {status === "error" ? (
                <>
                  <WalletIcon />
                  Try Again
                </>
              ) : (
                <>
                  <WalletIcon />
                  Connect & Log In with Freighter
                </>
              )}
            </button>
          ) : (
            /* Busy — show a muted loading card instead of a pressable button */
            <div className="w-full flex items-center justify-center gap-2.5 bg-indigo-50 border border-indigo-200 text-indigo-400 font-semibold py-3.5 px-5 rounded-xl text-sm cursor-not-allowed select-none">
              <Spinner />
              Processing...
            </div>
          )}

          {/* Security note */}
          <div className="mt-5 flex items-start gap-2.5 bg-slate-50 rounded-xl p-3.5">
            <ShieldIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-semibold text-slate-600">
                Secure & password-free.
              </span>{" "}
              Your private key never leaves Freighter. Caira only verifies ownership of your Stellar address.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex flex-col items-center gap-2.5 mt-5 text-sm">
          <p className="text-slate-500">
            Don’t have an account? {" "}
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign up here
            </Link>
          </p>
          <p className="text-slate-400 text-xs">
            Don’t have Freighter? {" "}
            <Link
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              freighter.app
              <ExternalLinkIcon />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
