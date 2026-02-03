# How to Enable and Configure Virtualization

## 1. When to Use Virtualization

Enable virtualization when rendering large spreadsheets (typically 100+ rows or columns). Virtualization uses windowed rendering to only display visible cells, significantly improving performance and reducing memory usage. The default Table component renders all cells, which is fine for small datasets but causes performance issues at scale.

## 2. Enable Virtualization

Pass `virtualization` prop with required dimensions:

```tsx
import Spreadsheet from 'react-spreadsheet';

<Spreadsheet
  data={largeData}
  virtualization={{
    enabled: true,
    height: 600,
    width: 800,
  }}
/>
```

See `src/types.ts:214-231` for VirtualizationConfig type definition.

## 3. Configure Row and Column Dimensions

Customize cell sizing for your data:

```tsx
<Spreadsheet
  data={data}
  virtualization={{
    enabled: true,
    height: 600,
    width: 800,
    rowHeight: 35,        // default: 28
    columnWidth: 120,     // default: 100
    rowIndicatorWidth: 60 // default: 50
  }}
/>
```

## 4. Use Dynamic Column Widths

Pass a function for variable column widths:

```tsx
<Spreadsheet
  data={data}
  virtualization={{
    enabled: true,
    height: 600,
    width: 800,
    columnWidth: (index) => {
      // Wider column for first column
      return index === 0 ? 200 : 100;
    },
  }}
/>
```

## 5. Configure Overscan

Increase overscan for smoother scrolling during fast scrolling:

```tsx
<Spreadsheet
  data={data}
  virtualization={{
    enabled: true,
    height: 600,
    width: 800,
    overscanRowCount: 5,    // default: 2
    overscanColumnCount: 3, // default: 2
  }}
/>
```

Overscan renders extra cells outside visible area to reduce blank spots during scroll.

## 6. Use Dynamic Container Sizing

Use the `useVirtualization` hook for responsive containers:

```tsx
import { useVirtualization } from 'react-spreadsheet';

function MySpreadsheet() {
  const containerRef = useRef(null);
  const { width, height } = useVirtualization(containerRef);

  return (
    <div ref={containerRef} style={{ height: '100vh', width: '100%' }}>
      <Spreadsheet
        data={data}
        virtualization={{ enabled: true, height, width }}
      />
    </div>
  );
}
```

The hook uses ResizeObserver to track container size changes. See `src/components/VirtualizedTable.tsx:350-380`.

## 7. Verify Virtualization

- Check that Spreadsheet has class `Spreadsheet--virtualized` (see `src/components/Spreadsheet.tsx:612`).
- Monitor rendering performance with React DevTools.
- Test scrolling behavior is smooth with your dataset size.
- Verify header stays sticky during vertical scroll.
- Ensure column indicators scroll horizontally with grid content.
