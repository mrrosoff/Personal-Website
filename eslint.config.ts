import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["dist", "cdk.out", "coverage", "node_modules", "scripts/passkeyRegistrationUI"] },
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    prettier,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            "@typescript-eslint/consistent-type-definitions": ["error", "type"],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ]
        }
    },
    {
        files: ["site/**/*.tsx"],
        ...reactHooks.configs.flat["recommended-latest"]
    },
    {
        files: ["tst/**"],
        extends: [vitest.configs.recommended],
        rules: {
            "vitest/no-mocks-import": "off"
        }
    }
);
