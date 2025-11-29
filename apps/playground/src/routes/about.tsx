import { api } from '#api';
import { useQuery } from '@buna/react';
import { CreateComponent } from '@buna/router';
import { useState } from 'hono/jsx';

// apps/playground/src/routes/posts/[id].tsx

const AboutPage = CreateComponent('/about', ({ params, search, hash }) => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-3xl">
        {/* Intro */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            About Page
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            This page exists to show how route components receive{' '}
            <code className="px-1 py-0.5 bg-slate-800 rounded text-emerald-300">
              params
            </code>
            ,{' '}
            <code className="px-1 py-0.5 bg-slate-800 rounded text-emerald-300">
              search
            </code>{' '}
            and{' '}
            <code className="px-1 py-0.5 bg-slate-800 rounded text-emerald-300">
              hash
            </code>{' '}
            from the router — both on the server and on the client.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr,1.4fr] items-start">
          {/* Main content card */}
          <section className="border border-slate-700 bg-slate-800/50 rounded-xl p-6 shadow-lg">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">
              Overview
            </p>

            <h2 className="text-xl font-medium mb-3">What is this page for?</h2>

            <p className="text-slate-300 mb-4">
              It is a simple example of a typed route component built with{' '}
              <span className="text-emerald-400">CreateComponent()</span>. You
              can use it as a reference when wiring new pages, layouts, or
              route-specific metadata.
            </p>

            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>
                  Typed <code>params</code> and <code>search</code> for safer
                  routing.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>
                  Access to <code>hash</code> to react to URL fragments.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>
                  Optional Hono <code>Context</code> (<code>c</code>) on SSR for
                  headers, cookies, etc.
                </span>
              </li>
            </ul>

            <p className="mt-4 text-xs text-slate-500">
              Tip: you can reuse this structure as a template for documentation
              or guide pages inside your buna app.
            </p>
          </section>

          {/* Debug / route context card */}
          <section className="border border-slate-700 bg-slate-900/60 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Route context
              </p>

              <button
                type="button"
                onClick={() => setShowDebug((prev) => !prev)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 transition"
              >
                {showDebug ? 'Hide debug' : 'Show debug'}
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <p className="text-slate-400 mb-1">hash</p>
                <pre className="bg-black/40 rounded-md px-3 py-2 overflow-x-auto">
                  {hash || '""'}
                </pre>
              </div>

              {showDebug && (
                <>
                  <div>
                    <p className="text-slate-400 mb-1">params</p>
                    <pre className="bg-black/40 rounded-md px-3 py-2 overflow-x-auto">
                      {JSON.stringify(params, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <p className="text-slate-400 mb-1">search</p>
                    <pre className="bg-black/40 rounded-md px-3 py-2 overflow-x-auto">
                      {JSON.stringify(search, null, 2)}
                    </pre>
                  </div>

                  {/* If you ever want to inspect c on the server, you can log it instead of rendering */}
                  {/* <div>
                      <p className="text-slate-400 mb-1">context (SSR only)</p>
                      <pre className="bg-black/40 rounded-md px-3 py-2 overflow-x-auto">
                        {'[context is available only on the server]'}
                      </pre>
                    </div> */}
                </>
              )}
            </div>

            <p className="mt-4 text-[0.70rem] text-slate-500">
              These values are provided by <code>@buna/router</code>. You can
              use them to build dynamic pages, protected routes, or
              feature-flagged experiences.
            </p>
          </section>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-slate-500">
          Built using buna() + Tailwind – About page
        </p>
      </div>
    </main>
  );
});

AboutPage.meta = ({ params }) => {
  return {
    title: 'About – Buna Playground',
    description: 'Learn more about the Buna framework and playground.',
    keywords: ['buna', 'framework', 'about'],
  };
};

export default AboutPage;
