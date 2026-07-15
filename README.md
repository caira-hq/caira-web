# Caira Web ⚡

Frontend application for **Caira Pay** — an instant payment gateway platform that lets merchants create invoices and receive payments directly, securely, and instantly using **XLM** assets on the **Stellar Blockchain** network.

Built using **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4**, and integrated directly with the **Freighter** digital wallet via the Freighter API v6 and Stellar SDK v16.

---

## 🚀 Key Features

### Password-Free Registration & Login
Merchants register and log in simply by connecting their Freighter digital wallet. Security is guaranteed because the private key never leaves the user's wallet *(non-custodial)*.

### Merchant Dashboard
- Summary of total invoices, total revenue (XLM), and number of paid invoices.
- Interactive table listing invoices complete with payment status (**Pending / Paid**).
- Copy payment link feature and real-time payment status verification directly against the Stellar Testnet.

### Easy Invoice Creation
An intuitive form for creating a new invoice by specifying the client name, client email, project description, and XLM amount (supports precision up to 7 decimal places).

### Instant Payment Checkout (`/pay/[code]`)
- A dedicated checkout page for clients to complete an invoice.
- A step-by-step guided payment flow:
  **Connect Wallet → Sign → Send Payment**
- Transaction settlement in just **3–5 seconds** with transaction fees of less than **1 US cent** on the Stellar network.

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology |
|---|---|
| Framework | Next.js 16.2.9 (React Compiler) |
| UI Library | React 19.2.4 & React DOM 19.2.4 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Freighter Wallet | `@stellar/freighter-api` v6.0.1 |
| Stellar SDK | `@stellar/stellar-sdk` v16.0.1 |
| HTTP Client | Axios v1.18.1 |
| Icons | Lucide React v1.21.0 & Inline SVG |

---

## 📂 Folder Structure

```
caira-web/
├── public/                 # Static assets (SVG logo, icons, etc.)
├── src/
│   ├── app/                # Next.js App Router Pages
│   │   ├── globals.css     # Global CSS & Tailwind CSS v4 configuration
│   │   ├── layout.js       # Main layout (Geist font, antialiased metadata)
│   │   ├── page.js         # Caira Pay promotional landing page
│   │   ├── login/          # Merchant login page (Challenge-Response Signature)
│   │   ├── register/       # Merchant registration page
│   │   ├── dashboard/      # Merchant control panel (Statistics & Invoice Table)
│   │   │   └── new/        # New invoice creation form page
│   │   └── pay/[code]/     # Instant payment checkout page via Stellar
│   └── lib/
│       ├── api.js          # Centralized fetch API wrapper with error handling
│       └── auth.js         # Authentication session management & invoice caching in LocalStorage
├── eslint.config.mjs       # ESLint 9 configuration specific to Next.js
├── jsconfig.json           # Path alias configuration (@/*) for clean imports
├── next.config.mjs         # Next.js configuration (with React Compiler enabled)
└── package.json            # List of npm scripts and dependencies
```

---

## ⚙️ System Requirements

Before running the application, make sure you have installed and set up the following:

- **Node.js** v22 or newer
- **[Freighter Wallet Extension](https://www.freighter.app/)** installed in your browser

> 💡 Make sure Freighter is set to the **Testnet** network for testing purposes.  
> Free Testnet XLM balance is available via the **[Stellar Laboratory Account Creator](https://laboratory.stellar.org/#account-creator)**.

---

## 🔧 Installation & Running the Application

### 1. Clone the repository & install dependencies

```bash
cd caira-web
npm install
```

### 2. Configure environment variables

Create a `.env` or `.env.local` file in the root of the `caira-web` directory:

```env
# Caira Backend API URL (default localhost:5000)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# This Frontend Application's URL (default localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Global Secret Key (must match CAIRA_API_KEY on the backend)
NEXT_PUBLIC_CAIRA_API_KEY=caira_hackathon_super_secret_2026
```

> 🔑 **Security Note:** The value of `NEXT_PUBLIC_CAIRA_API_KEY` is automatically inserted as the `x-api-key` HTTP header on every request to the backend to avoid a `403 Forbidden` error.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
# Build the application with full optimization
npm run build

# Run the built production server
npm start
```

---

## 🧭 Usage Flow

### 1. Merchant — Registration

1. Open the `/register` page and fill in the merchant/business name.
2. Connect your **Freighter** wallet to associate the account with a Stellar Public Key.

### 2. Merchant — Login

1. Open `/login` and click **"Connect & Sign In"**.
2. The application requests a unique *challenge* from the server, then the merchant signs the message in Freighter.
3. The signature is sent to the backend for cryptographic verification → producing a secure **JWT token**.

### 3. Merchant — Creating an Invoice

1. Open `/dashboard/new` and fill in the client details and XLM amount.
2. Click **"Create Invoice"** — a unique payment link will be generated automatically:
   ```
   http://localhost:3000/pay/[invoice_code]
   ```

### 4. Client — Payment

1. The client opens the payment link and reviews the invoice details.
2. The client connects their Freighter wallet.
3. Click **"Pay Now"** — the transaction is processed *peer-to-peer* directly to the merchant's wallet on the Stellar Testnet.

### 5. Merchant — Payment Verification

Click the **"Check Payment"** button on `/dashboard` to have the server check the Stellar ledger in real time and confirm that the payment status is paid.

---

## 📄 License

This project is licensed under Caira's internal commercial license. All external contributions must comply with strict security standards and financial compliance regulations.