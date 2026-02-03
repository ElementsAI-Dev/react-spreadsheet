# Matrix Operations Architecture

## 1. Identity

- **What it is:** Immutable 2D array implementation for sparse cell storage.
- **Purpose:** Provide efficient, type-safe operations on spreadsheet grid data.

## 2. Core Components

- `src/core/matrix.ts` (Matrix, createEmpty, get, set, setMultiple, mutableSet, slice, map, entries, join, split, has, getSize, pad, padRows, toArray, maxPoint): Complete 2D array operations for cell storage and manipulation.
- `src/engine/point-hash.ts` (toString, fromString): Fast point serialization for Map/Set keys.
- `src/engine/point-set.ts` (PointSet): Immutable set collection for point-based operations.

## 3. Execution Flow (LLM Retrieval Map)

### Reading Operations

- **Single Cell Access:** `Matrix.get(point, matrix)` at `src/core/matrix.ts:21-27` returns value or undefined.
- **Range Extraction:** `Matrix.slice(startPoint, endPoint, matrix)` at `src/core/matrix.ts:30-48` creates sub-matrix.
- **Iteration:** `Matrix.entries(matrix)` at `src/core/matrix.ts:213-222` yields `[point, value]` pairs.

### Writing Operations

- **Single Cell Update:** `Matrix.set(point, value, matrix)` at `src/core/matrix.ts:51-71` returns new matrix with one cell changed.
- **Batch Updates:** `Matrix.setMultiple(entries, matrix)` at `src/core/matrix.ts:99-171` efficiently updates multiple cells in one pass.
- **Mutation:** `Matrix.mutableSet(point, value, matrix)` at `src/core/matrix.ts:74-92` for direct mutation (use sparingly).
- **Clear Cell:** `Matrix.unset(point, matrix)` at `src/core/matrix.ts:174-186` removes cell value.

### Utility Operations

- **Size Queries:** `Matrix.getSize(matrix)`, `getRowsCount()`, `getColumnsCount()` at `src/core/matrix.ts:300-317`.
- **Boundary:** `Matrix.maxPoint(matrix)` at `src/core/matrix.ts:406-409` returns bottom-right coordinate.
- **Transformation:** `Matrix.map(func, matrix)` at `src/core/matrix.ts:189-210` applies function to all cells.
- **Padding:** `Matrix.pad(matrix, size)` at `src/core/matrix.ts:344-373` expands matrix dimensions.

### Import/Export

- **CSV Export:** `Matrix.join(matrix)` at `src/core/matrix.ts:228-249` converts matrix to CSV string.
- **CSV Import:** `Matrix.split(csv, transform)` at `src/core/matrix.ts:255-274` parses CSV to matrix.

## 4. Design Rationale

Matrix uses sparse array representation where first row defines column count. `setMultiple` is optimized for batch updates by collecting changes and copying only affected rows. Immutable operations enable React memoization and simple equality checks via reference comparison.
