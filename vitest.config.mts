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
        include: ["tst/**/*.test.ts"],
        environment: "node",
        setupFiles: ["tst/setup.ts"]
    }
});
