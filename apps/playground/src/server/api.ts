import { Hono } from 'hono';


const api = new Hono();


api.get('/demo', async (c) => {
  return c.json({
    data: 'sucess',
  });
});


api.get("/todo/:id", async c => {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');

  if (!res.ok) {
    return c.json({
      data: null
    })
  }
  const data = await res.json();

  console.log(data)

  return c.json({ data })
})

export default api