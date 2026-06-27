export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">Caira</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Masuk
          </a>
          <a
            href="/register"
            className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors"
          >
            Daftar Gratis
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Didukung oleh Stellar Network
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight max-w-xl mb-4">
          Terima Pembayaran{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Lebih Cepat
          </span>{" "}
          dari Siapa Saja
        </h1>
        <p className="text-slate-500 text-lg max-w-md leading-relaxed mb-10">
          Buat invoice dalam hitungan detik, bagikan tautannya, dan terima
          pembayaran XLM langsung ke dompet Stellar Anda — tanpa biaya mahal,
          tanpa perantara.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
          >
            Mulai Gratis
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold text-base hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            Sudah Punya Akun
          </a>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {[
            {
              icon: "⚡",
              title: "Instan",
              desc: "Transaksi selesai dalam 3–5 detik di jaringan Stellar",
            },
            {
              icon: "🔒",
              title: "Aman",
              desc: "Kunci privat tidak pernah meninggalkan dompet Anda",
            },
            {
              icon: "💸",
              title: "Murah",
              desc: "Biaya transaksi kurang dari 1 sen USD",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-left hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20 w-full max-w-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Cara Kerja
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              {
                step: "1",
                title: "Daftar",
                desc: "Hubungkan dompet Freighter Anda ke Caira",
              },
              {
                step: "2",
                title: "Buat Invoice",
                desc: "Isi nama klien, deskripsi, dan jumlah XLM",
              },
              {
                step: "3",
                title: "Terima Bayaran",
                desc: "Bagikan tautan — klien bayar langsung ke dompet Anda",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-800">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400">
        Caira © {new Date().getFullYear()} · Dibangun di atas{" "}
        <a
          href="https://stellar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:underline"
        >
          Stellar
        </a>
      </footer>
    </div>
  );
}
