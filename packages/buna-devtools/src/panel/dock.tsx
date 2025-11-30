import type { Child, FC, JSX } from 'hono/jsx';

type DevtoolsDockProps = {
  open: boolean;
  width?: number;
  onOpenChange: (open: boolean) => void;
  children: Child;
};

export const DevtoolsDock: FC<DevtoolsDockProps> = ({
  open,
  width = 420,
  onOpenChange,
  children,
}) => {
  const panelStyle: JSX.CSSProperties = {
    width: `${width}px`,
    transform: open ? 'translateX(0)' : 'translateX(100%)',
  };

  const triggerStyle: JSX.CSSProperties = {
    right: open ? `${width}px` : '0px',
  };

  return (
    <>
      {/* Trigger lateral com chevron */}
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          class="fixed top-1/2 -translate-y-1/2 z-99996 flex items-center justify-center
           w-6 h-12 rounded-l-full border border-slate-700 bg-slate-900
           text-slate-200 shadow-[0_0_12px_rgba(0,0,0,0.4)] cursor-pointer
           hover:bg-slate-800 hover:border-slate-600 transition-colors"
          style={triggerStyle}
          aria-label="Open devtools"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {/* Painel lateral (sheet) */}
      <div
        class="fixed top-0 right-0 h-screen max-h-screen z-[99997] bg-slate-900/98 border-l border-slate-800 flex flex-col transition-transform duration-300 ease-out shadow-[0_0_20px_rgba(0,0,0,0.45)]"
        style={panelStyle}
      >
        <button
          type="button"
          class="absolute top-2 right-2 p-2 rounded-md hover:bg-slate-700/40 transition-colors cursor-pointer"
          onClick={() => onOpenChange(!open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-slate-300"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </>
  );
};
