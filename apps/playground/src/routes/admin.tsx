import { CreateComponent } from '@buna/router';
import { useState } from 'hono/jsx';

const AdminPage = CreateComponent('/admin', ({ params, search, hash }) => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="h-full bg-[#020617] text-slate-100 flex items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/40 p-6 space-y-4">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
            Buna() Route
          </p>
          <h1 className="text-xl font-semibold text-slate-50">
            AdminPage
          </h1>
          <p className="text-[12px] text-slate-400">
            This page was scaffolded by Buna Devtools. Start editing it at
            {' '}
            <code className="font-mono text-[11px] text-slate-300">src/routes/admin.tsx</code>.
          </p>
        </header>

       

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
          onClick={() => setShowDebug((v) => !v)}
        >
          {showDebug ? 'Hide debug' : 'Show debug'}
        </button>

        {showDebug && (
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-slate-950/70 p-3 text-[11px] text-slate-200">
            {JSON.stringify({ params, search, hash }, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
});

AdminPage.meta = ({ params }) => {
  return {
    title: 'AdminPage – Buna Playground',
    description: 'Scaffolded page created by Buna Devtools.',
    keywords: ['buna', 'devtools', 'AdminPage', 'route'],
  };
};

export default AdminPage;
