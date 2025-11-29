import { CreateComponent } from '@buna/router';

type PostProps = {
  id: string;
};

type LoaderResult = { post: { data: string } } | { error: string };

const PostsDetailsPage = CreateComponent<
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
