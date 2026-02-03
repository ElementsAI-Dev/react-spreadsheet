# Selection and Coordinate Architecture

## 1. Identity

- **What it is:** Polymorphic selection system with coordinate primitives for spreadsheet navigation.
- **Purpose:** Type-safe cell addressing, range operations, and flexible selection modes.

## 2. Core Components

- `src/core/point.ts` (Point, isEqual, ORIGIN): {row, column} coordinate type with equality check.
- `src/core/point-range.ts` (PointRange): Normalized rectangular range with iteration, containment, masking.
- `src/core/selection.ts` (Selection, EmptySelection, RangeSelection, EntireRowsSelection, EntireColumnsSelection, EntireWorksheetSelection): Abstract selection hierarchy.
- `src/engine/point-set.ts` (PointSet): Immutable set of points for dependency tracking.
- `src/engine/point-hash.ts` (toString, fromString): Fast point serialization.

## 3. Execution Flow (LLM Retrieval Map)

### Point Operations

- **Creation:** `Point` is a plain `{row, column}` object at `src/core/point.ts:2-7`.
- **Equality:** `Point.isEqual(a, b)` at `src/core/point.ts:10-12` compares coordinates.
- **Hashing:** `pointHash.toString(point)` at `src/engine/point-hash.ts:7-9` creates "row,column" string.

### Range Operations

- **Construction:** `new PointRange(source, target)` at `src/core/point-range.ts:14-23` normalizes to start (top-left) and end (bottom-right).
- **Iteration:** `for (const point of range)` at `src/core/point-range.ts:26-36` yields all points in range.
- **Containment:** `range.has(point)` at `src/core/point-range.ts:46-53` checks if point is within bounds.
- **Size:** `range.size()` at `src/core/point-range.ts:39-43` returns total cell count.
- **Masking:** `range.mask(mask)` at `src/core/point-range.ts:56-71` constrains range to overlap area.

### Selection Polymorphism

- **Conversion:** `selection.toRange(data)` at `src/core/selection.ts:8` converts any selection to PointRange (or null).
- **Normalization:** `selection.normalizeTo(data)` at `src/core/selection.ts:11` clips selection to data bounds.
- **Containment:** `selection.has(data, point)` at `src/core/selection.ts:23` checks if point is selected.
- **Sizing:** `selection.size(data)` at `src/core/selection.ts:20` returns selected cell count.

### Selection Types

- **EmptySelection:** Returns `null` for `toRange()`, size 0, never contains points.
- **RangeSelection:** Wraps `PointRange`, delegates `has()`/`size()` to range.
- **EntireRowsSelection:** `hasEntireRow(row)` at `src/core/selection.ts:198-200` checks row membership.
- **EntireColumnsSelection:** `hasEntireColumn(column)` at `src/core/selection.ts:247-249` checks column membership.
- **EntireWorksheetSelection:** Returns true for any point/row/column.

### PointSet Operations

- **Creation:** `PointSet.from(points)` at `src/engine/point-set.ts:11-17` builds set from iterable.
- **Membership:** `set.has(point)` at `src/engine/point-set.ts:30-32` checks presence.
- **Set Operations:** `union()`, `difference()` at `src/engine/point-set.ts:62-96` for dependency tracking.

## 4. Design Rationale

Selection uses abstract class pattern for polymorphism across selection types. `PointRange` normalizes coordinates so `start` is always top-left and `end` is bottom-right, simplifying bounds checking. PointSet uses string hashing for O(1) lookups in dependency graphs.
