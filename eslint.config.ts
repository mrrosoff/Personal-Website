import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
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
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
            ],
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allow: [{ name: ["Error", "URL", "URLSearchParams"], from: "lib" }],
                    allowBoolean: true,
                    allowNullish: true,
                    allowNumber: true
                }
            ]
        }
    },
    {
        files: ["src/**/*.tsx"],
        ...reactHooks.configs.flat["recommended-latest"]
    },
    {
        files: ["tst/**"],
        ...vitest.configs.recommended,
        rules: {
            ...vitest.configs.recommended.rules,
            "@typescript-eslint/unbound-method": "off"
        }
    },
    {
        files: ["tst/setup.ts"],
        rules: { "@typescript-eslint/consistent-type-definitions": "off" }
    }
);
