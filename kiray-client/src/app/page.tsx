export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#fafaf9] text-[#1e293b]">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
          Kiray <span className="text-orange-600">Rental Marketplace</span>
        </h1>
        <p className="text-base sm:text-lg text-stone-600 font-medium leading-relaxed">
          Foundation v0.1 initialized. Direct peer-to-peer property rentals in Addis Ababa.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            Next.js 15
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Tailwind CSS v4
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            v0.1 Foundation
          </span>
        </div>
      </div>
    </main>
  );
}
