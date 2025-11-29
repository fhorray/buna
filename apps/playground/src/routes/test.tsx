import { api } from '#api';
import { useQuery } from '@buna/react';
import { CreateComponent } from '@buna/router';

const $posts = api.todo.byId('123');

const ApiTest = CreateComponent('/test', () => {
  // params: { id: string }
  // se tentar params.slug -> erro de tipo

  const posts = useQuery($posts);

  if (posts.loading) {
    return <span>Loading...</span>;
  }

  console.log({ posts });

  return <code>{JSON.stringify(posts.data, null, 2)}</code>;
});

export default ApiTest;
