/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "vite";
import type { Plugin } from "vite";

import react from "@vitejs/plugin-react";

const mockJwks = resolve("tst/mocks/jwks");

const STATIC_FILES = [
    "/assets/*",
    "/fonts/*",
    "/images/*",
    "/styles/*",
    "/.well-known/*",
    "/favicon.ico",
    "/llms.txt",
    "/robots.txt",
    "/sitemap.xml"
];

function pagesRoutes(): Plugin {
    return {
        name: "pages-routes",
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "_routes.json",
                source: JSON.stringify({ version: 1, include: ["/*"], exclude: STATIC_FILES })
            });
        }
    };
}

function base64Assets(): Plugin {
    return {
        name: "base64-assets",
        enforce: "pre",
        load: (id) =>
            /\.(ttf|jpg|png)$/.test(id)
                ? `export default ${JSON.stringify(readFileSync(id).toString("base64"))};`
                : undefined
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), pagesRoutes()],
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (
                            id.includes("/@mui/") ||
                            id.includes("/@emotion/") ||
                            id.includes("/@popperjs/")
                        ) {
                            return "mui";
                        }
                    }
                }
            }
        }
    },
    server: {
        port: 3000,
        strictPort: true,
        open: true
    },
    test: {
        alias: [
            { find: /^(.*\/)?jwks\/(keys|keyMapping)\.json$/, replacement: `${mockJwks}/$2.json` },
            { find: /^\.\/(keys|keyMapping)\.json$/, replacement: `${mockJwks}/$1.json` }
        ],
        setupFiles: ["tst/setup.ts"],
        testTimeout: 15000,
        unstubEnvs: true,
        unstubGlobals: true,
        projects: [
            {
                extends: true,
                plugins: [base64Assets()],
                test: {
                    name: "api",
                    include: ["tst/api/**/*.test.{ts,tsx}", "tst/infrastructure/**/*.test.ts"],
                    environment: "node"
                }
            },
            {
                extends: true,
                test: {
                    name: "site",
                    include: ["tst/site/**/*.test.{ts,tsx}"],
                    environment: "jsdom"
                }
            }
        ],
        coverage: {
            enabled: true,
            provider: "v8",
            include: ["api/**/*.{ts,tsx}", "site/**/*.{ts,tsx}"],
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
        }
    }
});
