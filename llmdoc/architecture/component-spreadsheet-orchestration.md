# Spreadsheet Component Orchestration

## 1. Identity

- **What it is:** The main `Spreadsheet` component that manages all state, context, and event handling.
- **Purpose:** Orchestrate the entire spreadsheet application by initializing state, providing context, and coordinating sub-components.

## 2. Core Components

- `src/components/Spreadsheet.tsx` (Spreadsheet, Props): Main component with reducer initialization, event handlers, and component composition. Lines 44-131 define Props with all overridable components.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Initialization:** Component initializes reducer with `INITIAL_STATE` from `src/state/reducer.ts:17-30` and creates Model with formula parser at lines 176-185.
- **2. Context Provision:** State and dispatch provided via `context.Provider` at line 640 using use-context-selector.
- **3. Event Handlers Setup:** Keyboard, mouse, clipboard, and blur handlers created with `useCallback` at lines 408-452.
- **4. State Sync:** Internal state synced to parent props via `useEffect` hooks at lines 242-354.
- **5. Component Enhancement:** Overridable components enhanced via HOC pattern at lines 454-474.
- **6. Table Selection:** Conditionally renders `Table` or `VirtualizedTable` based on `virtualization` prop at lines 489-594.
- **7. Imperative API:** Methods exposed via ref at lines 224-238.

## 4. Design Rationale

The Spreadsheet component follows a "smart component" pattern - all state management and business logic is centralized here. Sub-components are pure presentational components that receive all necessary data via props injected by enhance() HOCs. This separation makes components easily overridable while maintaining consistent behavior.
