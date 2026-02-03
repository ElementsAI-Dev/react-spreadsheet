# State Management Architecture

## 1. Identity

- **What it is:** Redux-style reducer pattern with React Context for centralized state management.
- **Purpose:** Manage spreadsheet state (data, selection, active cell, mode, dimensions, clipboard) with predictable transitions.

## 2. Core Components

- `src/state/reducer.ts` (reducer, INITIAL_STATE): Main reducer handling all state transitions with action-specific logic.
- `src/state/actions.ts` (Action, action creators): TypeScript action types and creator functions for state mutations.
- `src/state/context.ts` (context, ReducerState, Dispatch, Value): React context created with use-context-selector for optimized updates.
- `src/state/use-dispatch.ts` (useDispatch): Hook for dispatching actions.
- `src/state/use-selector.ts` (useSelector): Hook for selecting state slices with memoization.
- `src/state/use-shallow-selector.ts` (useShallowSelector): Hook for shallow equality-based state selection.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Initialization:** `Spreadsheet.tsx` creates reducer with `INITIAL_STATE` from `src/state/reducer.ts:17-30`.
- **2. Context Creation:** Context created in `src/state/context.ts:10` with initial state and dispatch.
- **3. State Updates:** User interactions dispatch actions from `src/state/actions.ts` to `reducer()` in `src/state/reducer.ts:32-338`.
- **4. Action Handling:** Reducer switches on `action.type` and returns new immutable state.
- **5. Component Updates:** Components using `useSelector` only re-render when their selected slice changes.

## 4. Design Rationale

The reducer pattern provides predictable state transitions with easy debugging. Using `use-context-selector` instead of React's built-in context prevents unnecessary re-renders when unrelated state changes occur.
