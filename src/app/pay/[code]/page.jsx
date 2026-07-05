"use client";

import { use, useEffect, useState } from "react";
import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import {
  TransactionBuilder,
  Networks,
  Asset,
  Operation,
  Horizon,
  Memo,
} from "@stellar/stellar-sdk";
import albedo from "@albedo-link/intent"; // TAMBAHAN: Import Albedo

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const API_KEY = process.env.NEXT_PUBLIC_CAIRA_API_KEY;

// ─── Steps shown during payment processing ───────────────────────────────────
const STEPS = [
  { id: 1, label: "Hubungkan Dompet" },
  { id: 2, label: "Tanda Tangani" },
  { id: 3, label: "Kirim Pembayaran" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
        </div>
        <p className="text-slate-500 font-medium text-sm tracking-wide">
          Memuat detail tagihan…
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9S16.971 3 12 3z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          Tagihan Tidak Ditemukan
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
        <p className="text-xs text-slate-400 mt-4">
          Periksa kembali tautan yang diberikan oleh penjual.
        </p>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                currentStep > step.id
                  ? "bg-emerald-500 text-white"
                  : currentStep === step.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {currentStep > step.id ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-[10px] font-medium whitespace-nowrap ${
                currentStep >= step.id ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-10 h-0.5 mb-4 rounded-full transition-all duration-500 ${
                currentStep > step.id ? "bg-emerald-400" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-semibold text-slate-800 text-right max-w-[180px] truncate ${
          mono ? "font-mono bg-slate-100 px-2 py-0.5 rounded-lg text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CheckoutPage({ params }) {
  // Next.js 16: params is now a Promise — must be unwrapped with React.use()
  const { code } = use(params);

  const [invoice, setInvoice] = useState(null);
  // status: loading | no_wallet | ready | connecting | processing | success | error
  const [status, setStatus] = useState("loading");
  const [walletPubKey, setWalletPubKey] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingLabel, setProcessingLabel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  
  // TAMBAHAN: Deteksi Mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Deteksi apakah perangkat adalah HP saat komponen dimuat
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  // ── 1. Fetch invoice on mount ──
  useEffect(() => {
    fetch(`${API_BASE}/invoices/${code}`, {
      headers: {
              "Content-Type": "application/json",
              ...(API_KEY ? { "x-api-key": API_KEY } : {}),
            }
    })
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) throw new Error(res.message);
        setInvoice(res.data);
        setStatus(res.data.status === "PAID" ? "success" : "no_wallet");
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage(
          "Invoice tidak ditemukan atau sudah kedaluwarsa. Pastikan tautan yang Anda gunakan benar.",
        );
      });
  }, [code]);

  // ── 2. Connect wallet (HYBRID) ──
  const handleConnect = async () => {
    setStatus("connecting");
    try {
      if (isMobile) {
        // --- SKENARIO HP (ALBEDO) ---
        // Albedo akan membuka popup/redirect untuk meminta izin
        const res = await albedo.publicKey();
        setWalletPubKey(res.pubkey);
        setStatus("ready");
      } else {
        // --- SKENARIO PC (FREIGHTER) ---
        const { isConnected: connected } = await isConnected();
        if (!connected) {
          alert(
            "Freighter belum terpasang!\n\nKunjungi https://freighter.app untuk memasang ekstensi dompet Stellar, lalu kembali ke halaman ini.",
          );
          setStatus("no_wallet");
          return;
        }
        const { isAllowed: allowed } = await isAllowed();
        if (!allowed) await setAllowed();
        const { address, error: accessErr } = await requestAccess();
        if (accessErr) throw new Error(accessErr.message ?? "Akses ditolak.");
        
        setWalletPubKey(address); 
        setStatus("ready");
      }
    } catch (err) {
      console.error("Connect wallet error:", err);
      setStatus("no_wallet");
    }
  };

  // ── 3. Pay (HYBRID) ──
  const handlePayment = async () => {
    try {
      setStatus("processing");
      setCurrentStep(1);

      if (isMobile) {
        // --- SKENARIO HP (ALBEDO) ---
        setProcessingLabel("Menunggu otorisasi di Albedo…");
        await albedo.pay({
          amount: String(invoice.amount_xlm),
          destination: invoice.user.stellar_wallet,
          network: 'testnet',
          memo: invoice.invoice_code,
          submit: true // Albedo yang akan submit ke jaringan
        });
        setCurrentStep(3); // Langsung loncat step karena albedo yg tangani
      } else {
        // --- SKENARIO PC (FREIGHTER) ---
        setProcessingLabel("Memuat akun dari jaringan Stellar…");
        const server = new Horizon.Server("https://horizon-testnet.stellar.org");
        const account = await server.loadAccount(walletPubKey);

        setCurrentStep(2);
        setProcessingLabel("Menunggu tanda tangan di Freighter…");

        const tx = new TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination: invoice.user.stellar_wallet,
              asset: Asset.native(),
              amount: String(invoice.amount_xlm),
            }),
          )
          .addMemo(Memo.text(invoice.invoice_code))
          .setTimeout(180)
          .build();

        const signResult = await signTransaction(tx.toXDR(), {
          networkPassphrase: Networks.TESTNET,
        });
        if (signResult.error)
          throw new Error(signResult.error.message ?? "Signing dibatalkan.");
        
        const signedXdr = signResult.signedTxXdr;

        setCurrentStep(3);
        setProcessingLabel("Mengirim ke jaringan Stellar…");

        const txToSubmit = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
        await server.submitTransaction(txToSubmit);
      }

      // TAMBAHAN: Panggil Backend Verifikasi agar Status Database berubah jadi PAID
      setProcessingLabel("Memverifikasi ke server Caira…");
      const verifyRes = await fetch(`${API_BASE}/invoices/${invoice.invoice_code}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(API_KEY ? { "x-api-key": API_KEY } : {}),
        }
      });
      const verifyData = await verifyRes.json();

      if(verifyData.success) {
        setStatus("success");
      } else {
        // Jika jaringan stellar sukses, tapi server gagal baca, tetap kita anggap beres 
        // tapi kasih tahu user.
        console.warn("Server verifikasi tertunda:", verifyData.message);
        setStatus("success"); 
      }

    } catch (error) {
      console.error("Payment error:", error);
      setStatus("ready");
      setCurrentStep(0);
      setProcessingLabel("");

      const hint = error?.response?.data?.extras?.result_codes?.transaction;
      const msg =
        hint === "tx_insufficient_balance"
          ? "Saldo XLM tidak mencukupi. Tambahkan saldo dan coba lagi."
          : "Pembayaran dibatalkan atau gagal. Pastikan saldo XLM mencukupi.";
      alert(`⚠️ ${msg}`);
    }
  };

  const copyInvoiceUrl = () => {
    navigator.clipboard.writeText(`${APP_BASE}/pay/${invoice.invoice_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render states ──
  if (status === "loading") return <LoadingScreen />;
  if (status === "error") return <ErrorScreen message={errorMessage} />;

  // Success
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-10 max-w-sm w-full text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-300 animate-ping opacity-20" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Pembayaran Berhasil!
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Terima kasih,{" "}
            <strong className="text-slate-700">{invoice.client_name}</strong>.
            Transaksi telah terkirim ke jaringan Stellar.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 text-left mb-6">
            <InfoRow label="Kepada" value={invoice.user.display_name} />
            <InfoRow label="Jumlah" value={`${invoice.amount_xlm} XLM`} />
            <InfoRow label="Kode Invoice" value={invoice.invoice_code} mono />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Simpan kode invoice ini sebagai bukti pembayaran. Penjual akan
            mengkonfirmasi penerimaan pembayaran dari dashboard mereka.
          </p>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Diberdayakan oleh Stellar Network · Caira
        </p>
      </div>
    );
  }

  // ── Main checkout card ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-10">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-sm">C</span>
        </div>
        <span className="font-bold text-slate-700 text-lg">Caira Pay</span>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100">
          {/* Hero amount */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 pt-8 pb-10 text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-white/5 rounded-full" />

            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1 relative">
              Total Tagihan
            </p>
            <div className="text-5xl font-black text-white tracking-tight relative">
              {invoice.amount_xlm}
              <span className="text-2xl font-bold text-indigo-200 ml-2">
                XLM
              </span>
            </div>
            <p className="text-indigo-100 text-sm mt-2 relative">
              Tagihan untuk{" "}
              <span className="font-semibold text-white">
                {invoice.client_name}
              </span>
            </p>

            <div
              className={`inline-flex items-center gap-1.5 backdrop-blur-sm px-3 py-1 rounded-full mt-4 relative ${
                invoice.status === "PAID" ? "bg-emerald-400/30" : "bg-white/20"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  invoice.status === "PAID"
                    ? "bg-emerald-300"
                    : "bg-amber-400 animate-pulse"
                }`}
              />
              <span className="text-xs font-semibold text-white">
                {invoice.status === "PAID" ? "Lunas" : "Menunggu Pembayaran"}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="px-6 pt-5 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Detail Tagihan
            </p>
            <InfoRow label="Dari" value={invoice.user.display_name} />
            <InfoRow
              label="Deskripsi"
              value={invoice.description || "Pembayaran Jasa"}
            />
            <InfoRow label="Kode Invoice" value={invoice.invoice_code} mono />
          </div>

          <div className="mx-6 my-3 border-t border-dashed border-slate-200" />

          {/* Action area */}
          <div className="px-6 pb-6 space-y-3">
            {status === "processing" ? (
              <>
                <StepIndicator currentStep={currentStep} />
                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-4 h-4 border-2 border-t-indigo-600 border-indigo-200 rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-indigo-700">
                      {processingLabel}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400">
                    Jangan tutup halaman ini
                  </p>
                </div>
              </>
            ) : status === "connecting" ? (
              <div className="flex items-center justify-center gap-2 py-4 text-indigo-600">
                <div className="w-5 h-5 border-2 border-t-indigo-600 border-indigo-200 rounded-full animate-spin" />
                <span className="text-sm font-semibold">
                  Menghubungkan dompet…
                </span>
              </div>
            ) : status === "no_wallet" ? (
              /* Step 1: Connect wallet */
              <button
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-200"
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
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                {isMobile ? "Hubungkan Dompet Albedo" : "Hubungkan Freighter"}
              </button>
            ) : (
              /* Step 2: Wallet connected, show Pay Now */
              <div className="space-y-3">
                {/* Wallet connected badge */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs text-emerald-700 font-medium flex-1 truncate">
                    {walletPubKey
                      ? `${walletPubKey.slice(0, 8)}…${walletPubKey.slice(-6)}`
                      : "Terhubung"}
                  </span>
                  <button
                    onClick={() => {
                      setWalletPubKey(null);
                      setStatus("no_wallet");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Ganti
                  </button>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-emerald-200"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Bayar Sekarang
                </button>
              </div>
            )}

            {/* Trust badges */}
            {(status === "no_wallet" || status === "ready") && (
              <div className="flex items-center justify-center gap-4 pt-1">
                {[
                  { icon: "🔒", label: "Terenkripsi" },
                  { icon: "⚡", label: "Instan" },
                  { icon: "🛡️", label: "Aman" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-1 text-xs text-slate-400"
                  >
                    <span>{b.icon}</span>
                    {b.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Freighter install hint - HANYA MUNCUL DI DESKTOP */}
        {!isMobile && status === "no_wallet" && (
          <div className="mt-4 bg-white/70 backdrop-blur rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              💡 Belum punya Freighter?
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Freighter adalah dompet digital gratis untuk Stellar. Pasang
              ekstensinya di browser, buat akun, isi saldo XLM, lalu kembali ke
              halaman ini.
            </p>
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Pasang Freighter →
            </a>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-8">
        Diberdayakan oleh Stellar Network · Caira © {new Date().getFullYear()}
      </p>
    </div>
  );
}