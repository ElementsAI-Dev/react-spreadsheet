# Component Layer Architecture

## 1. Identity

- **What it is:** The React UI components that render the spreadsheet interface.
- **Purpose:** Provide a modular, customizable rendering system with all major components overridable via props.

## 2. Core Components

- `src/components/Spreadsheet.tsx` (Spreadsheet, Props): Main component managing state, orchestrating sub-components, handling keyboard/mouse events.
- `src/components/Cell.tsx` (Cell, enhance): Renders individual spreadsheet cells with selection/active/copied states.
- `src/components/ActiveCell.tsx` (ActiveCell): Renders the currently active/focused cell.
- `src/components/DataEditor.tsx` (DataEditor): Default cell editor component for edit mode.
- `src/components/DataViewer.tsx` (DataViewer): Default cell viewer component for view mode.
- `src/components/Table.tsx` (Table): Regular (non-virtualized) table rendering all rows.
- `src/components/VirtualizedTable.tsx` (VirtualizedTable, useVirtualization): Performance-optimized table using react-window Grid.
- `src/components/Row.tsx` (Row): Table row component.
- `src/components/HeaderRow.tsx` (HeaderRow): Header row with column indicators.
- `src/components/RowIndicator.tsx` (RowIndicator, enhance): Row number indicator component.
- `src/components/ColumnIndicator.tsx` (ColumnIndicator, enhance): Column letter indicator component.
- `src/components/CornerIndicator.tsx` (CornerIndicator, enhance): Corner select-all indicator.
- `src/components/Selected.tsx` (Selected): Visual overlay for selected cells.
- `src/components/Copied.tsx` (Copied): Visual overlay for copied cells.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Component Mount:** `Spreadsheet.tsx` initializes reducer with `INITIAL_STATE` from `src/state/reducer.ts:17-30`.
- **2. Context Provision:** State and dispatch provided via context from `src/state/context.ts:10`.
- **3. Table Rendering:** `Spreadsheet.tsx` conditionally renders `Table.tsx` or `VirtualizedTable.tsx` based on `virtualization` prop.
- **4. Cell Rendering:** Table renders `Row.tsx` components, which render `Cell.tsx` components for each column.
- **5. Event Handling:** User interactions trigger actions from `src/state/actions.ts`, dispatched to reducer in `src/state/reducer.ts:32-338`.

## 4. Design Rationale

All components are overridable via props to enable customization. The component uses `use-context-selector` (`src/state/context.ts:2`) so components only re-render when their specific context slice changes, not on every state update.
