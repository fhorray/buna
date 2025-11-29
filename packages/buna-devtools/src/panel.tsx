import type { FC, JSX } from 'hono/jsx';
import { useState } from 'hono/jsx';
import { useQuery } from '@buna/react';
import { $devtoolsEnabled, $router, $queries } from '@buna/devtools';

type DevtoolsTab = 'router' | 'queries';

const baseCardStyle: JSX.CSSProperties = {
  border: '1px solid rgba(99, 102, 241, 0.15)',
  borderRadius: '0.75rem',
  padding: '10px 12px',
  background: '#0b1120',
};

const monoStyle: JSX.CSSProperties = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '11.5px',
};

const badgeStyle: JSX.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px 8px',
  borderRadius: '999px',
  fontSize: '10px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

function getStatusColors(status?: string): JSX.CSSProperties {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'success') {
    return {
      background: 'rgba(16, 185, 129, 0.12)',
      color: '#6ee7b7',
      border: '1px solid rgba(16, 185, 129, 0.5)',
    };
  }

  if (normalized === 'error' || normalized === 'failed') {
    return {
      background: 'rgba(239, 68, 68, 0.12)',
      color: '#fecaca',
      border: '1px solid rgba(248, 113, 113, 0.6)',
    };
  }

  if (normalized === 'loading' || normalized === 'pending') {
    return {
      background: 'rgba(59, 130, 246, 0.12)',
      color: '#bfdbfe',
      border: '1px solid rgba(96, 165, 250, 0.6)',
    };
  }

  return {
    background: 'rgba(75, 85, 99, 0.15)',
    color: '#d1d5db',
    border: '1px solid rgba(75, 85, 99, 0.6)',
  };
}

