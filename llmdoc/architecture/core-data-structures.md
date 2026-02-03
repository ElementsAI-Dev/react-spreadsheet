# Core Data Structures Architecture

## 1. Identity

- **What it is:** Immutable data structures for spreadsheet data, coordinates, ranges, and selection.
- **Purpose:** Provide efficient, type-safe operations on 2D grid data.

## 2. Core Components

- `src/core/matrix.ts` (Matrix, createEmpty, get, set, setMultiple, slice, map, entries, join, split): 2D array type with immutable operations for cell storage.
- `src/core/point.ts` (Point, ORIGIN): {row, column} coordinate type for cell locations.
- `src/core/point-range.ts` (PointRange): Range between two points with iteration and containment checks.
- `src/core/selection.ts` (Selection, EmptySelection, RangeSelection, EntireRowsSelection, EntireColumnsSelection, EntireWorksheetSelection): Selection class hierarchy for different selection modes.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Data Storage:** Spreadsheet data stored as `Matrix<Cell>` in `StoreState.model.data`.
- **2. Cell Access:** Components use `Matrix.get(point, matrix)` from `src/core/matrix.ts:21-27` to retrieve cell values.
- **3. Batch Updates:** `Matrix.setMultiple(entries, matrix)` from `src/core/matrix.ts:99-171` performs efficient batch cell updates.
- **4. Range Operations:** `PointRange` provides `has()`, `size()`, and iteration for selection logic.
- **5. Selection Logic:** Selection classes in `src/core/selection.ts` implement `toRange()`, `has()`, `size()` for different selection types.

## 4. Design Rationale

Immutable matrix operations prevent accidental mutations and enable easy change detection. Selection hierarchy provides type-safe polymorphism for different selection modes.
