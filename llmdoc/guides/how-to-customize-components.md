# How to Customize Spreadsheet Components

## 1. Override Default Components

Spreadsheet accepts component overrides via props. Pass custom components to replace defaults:

```tsx
import Spreadsheet from 'react-spreadsheet';

const CustomCell = ({ row, column, DataViewer, selected, active, ...props }) => (
  <td className={`my-cell ${selected ? 'selected' : ''}`}>
    <DataViewer row={row} column={column} cell={props.data} />
  </td>
);

<Spreadsheet
  data={data}
  Cell={CustomCell}
  DataViewer={MyDataViewer}
  DataEditor={MyDataEditor}
/>
```

Overridable props: `ColumnIndicator`, `CornerIndicator`, `RowIndicator`, `Table`, `Row`, `HeaderRow`, `Cell`, `DataViewer`, `DataEditor`. Component types defined in `src/types.ts:72-204`.

## 2. Create Custom DataViewer

Your DataViewer receives cell data and evaluated cell value:

```tsx
import { DataViewerProps } from 'react-spreadsheet';

const MyDataViewer = ({ cell, evaluatedCell }) => {
  const value = evaluatedCell?.value ?? cell?.value;

  if (typeof value === 'number') {
    return <span className="number">{value.toFixed(2)}</span>;
  }

  return <span>{value}</span>;
};
```

Props: `row`, `column`, `cell`, `evaluatedCell`, `setCellData`. See `src/types.ts:113-122` and default implementation at `src/components/DataViewer.tsx:10-29`.

## 3. Create Custom DataEditor

Your DataEditor handles edit mode with onChange and exitEditMode callbacks:

```tsx
import { DataEditorProps } from 'react-spreadsheet';

const MyDataEditor = ({ cell, onChange, exitEditMode }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') exitEditMode();
    if (e.key === 'Escape') exitEditMode();
  };

  return (
    <input
      value={cell?.value ?? ''}
      onChange={(e) => onChange({ ...cell, value: e.target.value })}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  );
};
```

Props: `row`, `column`, `cell`, `onChange`, `exitEditMode`. See `src/types.ts:125-135` and default implementation at `src/components/DataEditor.tsx:6-35`.

## 4. Per-Cell Component Customization

Override components for individual cells via CellBase.DataViewer and CellBase.DataEditor:

```tsx
const data = [
  [{ value: 1 }, { value: 2, DataViewer: StarRatingViewer }],
  [{ value: 3, DataEditor: DropdownEditor }, { value: 4 }],
];
```

Cell.tsx checks for per-cell components at lines 70-73 before using Spreadsheet-level defaults.

## 5. Create Custom Indicator Components

Indicators follow the same pattern with enhance() HOCs injecting state:

```tsx
const MyRowIndicator = ({ row, label, selected, onSelect }) => (
  <th
    className={selected ? 'my-selected' : ''}
    onClick={(e) => onSelect(row, e.shiftKey)}
  >
    {label ?? row + 1}
  </th>
);

<Spreadsheet RowIndicator={MyRowIndicator} />
```

See `src/components/RowIndicator.tsx:36-57` for the enhance() pattern.

## 6. Verify Component Integration

- Test selection, activation, and edit mode work correctly.
- Verify custom components receive all expected props.
- Check performance with large datasets.
- Ensure custom components handle undefined cell values gracefully.
