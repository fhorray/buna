import { Hono } from 'hono';
import { renderer } from './renderer';
import routes from '#hono-app';

const app = new Hono();

app.use(renderer);
app.route('/', routes);

export default app;
