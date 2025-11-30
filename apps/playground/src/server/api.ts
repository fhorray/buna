import { Hono } from 'hono';

import usersModule from './modules/users.module';
import adminModule from './modules/admin.module';
const api = new Hono();

api.route('/users', usersModule);

api.route('/admin', adminModule);

export default api