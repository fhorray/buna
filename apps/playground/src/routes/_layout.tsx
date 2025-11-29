import type { Child, FC } from 'hono/jsx';
import type { RouteProps } from '@buna/router';
import { $router } from '#router';

type HomeLayoutProps = RouteProps & {
  children: Child;
};

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const onNavigate = (route: string) => {
    $router.open(route);
  };

  return (
    <div class="h-screen flex flex-col bg-[#0d0d0d] text-slate-100 font-sans">
      {/* Header */}
      <header class="border-b border-slate-800 bg-[#111]/80 backdrop-blur-lg supports-backdrop-filter:bg-[#111]/50">
        <div class="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          {/* Branding */}
          <span class="inline-flex items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-semibold">
            buna<span class="text-emerald-400">()</span>
          </span>

          {/* Navigation  */}
          <nav class="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <a href="/" class="hover:text-slate-100 transition">
              Home
            </a>
            <a href="/about" class="hover:text-slate-100 transition">
              About
            </a>
            <a href="/blog" class="hover:text-slate-100 transition">
              Blog
            </a>
            <span onClick={() => onNavigate('/posts')}>Posts</span>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main class="flex-1">{children}</main>

      {/* Footer */}
      <footer class="border-t border-slate-800 bg-[#111]/80">
        <div class="mx-auto max-w-6xl px-5 py-6 text-xs text-slate-500">
          <p class="tracking-wide">
            Built with Buna() · Hono · Vite · Cloudflare Workers
          </p>
          <p class="mt-1 opacity-60">
            RouterView acts as the root layout wrapper. Every route is rendered
            inside here.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;
