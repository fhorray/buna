import { config as router } from '#router';
import { createClientApp } from '@buna/react';
import { RouterView } from './shell';

createClientApp({
  router,
  RouterView,
  defaultTitle: 'Buna Playground',
});
