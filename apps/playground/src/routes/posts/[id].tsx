import { createRouteComponent } from '@buna/router';

type PostProps = {
  id: string;
};

export default createRouteComponent<PostProps>(function PostPage({
  c,
  params,
}) {
  return (
    <div>
      <h1>Post {params.id}</h1>
      <p>Method: {c?.req.method}</p>
    </div>
  );
});
