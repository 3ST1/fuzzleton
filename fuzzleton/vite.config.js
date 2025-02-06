// import wasm from "vite-plugin-wasm";

export default {
  //   plugins: [wasm()],
  //   assetsInclude: ["**/*.wasm"],

  // To solve wasm loading issue
  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
};
