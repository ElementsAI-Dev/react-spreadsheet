---
id: virtualization
title: Virtualization
---

# Virtualization

For large spreadsheets with many rows and columns, rendering all cells at once can cause performance issues. React Spreadsheet supports **virtualization** using [react-window](https://github.com/bvaughn/react-window) to only render visible cells, significantly improving performance.

## Enabling Virtualization

To enable virtualization, pass a `virtualization` configuration object to the Spreadsheet component:

```javascript
import Spreadsheet from "react-spreadsheet";

const App = () => {
  const data = [
    // ... large dataset
  ];

  return (
    <Spreadsheet
      data={data}
      virtualization={{
        enabled: true,
        height: 400,
        width: 800,
      }}
    />
  );
};
```

## Configuration Options

The `virtualization` prop accepts an object with the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable virtualization |
| `height` | `number` | *required* | Height of the virtualized container in pixels |
| `width` | `number` | *required* | Width of the virtualized container in pixels |
| `rowHeight` | `number` | `28` | Height of each row in pixels |
| `columnWidth` | `number \| ((index: number) => number)` | `100` | Width of each column in pixels, or function returning width for each column index |
| `rowIndicatorWidth` | `number` | `50` | Width of row indicator column in pixels |
| `overscanRowCount` | `number` | `2` | Number of rows to render outside visible area |
| `overscanColumnCount` | `number` | `2` | Number of columns to render outside visible area |

## Full Example

```javascript
import { useState } from "react";
import Spreadsheet from "react-spreadsheet";

// Generate large dataset
const generateData = (rows, cols) => {
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => ({
      value: `R${rowIndex + 1}C${colIndex + 1}`,
    }))
  );
};

const App = () => {
  const [data, setData] = useState(generateData(1000, 50));

  return (
    <Spreadsheet
      data={data}
      onChange={setData}
      virtualization={{
        enabled: true,
        height: 500,
        width: 1000,
        rowHeight: 32,
        columnWidth: 120,
        overscanRowCount: 5,
        overscanColumnCount: 3,
      }}
    />
  );
};
```

## Dynamic Column Widths

You can provide a function for `columnWidth` to set different widths for each column:

```javascript
<Spreadsheet
  data={data}
  virtualization={{
    enabled: true,
    height: 500,
    width: 1000,
    columnWidth: (index) => {
      // First column wider
      if (index === 0) return 200;
      // Other columns
      return 100;
    },
  }}
/>
```

## Using with Container Size

To make the virtualized spreadsheet fill its container, you can use the `useVirtualization` hook:

```javascript
import { useRef } from "react";
import Spreadsheet, { useVirtualization } from "react-spreadsheet";

const App = () => {
  const containerRef = useRef(null);
  const { width, height } = useVirtualization(containerRef, 400, 600);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh" }}>
      <Spreadsheet
        data={data}
        virtualization={{
          enabled: true,
          height,
          width,
        }}
      />
    </div>
  );
};
```

## Performance Tips

- **Overscan**: Increase `overscanRowCount` and `overscanColumnCount` for smoother scrolling, but at the cost of rendering more cells
- **Row Height**: Use consistent row heights for best performance
- **Column Width**: Using a fixed number for `columnWidth` is more performant than a function
- **Data Size**: Virtualization is most beneficial for spreadsheets with hundreds or thousands of rows/columns

## When to Use Virtualization

- ✅ Large datasets (100+ rows or 20+ columns)
- ✅ Performance-critical applications
- ✅ Fixed-size container for the spreadsheet

- ❌ Small datasets (virtualization adds overhead)
- ❌ When you need all cells rendered for printing or screenshots
