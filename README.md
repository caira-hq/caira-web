# Caira Web ⚡

Frontend aplikasi **Caira Pay** — platform payment gateway instan yang memungkinkan merchant membuat tagihan (invoice) dan menerima pembayaran secara langsung, aman, dan instan menggunakan aset **XLM** di jaringan **Stellar Blockchain**.

Dibangun menggunakan **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4**, serta terintegrasi langsung dengan dompet digital **Freighter** melalui Freighter API v6 dan Stellar SDK v16.

---

## 🚀 Fitur Utama

### Pendaftaran & Login Tanpa Password
Merchant mendaftar dan masuk hanya dengan menghubungkan dompet digital Freighter mereka. Keamanan terjamin karena kunci privat tidak pernah meninggalkan dompet pengguna *(non-custodial)*.

### Merchant Dashboard
- Ringkasan total tagihan, total pendapatan (XLM), dan jumlah tagihan lunas.
- Tabel interaktif daftar tagihan lengkap dengan status pembayaran (**Menunggu / Lunas**).
- Fitur salin tautan pembayaran (Payment Link) dan verifikasi status pembayaran real-time langsung ke Stellar Testnet.

### Pembuatan Tagihan Mudah
Form intuitif untuk membuat tagihan baru dengan menentukan nama klien, email klien, deskripsi proyek, dan nominal XLM (mendukung presisi hingga 7 angka di belakang desimal).

### Checkout Pembayaran Instan (`/pay/[code]`)
- Halaman checkout khusus bagi klien untuk menyelesaikan invoice.
- Alur proses pembayaran yang dipandu langkah demi langkah:
  **Hubungkan Dompet → Tanda Tangan → Kirim Pembayaran**
- Penyelesaian transaksi hanya dalam **3–5 detik** dengan biaya transaksi kurang dari **1 sen USD** di jaringan Stellar.

---

## 🛠️ Tech Stack & Dependensi

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 16.2.9 (React Compiler) |
| Library UI | React 19.2.4 & React DOM 19.2.4 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Freighter Wallet | `@stellar/freighter-api` v6.0.1 |
| Stellar SDK | `@stellar/stellar-sdk` v16.0.1 |
| HTTP Client | Axios v1.18.1 |
| Icons | Lucide React v1.21.0 & Inline SVG |

---

## 📂 Struktur Folder

```
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

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal dan menyiapkan:

- **Node.js** v22 atau yang lebih baru
- **[Freighter Wallet Extension](https://www.freighter.app/)** terpasang di browser Anda

> 💡 Pastikan Freighter diatur ke jaringan **Testnet** untuk keperluan pengujian.  
> Saldo XLM Testnet gratis tersedia melalui **[Stellar Laboratory Account Creator](https://laboratory.stellar.org/#account-creator)**.

---

## 🔧 Instalasi & Menjalankan Aplikasi

### 1. Clone repositori & install dependency

```bash
cd caira-web
npm install
```

### 2. Konfigurasi environment variables

Buat file `.env` atau `.env.local` di root direktori `caira-web`:

```env
# Alamat URL Backend API Caira (default localhost:5000)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Alamat URL Aplikasi Frontend ini (default localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Kunci Rahasia Global (samakan dengan CAIRA_API_KEY di backend)
NEXT_PUBLIC_CAIRA_API_KEY=caira_hackathon_super_secret_2026
```

> 🔑 **Catatan Keamanan:** Nilai `NEXT_PUBLIC_CAIRA_API_KEY` disisipkan otomatis sebagai header HTTP `x-api-key` pada setiap request ke backend untuk menghindari error `403 Forbidden`.

### 3. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 4. Build untuk produksi

```bash
# Build aplikasi dengan optimasi penuh
npm run build

# Jalankan server produksi hasil build
npm start
```

---

## 🧭 Alur Penggunaan

### 1. Merchant — Registrasi

1. Buka halaman `/register` dan isi nama merchant/bisnis.
2. Hubungkan dompet **Freighter** untuk mengasosiasikan akun dengan Stellar Public Key.

### 2. Merchant — Login

1. Buka `/login` dan klik **"Hubungkan & Masuk"**.
2. Aplikasi meminta *challenge* unik dari server, lalu merchant menandatangani pesan di Freighter.
3. Tanda tangan dikirim ke backend untuk verifikasi kriptografis → menghasilkan **JWT token** yang aman.

### 3. Merchant — Membuat Invoice

1. Buka `/dashboard/new` dan isi data klien serta nominal XLM.
2. Klik **"Buat Tagihan"** — tautan pembayaran unik akan dibuat secara otomatis:
   ```
   http://localhost:3000/pay/[invoice_code]
   ```

### 4. Klien — Pembayaran

1. Klien membuka tautan pembayaran dan meninjau detail invoice.
2. Klien menghubungkan dompet Freighter mereka.
3. Klik **"Bayar Sekarang"** — transaksi diproses secara *peer-to-peer* langsung ke dompet merchant di Stellar Testnet.

### 5. Merchant — Verifikasi Pembayaran

Klik tombol **"Cek Bayar"** di `/dashboard` untuk meminta server memeriksa ledger Stellar secara real-time dan mengonfirmasi status pembayaran lunas.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi komersial internal Caira. Seluruh kontribusi eksternal harus mengikuti standar keamanan dan regulasi kepatuhan finansial yang ketat.