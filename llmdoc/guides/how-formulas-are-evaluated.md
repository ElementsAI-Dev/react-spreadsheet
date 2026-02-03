# How Formulas are Evaluated

A guide to the complete formula lifecycle from user input to displayed result.

1. **Formula Detection:** When a cell value is processed, `isFormulaValue()` in `src/engine/formula.ts:16-22` checks if the value is a string starting with "=" and has length > 1.

2. **Formula Extraction:** If detected as a formula, `extractFormula()` in `src/engine/formula.ts:25-27` strips the leading "=" to get the parseable formula string.

3. **Dependency Extraction:** `getReferences()` in `src/engine/formula.ts:69-108` uses the DepParser from fast-formula-parser to identify all cell references (both single cells and ranges) in the formula. Returns a PointSet of all referenced cells.

4. **Parser Creation:** `createFormulaParser()` in `src/engine/formula.ts:29-61` builds a FormulaParser instance with custom `onCell` and `onRange` callbacks. These callbacks convert 0-based Point coordinates to 1-based CellRef format and resolve cell values from the data Matrix.

5. **Reference Graph Build:** During Model creation, `createReferenceGraph()` in `src/engine/engine.ts:137-152` iterates over all formula cells, extracts their references, and builds a PointGraph mapping each formula cell to its dependencies.

6. **Topological Sort:** `createEvaluatedData()` in `src/engine/engine.ts:154-197` calls `traverseBFSBackwards()` to get formula cells in dependency order (leaves first, where leaves are cells with no dependencies).

7. **Sequential Evaluation:** Formula cells are evaluated in BFS order. Each cell's formula is parsed and computed via `Formula.evaluate()` in `src/engine/formula.ts:110-125`, and the result replaces the formula string in the evaluatedData matrix. The parser is recreated after each evaluation to ensure chained dependencies work.

8. **Display:** The React component layer reads from `evaluatedData` to display computed values, while preserving raw formulas in `data` for editing.

## Verification

To verify formula evaluation works correctly:

- Run tests: `npm test` and expect all engine tests to pass
- Check that `evaluatedData` contains computed values (numbers, strings) instead of formula strings
- Verify circular dependencies produce `FormulaError.REF` values
- Confirm dependent cells update when their referenced cells change
