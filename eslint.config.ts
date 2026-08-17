import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

const MAX_LINES_PER_FUNCTION = 80;
const MAX_LINES = 300;
const MAX_NESTED_CALLBACKS = 3;
const MAX_PARAMS = 5;
const MAX_DEPTH = 4;
const MAX_CLASSES_PER_FILE = 10;

export default defineConfig([
	{
		files: ['**/*.ts'],
		ignores: ['dist/**', 'build/**', 'node_modules/**'],
		extends: [js.configs.recommended, tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.node,
			},
		},
		rules: {
			'no-var': 'error',
			'prefer-const': 'error',
			'no-constructor-return': 'error',
			'no-duplicate-imports': 'error',
			'no-self-compare': 'error',
			'no-unmodified-loop-condition': 'error',
			'no-useless-assignment': 'error',
			'no-eval': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'default-case': 'error',
			eqeqeq: ['error', 'always'],
			'max-classes-per-file': ['error', MAX_CLASSES_PER_FILE],
			'max-depth': ['error', MAX_DEPTH],
			'max-lines': ['warn', MAX_LINES],
			'max-lines-per-function': [
				'error',
				{ max: MAX_LINES_PER_FUNCTION, skipComments: true },
			],
			'max-nested-callbacks': ['error', MAX_NESTED_CALLBACKS],
			'max-params': ['error', MAX_PARAMS],
			'require-await': 'warn',
		},
	},
	{
		files: ['**/*.test.ts', '**/tests/**/*.ts'],
		rules: {
			'max-lines': 'off',
			'max-lines-per-function': 'off',
			'max-nested-callbacks': 'off',
			'max-params': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		files: ['**/*Router.ts'],
		rules: {
			'max-lines': 'off',
			'max-lines-per-function': 'off',
		},
	},
]);
