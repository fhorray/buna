import { createComponent } from '@buna/router';
import { createRouteQuery } from '@buna/router/query';

type PostProps = {
  id: string;
};

type LoaderResult = { post: { data: string } } | { error: string };

export const loader = createRouteQuery<LoaderResult, PostProps>(
  async ({ c }) => {
    try {
      const origin = new URL(c.req?.url).origin;
      const res = await fetch(`${origin}/demo`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { data: string };

      return {
        post: data,
      };
    } catch (err) {
      console.error('[loader error]:', err);
      return { error: String(err) };
    }
  },
);

const PostsDetailsPage = createComponent<
  PostProps,
  {},
  {
    data: string;
  }
>(function PostPage({ params, data }) {
  if (typeof window === 'undefined') {
    console.log('[SSR component data]', data);
  }
  return (
    <div>
      <h1>Post {data}</h1>
    </div>
  );
});

PostsDetailsPage.meta = ({ params }) => {
  return {
    title: `Posts - ${params.id}`,
  };
};

export default PostsDetailsPage;
