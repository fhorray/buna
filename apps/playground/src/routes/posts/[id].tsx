import { createRouteComponent } from '@buna/router';

type PostProps = {
  id: string;
};

const PostsDetailsPage = createRouteComponent<PostProps>(function PostPage({
  params,
}) {
  return (
    <div>
      <h1>Post {params.id}</h1>
    </div>
  );
});

PostsDetailsPage.meta = ({ params }) => {
  return {
    title: `Posts - ${params.id}`,
  };
};

export default PostsDetailsPage;
