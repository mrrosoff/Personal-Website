import esbuild, { type BuildOptions } from "esbuild";

const isDevelopment = process.env.NODE_ENV === "development";

async function buildLambdaFunction(entrypoint: string, directory: string, watch = false) {
    const targetOptions: BuildOptions = { platform: "node", target: "node22" };
    const bundleOptions: BuildOptions = { bundle: true, sourcemap: true };
    const productionOptions: BuildOptions = { minify: true, treeShaking: true };
    const options: BuildOptions = {
        entryPoints: [entrypoint],
        outdir: directory,
        ...targetOptions,
        ...bundleOptions,
        ...(!isDevelopment && productionOptions)
    };
    const build = watch ? esbuild.context : esbuild.build;
    return await build(options);
}

await buildLambdaFunction("lambda/apis/inventory.ts", "dist/lambda/inventory");
await buildLambdaFunction("lambda/apis/checkoutStatus.ts", "dist/lambda/checkoutStatus");
await buildLambdaFunction("lambda/apis/checkout.ts", "dist/lambda/checkout");
await buildLambdaFunction("lambda/apis/receive.ts", "dist/lambda/receive");
await buildLambdaFunction("lambda/apis/register.ts", "dist/lambda/register");
await buildLambdaFunction("lambda/apis/sendEmail.ts", "dist/lambda/sendEmail");
await buildLambdaFunction("lambda/apis/unsubscribe.ts", "dist/lambda/unsubscribe");
