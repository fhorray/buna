import { createRoute } from 'buna';
import type { BunaMeta, RouteContext } from 'buna';

const AboutPage = createRoute((ctx: RouteContext) => {
  return (
    <main>
      <h1 className="text-red-500">About Page</h1>
      <p>Hello from buna playground.</p>

      <section>
        <h2>Debug context</h2>
        <pre className="text-xs">
          {JSON.stringify(
            {
              params: ctx.params,
              search: ctx.searchParams
                ? Object.fromEntries(ctx.searchParams.entries())
                : null,
              hash: ctx.hash,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </main>
  );
});

// Versão com meta estático (objeto)
AboutPage.meta = {
  title: 'About - Buna Playground',
  description: 'Example about page using Buna createRoute.',
  keywords: ['buna', 'playground', 'about'],
  htmlLang: 'en',
  robots: {
    index: true,
    follow: true,
  },
  canonicalUrl: 'https://example.com/about',
  openGraph: {
    title: 'About Buna Playground',
    description: 'Example about page using Buna createRoute.',
    url: 'https://example.com/about',
    siteName: 'Buna Playground',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Buna Playground',
    description: 'Example about page using Buna createRoute.',
  },
} satisfies BunaMeta;

export default AboutPage;
