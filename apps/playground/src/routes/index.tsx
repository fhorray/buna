import { CreateComponent } from '@buna/router';
import { useState } from 'hono/jsx';

type AboutParams = {
  dataAbout: 'test about';
}; // no dynamic params
type AboutSearch = {
  dataSearch: 'test search';
}; // no specific search schema

export default CreateComponent('/', (props) => {
  const [count, setCount] = useState(0);
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        {/* Intro */}
        <h1 className="text-4xl font-semibold tracking-tight mb-3">
          Welcome to <span className="text-emerald-400">buna()</span>
        </h1>
        <p className="text-slate-400">
          Start editing{' '}
          <code className="px-1.5 py-0.5 bg-slate-800 rounded text-emerald-300">
            src/routes/index.tsx
          </code>{' '}
          to begin.
        </p>

        {/* Interactive Example */}
        <div className="mt-10 border border-slate-700 bg-slate-800/50 rounded-xl p-6 shadow-lg">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">
            Interactive example
          </p>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-medium tabular-nums">{count}</span>

            <button
              onClick={() => setCount((prev: number) => prev + 1)}
              className="px-4 py-2 text-sm rounded-lg border border-emerald-400/70 bg-emerald-500/80 text-slate-950 hover:bg-emerald-400 transition"
            >
              Increment
            </button>
          </div>

          <button
            onClick={() => setCount(0)}
            className="block mx-auto mt-4 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Reset
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-slate-500">
          Built using buna() + Tailwind
        </p>
      </div>
    </main>
  );
});
