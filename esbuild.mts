import { globSync } from "node:fs";

import esbuild, { type BuildOptions } from "esbuild";

const isDevelopment = process.env.NODE_ENV === "development";

const entryOptions: BuildOptions = {
    entryPoints: globSync("api/{endpoints,jobs}/*/*.{ts,tsx}"),
    outbase: "api",
    outdir: "dist/lambda",
    entryNames: "[dir]/[name]/[name]"
};
const targetOptions: BuildOptions = { platform: "node", target: "node22" };
const bundleOptions: BuildOptions = {
    bundle: true,
    sourcemap: true,
    sourcesContent: false,
    loader: { ".ttf": "base64", ".jpg": "base64" }
};
const productionOptions: BuildOptions = {
    minify: true,
    treeShaking: true,
    legalComments: "none"
};

await esbuild.build({
    ...entryOptions,
    ...targetOptions,
    ...bundleOptions,
    ...(!isDevelopment && productionOptions)
});
