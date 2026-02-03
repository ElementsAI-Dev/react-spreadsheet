# How to Use Selections

A concise guide for Selection type usage patterns in the react-spreadsheet codebase.

1. **Creating Selections:** Instantiate specific selection types based on user interaction:
   - `new EmptySelection()` for no selection
   - `new RangeSelection(pointRange)` for rectangular cell ranges
   - `new EntireRowsSelection(startRow, endRow)` for full row selections
   - `new EntireColumnsSelection(startCol, endCol)` for full column selections
   - `new EntireWorksheetSelection()` for selecting all cells

2. **Normalizing Selections:** Always call `selection.normalizeTo(data)` from `src/core/selection.ts:11` after creation to clip selections to valid data bounds. This prevents out-of-bounds errors when data is smaller than the selection.

3. **Checking Containment:** Use `selection.has(data, point)` from `src/core/selection.ts:23` to test if a point is selected. For UI indicators (row/column headers), use `hasEntireRow(row)` at `src/core/selection.ts:14` or `hasEntireColumn(column)` at `src/core/selection.ts:17`.

4. **Getting Selection Bounds:** Convert any selection to a `PointRange` with `selection.toRange(data)` from `src/core/selection.ts:8`. Returns `null` for `EmptySelection`. Use for range-based operations like copying or clearing.

5. **Iterating Selected Cells:** Combine `toRange()` with range iteration:

   ```typescript
   const range = selection.toRange(data);
   if (range) {
     for (const point of range) { /* ... */ }
   }
   ```

6. **Selection Size:** Use `selection.size(data)` from `src/core/selection.ts:20` to get the total number of selected cells. Useful for UI feedback and bulk operation validation.

7. **Equality Comparison:** Use `selection.equals(otherSelection)` from `src/core/selection.ts:26` to check if two selections are equivalent. Handles type checking and value comparison internally.
