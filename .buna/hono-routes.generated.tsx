// AUTO-GENERATED. DO NOT EDIT.
import { Hono } from 'hono'
import Route_About from '../src/routes/about.tsx'
import Route_PostsId from '../src/routes/posts/[id].tsx'
import Route_Posts from '../src/routes/posts/index.tsx'

const app = new Hono()

app.get('/about', c => c.render(<Route_About c={c} params={c.req.param()} />))
app.get('/posts/:id', c => c.render(<Route_PostsId c={c} params={c.req.param()} />))
app.get('/posts', c => c.render(<Route_Posts c={c} params={c.req.param()} />))

export default app
