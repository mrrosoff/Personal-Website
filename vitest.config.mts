import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

const mockJwks = resolve("tst/__mocks__/__data__/jwks");

export default defineConfig({
    resolve: {
        alias: [
            { find: /^(.*\/)?jwks\/(keys|keyMapping)\.json$/, replacement: `${mockJwks}/$2.json` },
            { find: /^\.\/(keys|keyMapping)\.json$/, replacement: `${mockJwks}/$1.json` }
        ]
    },
    test: {
        setupFiles: ["tst/setup.ts"],
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
                    name: "src",
                    include: ["tst/src/**/*.test.{ts,tsx}"],
                    environment: "jsdom"
                }
            }
        ],
        coverage: {
            enabled: true,
            provider: "v8",
            include: ["api/**", "src/**"],
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
        }
    }
});
