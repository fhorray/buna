import { createRouteComponent } from '@buna/router';

type AboutParams = {}; // sem params dinâmicos
type AboutSearch = {}; // sem query específica

const AboutPage = createRouteComponent<AboutParams, AboutSearch>(
  ({ params, search, hash, c }) => {
    // Here you have:
    // - params: AboutParams
    // - search: AboutSearch
    // - hash: string
    // - c?: Context (Hono) quando vier do SSR

    return (
      <section>
        <h1>About</h1>
        <p>This is the about page.</p>
        <span>{JSON.stringify(params)}</span>
        <span>{JSON.stringify(search)}</span>
        {/* <span>{JSON.stringify(c)}</span> */}
      </section>
    );
  },
);

// AboutPage.meta = {
//   title: 'About – Buna Playground',
//   description: 'Learn more about the Buna framework and playground.',
//   keywords: ['buna', 'framework', 'about'],
// };

AboutPage.meta = ({ params }) => {
  console.log({ params });
  return {
    title: 'About – Buna Playground',
    description: 'Learn more about the Buna framework and playground.',
    keywords: ['buna', 'framework', 'about'],
  };
};

export default AboutPage;
