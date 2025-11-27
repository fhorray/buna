import { useEffect, useState } from 'hono/jsx';
import { $router } from '#router';
import { createRouteComponent } from '@/plugins/create-component';

export default createRouteComponent(function Team({ params }) {
  return (
    <div className="text-red-500">
      <h1>About</h1>
      <pre>router state: {JSON.stringify($router.get(), null, 2)}</pre>
      <button
        className="bg-white border-2 border-blue-400 p-4 px-6"
        onClick={(e) => {
          console.log('AQUI');
          e.preventDefault();
          $router.open('/team');
        }}
      >
        Team
      </button>
    </div>
  );
});
