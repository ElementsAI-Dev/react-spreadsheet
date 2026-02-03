# VirtualizedTable Implementation

## 1. Identity

- **What it is:** Windowed rendering table component using react-window Grid for performance optimization.
- **Purpose:** Render only visible cells for large spreadsheets to maintain smooth scrolling and reduce memory usage.

## 2. Core Components

- `src/components/VirtualizedTable.tsx` (VirtualizedTable, useVirtualization): Main virtualized table using react-window Grid at line 324. CellRenderer at lines 88-122, VirtualizedHeader at lines 127-219, useVirtualization hook at lines 350-380.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Context Creation:** VirtualizedTableContext created at line 67 to pass props without prop drilling.
- **2. Column Width Calculation:** getColumnWidthInternal at lines 71-85 accounts for row indicator column.
- **3. Cell Rendering:** CellRenderer at lines 88-122 renders only visible cells using react-window.
- **4. Header Rendering:** VirtualizedHeader at lines 127-219 with sticky positioning and horizontal scroll tracking via transform.
- **5. Grid Integration:** react-window Grid component at line 324 with overscan for smoother scrolling.
- **6. Dynamic Sizing:** useVirtualization hook at lines 350-380 uses ResizeObserver for container dimensions.

## 4. Key Features

- **Sticky Header:** Header stays at top while scrolling via position: sticky.
- **Overscan:** Configurable overscanRowCount and overscanColumnCount (default: 2) renders cells outside visible area.
- **Row Indicator Column:** First column handled specially for row indicators.
- **Scroll Synchronization:** Header transforms horizontally based on grid scroll position.

## 5. Design Rationale

VirtualizedTable is completely optional - Spreadsheet.tsx conditionally renders it based on `virtualization.enabled` prop. Uses react-window's Grid component for 2D virtualization. Context-based prop passing avoids recreating CellRenderer on every render. Default dimensions: rowHeight=28, columnWidth=100, rowIndicatorWidth=50.
