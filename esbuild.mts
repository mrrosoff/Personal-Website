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

await buildLambdaFunction(
    "api/endpoints/ice-cream/inventory.ts",
    "dist/lambda/ice-cream/inventory"
);
await buildLambdaFunction("api/endpoints/ice-cream/checkout.ts", "dist/lambda/ice-cream/checkout");
await buildLambdaFunction(
    "api/endpoints/ice-cream/checkoutStatus.ts",
    "dist/lambda/ice-cream/checkoutStatus"
);
await buildLambdaFunction(
    "api/endpoints/ice-cream/checkoutSuccess.ts",
    "dist/lambda/ice-cream/checkoutSuccess"
);

await buildLambdaFunction("api/endpoints/email/receive.ts", "dist/lambda/email/receive");
await buildLambdaFunction("api/endpoints/email/register.ts", "dist/lambda/email/register");
await buildLambdaFunction("api/endpoints/email/sendEmail.ts", "dist/lambda/email/sendEmail");
await buildLambdaFunction("api/endpoints/email/unsubscribe.ts", "dist/lambda/email/unsubscribe");

await buildLambdaFunction("api/jwks/jwks.ts", "dist/lambda/jwks");

await buildLambdaFunction(
    "api/endpoints/admin/passkeyAuthOptions.ts",
    "dist/lambda/admin/passkeyAuthOptions"
);
await buildLambdaFunction("api/endpoints/admin/passkeyAuth.ts", "dist/lambda/admin/passkeyAuth");
await buildLambdaFunction(
    "api/endpoints/admin/passkeyRegisterOptions.ts",
    "dist/lambda/admin/passkeyRegisterOptions"
);
await buildLambdaFunction(
    "api/endpoints/admin/passkeyRegister.ts",
    "dist/lambda/admin/passkeyRegister"
);
await buildLambdaFunction(
    "api/endpoints/admin/provisionFlavor.ts",
    "dist/lambda/admin/provisionFlavor"
);
await buildLambdaFunction(
    "api/endpoints/admin/updateInventory.ts",
    "dist/lambda/admin/updateInventory"
);
