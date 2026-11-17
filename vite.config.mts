/// <reference types="vitest/config" />
import { resolve } from "node:path";

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

const mockJwks = resolve("tst/fixtures/jwks");

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
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
                test: {
                    name: "api",
                    include: ["tst/api/**/*.test.ts", "tst/infrastructure/**/*.test.ts"],
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
            include: ["api/**", "site/**"],
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
        }
    }
});