export const BunaDevtoolsPanel: FC = () => {
  const enabled = useQuery($devtoolsEnabled);
  const [activeTab, setActiveTab] = useState<DevtoolsTab>('router');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [queryFilter, setQueryFilter] = useState('');

  if (!enabled) return null;

  const router = useQuery($router);
  const queriesRecord = useQuery($queries) || {};
  const queriesList = Object.values(queriesRecord);

  const filteredQueries = queriesList.filter((q: any) => {
    const key = (q.key || []) as any[];
    const method = String(key[0] ?? '').toLowerCase();
    const path = String(key[1] ?? '').toLowerCase();
    const term = queryFilter.toLowerCase().trim();

    if (!term) return true;
    return method.includes(term) || path.includes(term);
  });

  const panelHeight = isCollapsed ? '40px' : '60vh';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '420px',
        height: panelHeight,
        background: '#020617',
        color: '#e5e7eb',
        borderTopLeftRadius: '0.75rem',
        border: '1px solid rgba(55, 65, 81, 0.8)',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid rgba(55, 65, 81, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '4px',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.6)',
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Buna Devtools
          </div>
          <div
            style={{
              ...monoStyle,
              fontSize: '11px',
              color: router ? '#a5b4fc' : '#6b7280',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {router ? router.currentPath : 'no active route'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          style={{
            border: '1px solid rgba(55, 65, 81, 0.9)',
            background: 'rgba(15, 23, 42, 0.9)',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#e5e7eb',
            textTransform: 'uppercase',
          }}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </header>

      {/* Tabs */}
      {!isCollapsed && (
        <div
          style={{
            borderBottom: '1px solid rgba(55, 65, 81, 0.7)',
            display: 'flex',
            padding: '6px 8px',
            gap: '6px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('router')}
            style={{
              flex: '0 0 auto',
              padding: '6px 10px',
              borderRadius: '999px',
              border:
                activeTab === 'router'
                  ? '1px solid rgba(34, 197, 94, 0.9)'
                  : '1px solid transparent',
              background:
                activeTab === 'router'
                  ? 'rgba(22, 163, 74, 0.15)'
                  : 'transparent',
              color:
                activeTab === 'router' ? '#bbf7d0' : 'rgba(156, 163, 175, 0.9)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Router
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queries')}
            style={{
              flex: '0 0 auto',
              padding: '6px 10px',
              borderRadius: '999px',
              border:
                activeTab === 'queries'
                  ? '1px solid rgba(59, 130, 246, 0.9)'
                  : '1px solid transparent',
              background:
                activeTab === 'queries'
                  ? 'rgba(37, 99, 235, 0.15)'
                  : 'transparent',
              color:
                activeTab === 'queries'
                  ? '#bfdbfe'
                  : 'rgba(156, 163, 175, 0.9)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Queries</span>
            <span
              style={{
                ...badgeStyle,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(55, 65, 81, 0.9)',
              }}
            >
              {queriesList.length}
            </span>
          </button>
        </div>
      )}

      {/* Content */}
      {!isCollapsed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '8px',
            gap: '8px',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {activeTab === 'router' && (
            <section
              style={{
                ...baseCardStyle,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  marginBottom: '8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Router Snapshot
              </div>

              {router ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    overflow: 'auto',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '600',
                        color: '#9ca3af',
                        marginBottom: '4px',
                      }}
                    >
                      Current Path
                    </div>
                    <div
                      style={{
                        ...monoStyle,
                        padding: '6px 8px',
                        borderRadius: '0.5rem',
                        background: '#020617',
                        border: '1px solid rgba(55, 65, 81, 0.8)',
                        color: '#a5b4fc',
                      }}
                    >
                      {router.currentPath}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '600',
                        color: '#9ca3af',
                        marginBottom: '4px',
                      }}
                    >
                      Params
                    </div>
                    <pre
                      style={{
                        ...monoStyle,
                        background: '#020617',
                        borderRadius: '0.5rem',
                        padding: '8px',
                        border: '1px solid rgba(55, 65, 81, 0.8)',
                        maxHeight: '120px',
                        overflow: 'auto',
                        color: '#e5e7eb',
                      }}
                    >
                      {JSON.stringify(router.params, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        fontWeight: '600',
                        color: '#9ca3af',
                        marginBottom: '4px',
                      }}
                    >
                      Search
                    </div>
                    <pre
                      style={{
                        ...monoStyle,
                        background: '#020617',
                        borderRadius: '0.5rem',
                        padding: '8px',
                        border: '1px solid rgba(55, 65, 81, 0.8)',
                        maxHeight: '120px',
                        overflow: 'auto',
                        color: '#e5e7eb',
                      }}
                    >
                      {JSON.stringify(router.search, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    fontSize: '11.5px',
                    textAlign: 'center',
                    padding: '0 16px',
                  }}
                >
                  No router snapshot yet.
                </div>
              )}
            </section>
          )}

          {activeTab === 'queries' && (
            <section
              style={{
                ...baseCardStyle,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Queries
                </div>

                <input
                  type="text"
                  value={queryFilter}
                  onInput={(e) =>
                    setQueryFilter((e.currentTarget as any)?.value)
                  }
                  placeholder="Filter by method or path..."
                  style={{
                    flex: 1,
                    borderRadius: '999px',
                    border: '1px solid rgba(55, 65, 81, 0.9)',
                    background: '#020617',
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: '#e5e7eb',
                    outline: 'none',
                  }}
                />
              </div>

              {filteredQueries.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    fontSize: '11.5px',
                    textAlign: 'center',
                    padding: '0 16px',
                  }}
                >
                  {queriesList.length === 0
                    ? 'No queries recorded yet.'
                    : 'No queries match this filter.'}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    overflow: 'auto',
                  }}
                >
                  {filteredQueries.map((q: any) => {
                    const key = (q.key || []) as any[];
                    const method = key[0] ?? 'UNKNOWN';
                    const path = key[1] ?? '';

                    const statusStyles = getStatusColors(q.status);

                    return (
                      <div
                        key={q.id}
                        style={{
                          ...baseCardStyle,
                          padding: '8px 10px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '4px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                ...monoStyle,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: '600',
                                color: '#93c5fd',
                              }}
                            >
                              {String(method)}
                            </div>
                            <div
                              style={{
                                ...monoStyle,
                                fontSize: '11px',
                                color: '#e5e7eb',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={String(path)}
                            >
                              {String(path) || '(no key path)'}
                            </div>
                          </div>

                          <span
                            style={{
                              ...badgeStyle,
                              ...statusStyles,
                            }}
                          >
                            {String(q.status || 'unknown')}
                          </span>
                        </div>

                        {q.error && (
                          <div style={{ marginTop: '4px' }}>
                            <div
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: '#fca5a5',
                                marginBottom: '2px',
                              }}
                            >
                              Error
                            </div>
                            <pre
                              style={{
                                ...monoStyle,
                                background: '#111827',
                                borderRadius: '0.5rem',
                                padding: '6px 8px',
                                border: '1px solid rgba(127, 29, 29, 0.7)',
                                maxHeight: '80px',
                                overflow: 'auto',
                                color: '#fecaca',
                              }}
                            >
                              {JSON.stringify(q.error, null, 2)}
                            </pre>
                          </div>
                        )}

                        {q.data && (
                          <div style={{ marginTop: '4px' }}>
                            <div
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: '#9ca3af',
                                marginBottom: '2px',
                              }}
                            >
                              Data (Preview)
                            </div>
                            <pre
                              style={{
                                ...monoStyle,
                                background: '#020617',
                                borderRadius: '0.5rem',
                                padding: '6px 8px',
                                border: '1px solid rgba(55, 65, 81, 0.8)',
                                maxHeight: '80px',
                                overflow: 'auto',
                                color: '#e5e7eb',
                              }}
                            >
                              {JSON.stringify(q.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};
