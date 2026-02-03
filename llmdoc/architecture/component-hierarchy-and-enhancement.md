# Component Hierarchy and Enhancement Pattern

## 1. Identity

- **What it is:** The tree structure of spreadsheet components and the HOC pattern that injects state.
- **Purpose:** Enable component customization through consistent dependency injection via enhance() HOCs.

## 2. Core Components

- `src/components/Cell.tsx` (Cell, enhance): Base cell component with enhance() HOC at lines 96-171 injecting state via useShallowSelector.
- `src/components/ActiveCell.tsx` (ActiveCell): Active cell overlay using useShallowSelector at lines 34-44 for optimized state access.
- `src/components/DataViewer.tsx` (DataViewer): Default viewer with boolean handling at lines 10-29.
- `src/components/DataEditor.tsx` (DataEditor): Default editor with auto-focus input at lines 6-35.
- `src/components/RowIndicator.tsx` (RowIndicator, enhance): Row indicator with enhance() at lines 36-57.
- `src/components/ColumnIndicator.tsx` (ColumnIndicator, enhance): Column indicator with enhance() at lines 35-66.
- `src/components/CornerIndicator.tsx` (CornerIndicator, enhance): Corner indicator with enhance() at lines 29-49.
- `src/components/Selected.tsx` (Selected): Selected overlay using FloatingRect.
- `src/components/Copied.tsx` (Copied): Copied overlay using FloatingRect.
- `src/components/FloatingRect.tsx` (FloatingRect): Shared positioned div component.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Component Enhancement:** Spreadsheet.tsx calls enhance() on each overridable component at lines 454-474.
- **2. HOC Wrapper:** enhance() returns wrapper that uses `useSelector` or `useShallowSelector` to subscribe to state.
- **3. Dispatch Setup:** Wrapper creates dispatch callbacks (select, activate, setCellData, setCellDimensions) via `useDispatch`.
- **4. Render:** Wrapper passes state and callbacks as props to wrapped component.
- **5. Per-Cell Components:** Cell.tsx supports per-cell DataViewer/DataEditor via CellBase type at lines 70-73.

## 4. Component Hierarchy

```
Spreadsheet (context.Provider)
├── Table OR VirtualizedTable
│   ├── HeaderRow
│   │   ├── CornerIndicator
│   │   └── ColumnIndicator[]
│   └── Row[]
│       └── RowIndicator?
│       └── Cell[] (enhanced with state)
│           └── DataViewer
├── ActiveCell (absolute positioned overlay)
│   └── DataEditor (when mode === "edit")
├── Selected (floating rect overlay)
└── Copied (floating rect overlay)
```

## 5. Design Rationale

The enhance() HOC pattern allows custom components to receive the same props as default components without inheritance or prop drilling. HOCs inject state via context selectors and callbacks via action dispatchers. Components specify custom DataViewer/DataEditor per-cell using CellBase.DataViewer and CellBase.DataEditor properties.
