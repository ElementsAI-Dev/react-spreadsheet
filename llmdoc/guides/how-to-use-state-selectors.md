# How to Use State Selectors

## 1. Identity

- **What it is:** Guide for selecting state and dispatching actions in components.
- **Purpose:** Enable efficient state consumption patterns that minimize component re-renders.

## 2. Choose the Right Selector Hook

Use **useSelector** when selecting a single primitive value or when reference stability doesn't matter:

```typescript
// Simple boolean selection
const isSelected = useSelector((state) =>
  state.selected.has(state.model.data, point)
);
```

Use **useShallowSelector** when selecting multiple properties as an object:

```typescript
// Combined selector with shallow comparison
const cellState = useShallowSelector((state) => ({
  active: isActive(state.active, point),
  mode: active ? state.mode : "view",
  data: Matrix.get(point, state.model.data),
  selected: state.selected.has(state.model.data, point),
  dragging: state.dragging,
}));
```

## 3. Dispatch Actions

1. **Get dispatch function** via `useDispatch()` hook (`src/state/use-dispatch.ts:4-6`):

```typescript
import useDispatch from "./state/use-dispatch";
import * as Actions from "./state/actions";

const dispatch = useDispatch();
```

1. **Create memoized action dispatchers** for props:

```typescript
const setCellData = React.useCallback(
  (data: CellBase) => dispatch(Actions.setCellData(point, data)),
  [dispatch, point]
);
```

1. **Dispatch directly** in event handlers:

```typescript
const handleClick = () => {
  dispatch(Actions.activate({ row: 0, column: 0 }));
};
```

## 4. Spreadsheet Root Action Binding Pattern

The Spreadsheet component uses a `useAction` higher-order function to create memoized callbacks (`src/components/Spreadsheet.tsx:202-222`):

```typescript
const useAction = <T extends (...args: any[]) => Actions.Action>(
  action: T
) => {
  return React.useCallback(
    (...args: Parameters<T>) => dispatch(action(...args)),
    [action]
  );
};

const cut = useAction(Actions.cut);
const copy = useAction(Actions.copy);
const paste = useAction(Actions.paste);
```

## 5. Performance Optimization Patterns

**Single selector vs multiple selectors**: Use a single `useShallowSelector` call instead of multiple `useSelector` calls to reduce hook overhead.

**Memoize selector functions**: Wrap selector functions with `useCallback` if they depend on props.

**Avoid inline objects**: Selectors should return stable object shapes for shallow comparison to work correctly.

## 6. Common Patterns

See implementation examples:

- **Cell component HOC**: `src/components/Cell.tsx:96-171` - Full state consumption pattern
- **Indicator components**: `src/components/RowIndicator.tsx:41` - Simple boolean selector
- **Spreadsheet root**: `src/components/Spreadsheet.tsx:211-222` - Action binding pattern
