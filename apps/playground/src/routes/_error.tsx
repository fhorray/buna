import { CreateComponent } from '@buna/router';

const GlobalError = CreateComponent(() => {
  return (
    <main>
      <h1>Global error page</h1>
      <p>Something failed while rendering this route.</p>
    </main>
  );
});

export default GlobalError;
