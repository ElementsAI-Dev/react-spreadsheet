# How to Use Matrix Operations

A concise guide for common Matrix usage patterns in the react-spreadsheet codebase.

1. **Creating a Matrix:** Use `Matrix.createEmpty(rows, columns)` from `src/core/matrix.ts:12-18` to initialize an empty grid, or construct directly with nested arrays: `[[1, 2], [3, 4]]`.

2. **Reading Cell Values:** Access single cells with `Matrix.get(point, matrix)` from `src/core/matrix.ts:21-27`. Returns `undefined` for out-of-bounds coordinates. Use `Matrix.has(point, matrix)` at `src/core/matrix.ts:277-290` to validate bounds first.

3. **Updating Cells Efficiently:**
   - **Single Cell:** Use `Matrix.set(point, value, matrix)` from `src/core/matrix.ts:51-71` for immutable updates.
   - **Multiple Cells:** Prefer `Matrix.setMultiple(entries, matrix)` from `src/core/matrix.ts:99-171` over multiple `set()` calls—it copies the matrix structure only once.
   - **Mutation Only:** Use `Matrix.mutableSet(point, value, matrix)` at `src/core/matrix.ts:74-92` only when immutability is not required.

4. **Iterating Cells:** Use `Matrix.entries(matrix)` from `src/core/matrix.ts:213-222` for `[point, value]` iteration, or `Matrix.map(func, matrix)` at `src/core/matrix.ts:189-210` for transformed output.

5. **Range Operations:** Extract sub-matrices with `Matrix.slice(startPoint, endPoint, matrix)` from `src/core/matrix.ts:30-48`. Ensure points are within matrix bounds using `Matrix.has()` or `selection.normalizeTo()` from `src/core/selection.ts:11`.

6. **Working with Boundaries:** Get matrix size with `Matrix.getSize(matrix)` from `src/core/matrix.ts:301-306`. Use `Matrix.maxPoint(matrix)` at `src/core/matrix.ts:406-409` for bottom-right coordinate. Pad matrices with `Matrix.pad(matrix, size)` at `src/core/matrix.ts:344-373` to ensure minimum dimensions.

7. **Import/Export:** Convert to CSV with `Matrix.join(matrix)` at `src/core/matrix.ts:228-249`. Parse CSV with `Matrix.split(csv, transform)` at `src/core/matrix.ts:255-274`. Use `Matrix.toArray(matrix)` at `src/core/matrix.ts:390-403` to flatten to 1D array.
