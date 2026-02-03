# Testing Guide

## How to Test React Spreadsheet

1. **Run All Tests:** Execute `yarn test` or `npm test` to run the full Jest test suite. Test configuration is in `package.json:103-114` with ts-jest preset and CSS transform.

2. **Run Specific Test:** Use `yarn test -t "testName"` to run a single test by name. This is useful for quick iteration during development.

3. **Test Coverage:** Run `yarn test:coverage` to generate coverage reports. Tests are co-located with source files (e.g., `src/engine/engine.test.ts` tests `src/engine/engine.ts`).

4. **Test Setup:** Test environment configured in `src/jest-setup.ts` with `@testing-library/jest-dom` matchers.

5. **Component Testing:** Component tests use `@testing-library/react` and are located alongside components (e.g., `src/components/Cell.test.tsx`).

6. **Unit Testing:** Core data structures and engine have comprehensive unit tests (e.g., `src/core/matrix.test.ts`, `src/engine/engine.test.ts`).

**Verification:** All tests should pass with no failures or warnings.
