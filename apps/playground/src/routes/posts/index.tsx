import { CreateComponent } from '@buna/router';

export default CreateComponent('/posts', () => {
  return <div className="text-red-600 text-2xl font-bold">Posts Route</div>;
});
