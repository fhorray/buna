import '../../dist/index.css';

import {
  $devtoolsEnabled,
  $logs,
  $mutations,
  $queries,
  $router,
} from '@buna/devtools';
import { useQuery } from '@buna/react';
import type { FC } from 'hono/jsx';
import { useState } from 'hono/jsx';
import { DevtoolsDock } from './dock';
import { LogsTab } from './logs';
import { MutationsTab } from './mutations';
import { QueriesTab } from './queries';
import { RouterTab } from './router';
import { monoClass } from './utils';

type DevtoolsTab = 'router' | 'queries' | 'mutations' | 'logs';

export const BunaDevtoolsPanel: FC = () => {
  const enabled = useQuery($devtoolsEnabled);
  if (!enabled) return null;

  const router = useQuery($router);
  const queries = useQuery($queries) || {};
  const mutations = useQuery($mutations) || {};
  const logs = useQuery($logs) || [];

  const [tab, setTab] = useState<DevtoolsTab>('router');
  const [isOpen, setIsOpen] = useState(true);

  function handleOpenChange(next: boolean) {
    setIsOpen(next);
  }

  return (
    <DevtoolsDock open={isOpen} onOpenChange={handleOpenChange} width={420}>
      <div class="h-full w-full text-slate-200 text-[12px] flex flex-col overflow-hidden">
        {/* Header */}
        <header class="px-3 py-2 border-b border-slate-700 bg-slate-950 flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <div class="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-300">
              Buna Devtools
            </div>
            <div
              class={`${monoClass} text-[11px] ${
                router ? 'text-indigo-300' : 'text-slate-500'
              } whitespace-nowrap overflow-hidden text-ellipsis`}
              title={router?.currentPath}
            >
              {router ? router.currentPath : 'no route'}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div class="flex items-center border-b border-slate-700 bg-slate-900/95">
          {(['router', 'queries', 'mutations', 'logs'] as DevtoolsTab[]).map(
            (t) => {
              const isActive = tab === t;
              const base =
                'flex-none px-2.5 py-1.5 text-[11px] font-semibold cursor-pointer border transition-all';

              const activeClasses: Record<DevtoolsTab, string> = {
                router:
                  'border-emerald-500/80 bg-emerald-700/20 text-emerald-100 shadow-sm',
                queries:
                  'border-blue-500/80 bg-blue-700/20 text-blue-100 shadow-sm',
                mutations:
                  'border-violet-500/80 bg-violet-700/20 text-violet-100 shadow-sm',
                logs: 'border-amber-500/80 bg-amber-700/20 text-amber-100 shadow-sm',
              };

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  class={
                    base +
                    ' ' +
                    (isActive
                      ? activeClasses[t]
                      : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700')
                  }
                >
                  {t === 'router' && 'Router'}
                  {t === 'queries' && 'Queries'}
                  {t === 'mutations' && 'Mutations'}
                  {t === 'logs' && 'Logs'}
                </button>
              );
            },
          )}
        </div>

        {/* Body */}
        <div class="flex-1 overflow-hidden flex flex-col gap-2">
          {tab === 'router' && <RouterTab router={router} />}
          {tab === 'queries' && <QueriesTab queries={queries} />}
          {tab === 'mutations' && <MutationsTab mutations={mutations} />}
          {tab === 'logs' && <LogsTab logs={logs as any[]} />}
        </div>
      </div>
    </DevtoolsDock>
  );
};
