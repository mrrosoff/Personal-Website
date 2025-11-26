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

await buildLambdaFunction("api/endpoints/inventory.ts", "dist/lambda/inventory");
await buildLambdaFunction("api/endpoints/checkout.ts", "dist/lambda/checkout");
await buildLambdaFunction("api/endpoints/checkoutStatus.ts", "dist/lambda/checkoutStatus");
await buildLambdaFunction("api/endpoints/checkoutSuccess.ts", "dist/lambda/checkoutSuccess");
await buildLambdaFunction("api/endpoints/receive.ts", "dist/lambda/receive");
await buildLambdaFunction("api/endpoints/register.ts", "dist/lambda/register");
await buildLambdaFunction("api/endpoints/sendEmail.ts", "dist/lambda/sendEmail");
await buildLambdaFunction("api/endpoints/unsubscribe.ts", "dist/lambda/unsubscribe");
