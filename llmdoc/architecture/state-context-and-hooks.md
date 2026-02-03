# State Context and Selectors Architecture

## 1. Identity

- **What it is:** React Context implementation using `use-context-selector` with three custom hooks for optimized state consumption.
- **Purpose:** Deliver state slices to components with minimal re-renders by using selector-based subscriptions.

## 2. Core Components

- `src/state/context.ts:1-12` (context): Context created with use-context-selector's createContext.
- `src/state/use-dispatch.ts:1-8` (useDispatch): Hook extracting only dispatch function.
- `src/state/use-selector.ts:1-9` (useSelector): Hook for arbitrary state selection with memoization.
- `src/state/use-shallow-selector.ts:1-66` (useShallowSelector): Hook with shallow comparison for object selectors.

## 3. Context Implementation

Context is created using `use-context-selector` package, not React's built-in createContext:

```typescript
// src/state/context.ts
const context = createContext<Value>([INITIAL_STATE, () => {}]);
```

The `Value` type is a `[ReducerState, Dispatch]` tuple containing state and dispatch function.

## 4. Hook Implementations

### useDispatch

Extracts only the dispatch function, preventing re-renders when state changes:

```typescript
useContextSelector(context, ([state, dispatch]) => dispatch)
```

### useSelector

Accepts any selector function, subscribes only to selected slice:

```typescript
useContextSelector(context, ([state]) => selector(state))
```

### useShallowSelector

Advanced optimization for object selectors:

- Custom `shallowEqual` function using `Object.is` for key-value comparison (`src/state/use-shallow-selector.ts:10-41`)
- `useRef` to cache previous result (`src/state/use-shallow-selector.ts:51`)
- Returns cached reference if shallowly equal to prevent unnecessary re-renders

## 5. Component Consumption Pattern

Components consume state through an HOC pattern. Example from `src/components/Cell.tsx:96-171`:

1. **Get dispatch**: `const dispatch = useDispatch()`
2. **Create memoized action dispatchers**:

   ```typescript
   const setCellData = React.useCallback(
     (data) => dispatch(Actions.setCellData(point, data)),
     [dispatch, point]
   );
   ```

3. **Select state** with shallow comparison:

   ```typescript
   const cellState = useShallowSelector((state) => ({
     active: isActive(state.active, point),
     mode: active ? state.mode : "view",
     data: Matrix.get(point, state.model.data),
     // ... more properties
   }));
   ```

## 6. Execution Flow

1. **Initialization**: `Spreadsheet.tsx:187-191` creates reducer with useReducer
2. **Context provision**: `Spreadsheet.tsx:640` provides `[state, dispatch]` tuple via context.Provider
3. **State consumption**: Components use hooks to subscribe to relevant slices
4. **Optimized updates**: Components re-render only when their selected slice changes

## 7. Design Rationale

`use-context-selector` solves the performance problem where React's built-in context causes all consumers to re-render when any part of context changes. By using selector functions, components subscribe only to their specific data dependencies. The shallow comparison pattern enables combining multiple state properties into a single object while avoiding re-renders when values haven't changed.
