import { CreateComponent } from '@buna/router';
import { useState } from 'hono/jsx';

const SetingsPage = CreateComponent('/setings', ({ params, search, hash }) => {
  const [showDebug, setShowDebug] = useState(false);

  const handleOpenInEditor = async () => {
    try {
      await fetch('/__buna/devtools/open-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'src/routes/setings.tsx' }),
      });
    } catch (err) {
      console.error('[ScaffoldedPage] open-route error', err);
      alert('Failed to open file in editor.');
    }
  };

  return (
    <div className="h-full bg-[#020617] text-slate-100 flex items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/40 p-6 space-y-4">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
            Buna() Route
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            SetingsPage
          </h1>
          <p className="text-[12px] text-slate-400">
            This page was scaffolded by Buna Devtools. Start editing it at{' '}
            <code className="font-mono text-[11px] text-slate-300">
              src/routes/setings.tsx
            </code>.
          </p>
        </header>

        <div className="text-[12px] text-slate-300 space-y-1">
          <div>
            <span className="font-semibold text-slate-400">Path:</span>{' '}
            <span className="font-mono text-[11px] text-emerald-300">
              /setings
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400">Params:</span>{' '}
            <span className="font-mono text-[11px]">
              {JSON.stringify(params)}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400">Search:</span>{' '}
            <span className="font-mono text-[11px]">
              {JSON.stringify(search)}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-400">Hash:</span>{' '}
            <span className="font-mono text-[11px]">
              {hash ?? '-'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-emerald-400/60 px-2 py-[3px] text-[10px] font-semibold text-emerald-100 hover:bg-emerald-500/15 transition-colors"
            onClick={handleOpenInEditor}
          >
            Edit in editor
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
            onClick={() => setShowDebug((v) => !v)}
          >
            {showDebug ? 'Hide debug' : 'Show debug'}
          </button>
        </div>

        {showDebug && (
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-slate-950/70 p-3 text-[11px] text-slate-200">
            {JSON.stringify({ params, search, hash }, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
});

SetingsPage.meta = () => {
  return {
    title: 'SetingsPage – Buna Playground',
    description: 'Scaffolded page created by Buna Devtools.',
    keywords: ['buna', 'devtools', 'SetingsPage', 'route'],
  };
};

export default SetingsPage;
