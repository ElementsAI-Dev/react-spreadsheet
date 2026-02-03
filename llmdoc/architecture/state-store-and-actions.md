# StoreState and Action Types Architecture

## 1. Identity

- **What it is:** Complete state shape definition and all 20 action types that drive state transitions.
- **Purpose:** Define the single source of truth for spreadsheet state and all valid state mutation operations.

## 2. Core Components

- `src/types.ts:48-64` (StoreState): Complete state type definition.
- `src/types.ts:206-209` (CommitChanges): Cell change tracking type for undo history.
- `src/state/actions.ts:11-32` (action type constants): String constants for all 20 action types.
- `src/state/actions.ts:34-301` (action types and creators): TypeScript types and creator functions.
- `src/state/reducer.ts:17-30` (INITIAL_STATE): Default state values.

## 3. StoreState Structure

```typescript
StoreState<Cell> {
  model: Model<Cell>;              // Engine with data and formula evaluation
  selected: Selection;             // Current selection (range, rows, columns, all)
  copied: PointRange | null;       // Copied range for paste operations
  hasPasted: boolean;              // Track if paste occurred
  cut: boolean;                    // Whether cut (vs copy) operation
  active: Point | null;            // Active/focused cell coordinates
  mode: Mode;                      // "view" | "edit"
  rowDimensions: Record<number, {height, top}>;  // Row dimension cache
  columnDimensions: Record<number, {width, left}>; // Column dimension cache
  dragging: boolean;               // Mouse drag state
  lastChanged: Point | null;       // Last cell modified
  lastCommit: CommitChanges | null;// Array of {prevCell, nextCell} changes
}
```

## 4. All Action Types

### Data Operations

- **SET_DATA**: Replaces entire model data, normalizes active/selected to new bounds (`src/state/reducer.ts:37-48`)
- **SET_CREATE_FORMULA_PARSER**: Updates formula parser while preserving data (`src/state/reducer.ts:49-55`)
- **SET_CELL_DATA**: Updates single cell value via Model, tracks lastChanged, guards read-only (`src/state/reducer.ts:126-136`)
- **SET_CELL_DIMENSIONS**: Updates row/column dimensions with shallow equality optimization (`src/state/reducer.ts:137-162`)

### Selection Operations

- **SELECT_ENTIRE_ROW**: Creates EntireRowsSelection, optionally extending from active (`src/state/reducer.ts:56-69`)
- **SELECT_ENTIRE_COLUMN**: Creates EntireColumnsSelection, optionally extending from active (`src/state/reducer.ts:70-83`)
- **SELECT_ENTIRE_WORKSHEET**: Selects all cells, sets active to origin (`src/state/reducer.ts:84-91`)
- **SET_SELECTION**: Sets custom Selection object, normalizes active to selection (`src/state/reducer.ts:92-105`)
- **SELECT**: Creates RangeSelection between point and active (`src/state/reducer.ts:106-116`)

### Activation

- **ACTIVATE**: Sets active point, creates single-cell RangeSelection, toggles edit mode if already active (`src/state/reducer.ts:117-125`)

### Clipboard Operations

- **COPY**: Stores selected range in copied, sets cut=false (`src/state/reducer.ts:163-172`)
- **CUT**: Stores selected range in copied, sets cut=true (`src/state/reducer.ts:163-172`)
- **PASTE**: Complex handler with clipboard parsing, batch operations, cut-paste source clearing (`src/state/reducer.ts:174-280`)

### Mode Operations

- **EDIT**: Switches to edit mode if active cell not read-only (`src/state/reducer.ts:352-357`)
- **VIEW**: Switches to view mode (`src/state/reducer.ts:405-407`)
- **CLEAR**: Clears all non-read-only cells in selection, tracks commit changes (`src/state/reducer.ts:359-399`)
- **BLUR**: Resets active and selected to null/empty (`src/state/reducer.ts:401-403`)

### Keyboard Operations

- **KEY_PRESS**: Enters edit mode on character press if in view mode (`src/state/reducer.ts:298-311`)
- **KEY_DOWN**: Routes to mode-aware keyboard handler based on modifiers (`src/state/reducer.ts:313-320`)

### Drag Operations

- **DRAG_START**: Sets dragging flag to true (`src/state/reducer.ts:322-324`)
- **DRAG_END**: Sets dragging flag to false (`src/state/reducer.ts:326-328`)

### Commit Tracking

- **COMMIT**: Stores commit changes for cell change tracking (`src/state/reducer.ts:330-333`)

## 5. Keyboard Handler Architecture

The reducer implements sophisticated keyboard routing (`src/state/reducer.ts:522-554`):

- **keyDownHandlers**: Arrow keys, Tab, Enter, Backspace, Delete, Escape (default mode)
- **editKeyDownHandlers**: Escape (view), Tab, Enter (edit mode)
- **shiftKeyDownHandlers**: Shift+arrows for selection expansion, Shift+Tab reverse navigation

## 6. Design Rationale

Actions are pure objects with `type` and `payload` properties. This enables predictable debugging, time-travel debugging, and testability. Helper functions (edit, clear, blur, view, commit) encapsulate common reducer logic to reduce duplication. Batch operations using `Matrix.setMultiple()` optimize performance for multi-cell updates.
