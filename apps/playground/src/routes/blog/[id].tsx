import { createRoute, type RouteContext } from 'buna';

type Params = {
  id: string;
};

const PostDetails = createRoute((ctx: RouteContext<Params>) => {
  const id = ctx.params?.id;
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-slate-100 flex items-center justify-center px-6">
      Blog page – id: {id}
    </main>
  );
});

export default PostDetails;
