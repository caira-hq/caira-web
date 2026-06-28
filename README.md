# Caira Web — Frontend Aplikasi Caira Pay ⚡

Caira Web adalah aplikasi frontend berbasis web untuk **Caira Pay**, sebuah platform payment gateway instan yang memungkinkan merchant untuk membuat tagihan (invoice) dan menerima pembayaran secara langsung, aman, dan instan menggunakan aset **XLM** di jaringan **Stellar Blockchain**.

Aplikasi ini dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, serta terintegrasi langsung dengan dompet digital **Freighter** melalui **Freighter API v6** dan **Stellar SDK v16**.

---

## 🚀 Fitur Utama

- **Pendaftaran & Login Tanpa Password (Non-custodial):** Merchant mendaftar dan masuk hanya dengan menghubungkan dompet digital Freighter mereka. Keamanan terjamin karena kunci privat tidak pernah meninggalkan dompet pengguna.
- **Merchant Dashboard:**
  - Ringkasan total tagihan, total pendapatan (XLM), dan jumlah tagihan lunas.
  - Tabel interaktif daftar tagihan lengkap dengan status pembayarannya (Menunggu / Lunas).
  - Fitur salin tautan pembayaran (Payment Link) dan verifikasi status pembayaran real-time langsung ke Stellar Testnet.
- **Pembuatan Tagihan Mudah:** Form intuitif untuk membuat tagihan baru dengan menentukan nama klien, email klien, deskripsi proyek, dan nominal XLM (mendukung presisi hingga 7 angka di belakang desimal).
- **Checkout Pembayaran Instan (`/pay/[code]`):**
  - Halaman checkout khusus bagi klien/pembayar untuk menyelesaikan invoice.
  - Alur proses pembayaran yang dipandu langkah demi langkah (Hubungkan Dompet -> Tanda Tangan -> Kirim Pembayaran).
  - Penyelesaian transaksi hanya dalam waktu 3–5 detik dengan biaya transaksi kurang dari 1 sen USD di jaringan Stellar.

---

## 🛠️ Tech Stack & Dependensi

Proyek ini memanfaatkan teknologi web modern dan ekosistem Stellar terbaru:

- **Framework:** [Next.js 16.2.9](https://nextjs.org/) (dengan fitur terbaru React Compiler)
- **Library UI:** [React 19.2.4](https://react.dev/) & [React DOM 19.2.4](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (menggunakan `@tailwindcss/postcss`)
- **Stellar Integrations:**
  - `@stellar/freighter-api` (v6.0.1) — Integrasi Freighter Wallet terbaru yang aman & berstandar objek.
  - `@stellar/stellar-sdk` (v16.0.1) — Untuk membangun, menandatangani, dan mengirim transaksi langsung ke Stellar Testnet Horizon Server.
- **HTTP Client:** [Axios](https://github.com/axios/axios) (v1.18.1)
- **Icons:** [Lucide React](https://lucide.dev/) (v1.21.0) & Inline SVG Icons yang dioptimalkan secara manual.

---

## 📂 Struktur Folder Proyek

```text
caira-web/
├── public/                 # Aset statis (SVG logo, ikon, dll.)
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── globals.css     # Global CSS & Konfigurasi Tailwind CSS v4
│   │   ├── layout.js       # Layout Utama (Font Geist, metadata antialiased)
│   │   ├── page.js         # Landing Page Promosi Caira Pay
│   │   ├── login/          # Halaman Login Merchant (Challenge-Response Signature)
│   │   ├── register/       # Halaman Pendaftaran Merchant
│   │   ├── dashboard/      # Panel Kontrol Merchant (Statistik & Tabel Invoice)
│   │   │   └── new/        # Halaman Form Pembuatan Invoice Baru
│   │   └── pay/[code]/     # Halaman Checkout Pembayaran Instan via Stellar
│   └── lib/
│       ├── api.js          # Wrapper fetch API terpusat dengan penanganan error
│       └── auth.js         # Manajemen sesi autentikasi & cache invoice di LocalStorage
├── eslint.config.mjs       # Konfigurasi ESLint 9 khusus Next.js
├── jsconfig.json           # Konfigurasi path alias (@/*) untuk import bersih
├── next.config.mjs         # Konfigurasi Next.js (dengan React Compiler diaktifkan)
└── package.json            # Daftar script dan dependensi npm
```

---

## ⚙️ Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
1. **Node.js** (versi v22 atau yang lebih baru direkomendasikan)
2. **Freighter Wallet Extension** terpasang di browser Anda ([Dapatkan Freighter](https://www.freighter.app/))
   - Pastikan Freighter diatur ke jaringan **Testnet** untuk keperluan pengujian gratis.
   - Anda dapat mengisi saldo XLM Testnet secara gratis menggunakan [Stellar Laboratory Account Creator](https://laboratory.stellar.org/#account-creator?network=test).

---

## 🔧 Instalasi & Menjalankan Aplikasi

### 1. Clone Repositori & Masuk ke Folder Proyek
```bash
cd caira-web
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (Environment Variables)
Buat berkas `.env` atau `.env.local` di root direktori proyek `caira-web` dan tambahkan variabel berikut:

```env
# Alamat URL Backend API Caira (default localhost:5000)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Alamat URL Aplikasi Frontend ini (default localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Jalankan Server Pengembangan (Development Server)
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

### 5. Bangun Aplikasi untuk Produksi (Production Build)
```bash
# Melakukan build aplikasi dengan optimasi penuh
npm run build

# Menjalankan server produksi hasil build
npm start
```

---

## 🧭 Panduan Alur Penggunaan (User Flow)

1. **Merchant Registrasi:**
   - Merchant masuk ke `/register`, mengisi nama merchant/bisnis.
   - Menghubungkan dompet Freighter untuk mengasosiasikan akun dengan Stellar Public Key mereka.
2. **Merchant Login:**
   - Merchant masuk ke `/login`, klik "Hubungkan & Masuk".
   - Aplikasi akan meminta tantangan (*challenge*) unik dari server, lalu meminta merchant menandatangani pesan tersebut di Freighter.
   - Tanda tangan dikirim ke backend untuk verifikasi kriptografis, menghasilkan token JWT yang aman.
3. **Membuat Invoice:**
   - Merchant masuk ke `/dashboard/new`, mengisi data klien dan nominal XLM, lalu klik "Buat Tagihan".
   - Tautan pembayaran unik akan dibuat: `http://localhost:3000/pay/[invoice_code]`.
4. **Pembayaran oleh Klien:**
   - Klien membuka tautan tersebut, meninjau detail invoice, menghubungkan dompet Freighter mereka, lalu melakukan pembayaran langsung dengan menekan tombol "Bayar Sekarang".
   - Transaksi diproses langsung secara *peer-to-peer* ke dompet Stellar merchant di jaringan Testnet.
5. **Verifikasi:**
   - Merchant dapat menekan tombol "Cek Bayar" di `/dashboard` untuk meminta server memeriksa ledger Stellar secara real-time dan mengonfirmasi pembayaran lunas.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi komersial internal Caira. Seluruh kontribusi eksternal harus mengikuti standar keamanan dan regulasi kepatuhan finansial yang ketat.
