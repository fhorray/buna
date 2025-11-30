import { Hono } from 'hono';


const api = new Hono();


api.get('/demo', async (c) => {
  return c.json({
    data: 'sucess',
  });
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

api.get("/todo/:id", async c => {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');

  if (!res.ok) {
    return c.json({ data: null });
  }

  const data = await res.json();

  await sleep(3000);

  return c.json({ data });
});

api.get("/admins", async c => {
  return c.json({
    data: [
      {
        id: "1",
        name: "Francy Santos",
        email: "francy@email.com"
      }
    ]
  })
})



export default api