// src/routes/_error.tsx
import { createRouteComponent } from '@buna/router';

const GlobalError = createRouteComponent(() => {
  return (
    <main>
      <h1>Global error page</h1>
      <p>Something failed while rendering this route.</p>
    </main>
  );
});

export default GlobalError;
