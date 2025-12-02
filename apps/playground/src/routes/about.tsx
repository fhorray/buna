import { createRoute } from 'buna';

function IndexPage() {
  return (
    <main>
      <h1 className="text-red-500">About Page</h1>
      <p>Hello from buna playground.</p>
    </main>
  );
}

export default createRoute(IndexPage);
