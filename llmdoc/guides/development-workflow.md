# Development Workflow Guide

## How to Develop on React Spreadsheet

1. **Install Dependencies:** Run `yarn install` or `npm install` to install all dependencies including React, react-dom, scheduler (peer dependencies) and core dependencies (react-window, fast-formula-parser, use-context-selector, classnames).

2. **Start Development:** Run `yarn storybook` to start the Storybook dev server on port 6006. This allows you to develop and test components interactively.

3. **Run Tests:** Execute `yarn test` to run Jest tests. Use `yarn test -t "testName"` to run a specific test. Tests are co-located with source files (e.g., `engine.test.ts` alongside `engine.ts`).

4. **Type Checking:** Run `yarn check-typing` to verify TypeScript types are correct before committing.

5. **Lint and Format:** Run `yarn lint` for ESLint/Stylelint checks. Run `yarn format` to apply Prettier formatting automatically.

6. **Build:** Run `yarn build` to build CommonJS and ES module outputs to `dist/` using Rollup.

7. **Full CI:** Run `yarn ci` to execute the complete CI pipeline (format check, typing, lint, test coverage) before committing.

**Verification:** After completing changes, run `yarn ci` and ensure all checks pass.
