import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import importSortPlugin from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
	{
		ignores: ["node_modules/*", "build/*", "dist/*", "public/*"],
	},
	prettierConfig,
	{
		files: ["**/*.ts"],
		languageOptions: {
			globals: globals.node,
			parser: typescriptParser,
			sourceType: "module",
			ecmaVersion: 5,
			parserOptions: {
				project: ["./tsconfig.json"],
			},
		},
		plugins: {
			"@typescript-eslint": typescriptPlugin,
			prettier: prettierPlugin,
			"simple-import-sort": importSortPlugin,
		},
		rules: {
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"no-console": "off",
			"@typescript-eslint/member-ordering": [
				"error",
				{
					default: [
						"signature",
						"public-static-field",
						"protected-static-field",
						"private-static-field",
						"public-decorated-field",
						"protected-decorated-field",
						"private-decorated-field",
						"public-instance-field",
						"protected-instance-field",
						"private-instance-field",
						"public-abstract-field",
						"protected-abstract-field",
						"public-constructor",
						"protected-constructor",
						"private-constructor",
						"public-abstract-method",
						"protected-abstract-method",
						"public-static-method",
						"protected-static-method",
						"private-static-method",
						"public-decorated-method",
						"protected-decorated-method",
						"private-decorated-method",
						"public-instance-method",
						"protected-instance-method",
						"private-instance-method",
					],
				},
			],
			"@typescript-eslint/no-confusing-non-null-assertion": ["error"],
			"@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
			"@typescript-eslint/no-explicit-any": ["error"],
			"@typescript-eslint/no-extra-non-null-assertion": ["error"],
			"@typescript-eslint/no-floating-promises": ["error"],
			"@typescript-eslint/no-non-null-asserted-optional-chain": ["error"],
			"@typescript-eslint/no-non-null-assertion": ["error"],
			"@typescript-eslint/no-require-imports": ["error"],
			"@typescript-eslint/no-unnecessary-boolean-literal-compare": ["error"],
			"@typescript-eslint/no-unnecessary-condition": ["error"],
			"@typescript-eslint/no-useless-constructor": ["error"],
			"@typescript-eslint/prefer-for-of": ["error"],
			"@typescript-eslint/prefer-nullish-coalescing": ["error"],
			"@typescript-eslint/prefer-readonly": ["error"],
			"@typescript-eslint/promise-function-async": ["error", { checkArrowFunctions: false }],
			"@typescript-eslint/switch-exhaustiveness-check": ["error"],
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/explicit-module-boundary-types": ["error"],
			"@typescript-eslint/strict-boolean-expressions": ["error"],
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: {
						arguments: false,
						attributes: false,
					},
				},
			],
			"prettier/prettier": ["error"],
		},
	},
];
