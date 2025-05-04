import esbuild from "esbuild";
import { copyFile } from "fs/promises";

const isProduction = process.env.NODE_ENV === "production";

async function buildLambdaFunction(entrypoint, directory, watch = false) {
    const target = { bundle: true, platform: "node", sourcemap: true, target: "node22" };
    const productionOptions = { minify: true, treeShaking: true };
    const options = {
        entryPoints: [entrypoint],
        outdir: directory,
        ...target,
        ...(isProduction && productionOptions)
    };
    const build = watch ? esbuild.context : esbuild.build;
    return await build(options);
}

await buildLambdaFunction("lambda/register.ts", "dist/lambda");
await buildLambdaFunction("lambda/sendEmail.ts", "dist/lambda");
await buildLambdaFunction("lambda/unsubscribe.ts", "dist/lambda");
