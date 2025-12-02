import { createRoot } from 'react-dom/client';

function IndexPage() {
  return (
    <main>
      <h1>Playground home</h1>
      <p>Hello from buna playground.</p>
    </main>
  );
}

// This is just a basic client entry for now
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<IndexPage />);
  }
}

export default IndexPage;
