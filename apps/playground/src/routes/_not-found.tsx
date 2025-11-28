export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-slate-100 px-6">
      <div className="text-center max-w-md">
        {/* Status */}
        <p className="text-sm uppercase tracking-widest text-slate-500  mb-2">
          Error <span className="text-emerald-400">404</span>
        </p>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          The page you’re looking for doesn’t exist — or was moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="/"
            className="px-4 py-2 text-sm rounded-lg border border-emerald-400/70 bg-emerald-500/80 text-slate-950 hover:bg-emerald-400 transition"
          >
            Go home
          </a>

          <button
            onClick={() => history.back()}
            className="px-4 py-2 text-sm rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 transition"
          >
            Go back
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-slate-500">
          Powered by buna() – custom 404 route
        </p>
      </div>
    </main>
  );
}
