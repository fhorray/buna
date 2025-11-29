import type { FC } from 'hono/jsx';
import { useState } from 'hono/jsx';
import {
  baseCardClass,
  monoClass,
  matchSearch,
  type LogLevelFilter,
} from './utils';

type LogsTabProps = {
  logs: any[];
};

function getLogLevelColor(level: string): string {
  const normalized = level.toLowerCase();

  if (normalized === 'error')
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  if (normalized === 'warn')
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (normalized === 'info')
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  if (normalized === 'debug')
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';

  return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
}

export const LogsTab: FC<LogsTabProps> = ({ logs }) => {
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevelFilter>('all');
  const [logSearch, setLogSearch] = useState('');

  const filteredLogs = (logs as any[])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .filter((log) => {
      const level = String(log.level || '').toLowerCase();
      if (logLevelFilter !== 'all' && level !== logLevelFilter.toLowerCase()) {
        return false;
      }

      return matchSearch(
        logSearch,
        log.message,
        log.source,
        JSON.stringify(log.payload),
      );
    });

  return (
    <section class={`${baseCardClass} flex-1 flex flex-col min-h-0`}>
      <div class="mb-2 flex items-center justify-between gap-2">
        <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-300">
          Logs
        </span>
        <span class="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
          {filteredLogs.length} / {logs.length}
        </span>
      </div>

      {/* Filters */}
      <div class="flex flex-wrap gap-1.5 mb-2 items-center">
        <input
          type="text"
          placeholder="Search message / source..."
          value={logSearch}
          onInput={(e) => setLogSearch((e.currentTarget as any).value)}
          class="flex-1 min-w-[120px] rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500/50 transition-colors"
        />

        <select
          value={logLevelFilter}
          onInput={(e) =>
            setLogLevelFilter((e.currentTarget as any).value as LogLevelFilter)
          }
          class="rounded-full border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] outline-none cursor-pointer hover:border-slate-600 transition-colors"
        >
          <option value="all">Level: All</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <div class="flex-1 flex items-center justify-center text-slate-500 text-[11.5px] text-center px-4">
          {logs.length === 0 ? 'No logs yet' : 'No logs match this filter'}
        </div>
      ) : (
        <div
          class={`flex flex-col gap-1.5 overflow-auto ${monoClass} text-[11px]`}
        >
          {filteredLogs.map((log: any) => {
            const levelColor = getLogLevelColor(log.level);

            return (
              <div
                key={log.id}
                class="border border-slate-700 rounded-lg px-2 py-1.5 flex flex-col gap-1 bg-slate-950 hover:border-slate-600 transition-colors"
              >
                <div class="flex justify-between items-center gap-2">
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      class={`uppercase text-[9px] font-bold px-1.5 py-0.5 rounded border ${levelColor}`}
                    >
                      {log.level}
                    </span>
                    <span class="text-[10px] text-slate-400 truncate">
                      {log.source}
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-500 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div class="break-words text-slate-100">{log.message}</div>
                {log.payload && (
                  <details class="mt-1">
                    <summary class="text-[10px] text-slate-400 cursor-pointer hover:text-slate-300">
                      View Payload
                    </summary>
                    <pre class="mt-1 whitespace-pre-wrap break-all text-slate-300 bg-slate-900 rounded p-1.5 border border-slate-700">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
