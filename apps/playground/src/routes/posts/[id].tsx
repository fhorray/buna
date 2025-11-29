import { CreateComponent } from '@buna/router';

const PostPage = CreateComponent('/posts/:id', ({ params, search, hash }) => {
  // params: { id: string }
  // se tentar params.slug -> erro de tipo

  return (
    <div>
      <h1>Post {params.id}</h1>
    </div>
  );
});

export default PostPage;
