import type { BunPlugin } from "bun";

const myPlugin: BunPlugin = {
  name: "my-custom-plugin",
  setup(build) {
    // Plugin implementation Example
    build.onLoad({ filter: /\.custom$/ }, async args => {
      const text = await Bun.file(args.path).text();
      return {
        contents: `export default ${JSON.stringify(text)};`,
        loader: "js",
      };
    });
  },
};

export default myPlugin;