import * as React from "react";
import { Grid } from "react-window";
import * as Types from "../types";

/** Scroll props from react-window Grid */
type ScrollProps = {
  scrollLeft: number;
  scrollTop: number;
  scrollUpdateWasRequested: boolean;
};

/** Default cell dimensions */
const DEFAULT_ROW_HEIGHT = 28;
const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_INDICATOR_WIDTH = 50;

/** Props for the virtualized table */
export type VirtualizedTableProps = {
  /** Number of rows in the spreadsheet */
  rows: number;
  /** Number of columns in the spreadsheet */
  columns: number;
  /** Height of the visible area */
  height: number;
  /** Width of the visible area */
  width: number;
  /** Height of each row (default: 28) */
  rowHeight?: number;
  /** Width of each column (default: 100) */
  columnWidth?: number | ((index: number) => number);
  /** Width of row indicator column (default: 50) */
  rowIndicatorWidth?: number;
  /** Whether to hide row indicators */
  hideRowIndicators?: boolean;
  /** Whether to hide column indicators */
  hideColumnIndicators?: boolean;
  /** Row labels */
  rowLabels?: string[];
  /** Column labels */
  columnLabels?: string[];
  /** Cell component */
  Cell: Types.CellComponent;
  /** Row indicator component */
  RowIndicator: React.FC<
    Omit<Types.RowIndicatorProps, "selected" | "onSelect">
  >;
  /** Column indicator component */
  ColumnIndicator: React.FC<
    Omit<Types.ColumnIndicatorProps, "selected" | "onSelect">
  >;
  /** Corner indicator component */
  CornerIndicator: React.FC;
  /** Data viewer component */
  DataViewer: Types.DataViewerComponent;
  /** Overscan count - number of rows/columns to render outside visible area */
  overscanRowCount?: number;
  /** Overscan count for columns */
  overscanColumnCount?: number;
};

/** Internal context for cell renderer */
type VirtualizedTableContextType = VirtualizedTableProps & {
  scrollLeft: number;
  scrollTop: number;
};

const VirtualizedTableContext =
  React.createContext<VirtualizedTableContextType | null>(null);

/** Get column width accounting for row indicator */
function getColumnWidthInternal(
  index: number,
  hideRowIndicators: boolean,
  rowIndicatorWidth: number,
  columnWidth: number | ((index: number) => number),
): number {
  if (!hideRowIndicators && index === 0) {
    return rowIndicatorWidth;
  }
  const actualIndex = hideRowIndicators ? index : index - 1;
  if (typeof columnWidth === "function") {
    return columnWidth(actualIndex);
  }
  return columnWidth;
}

/** Cell renderer component */
const CellRenderer: React.FC<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}> = React.memo(({ columnIndex, rowIndex, style }) => {
  const context = React.useContext(VirtualizedTableContext);
  if (!context) return null;

  const { Cell, DataViewer, hideRowIndicators, RowIndicator, rowLabels } =
    context;

  // Row indicator column
  if (!hideRowIndicators && columnIndex === 0) {
    return (
      <div style={style} className="Spreadsheet__cell Spreadsheet__header">
        <RowIndicator
          row={rowIndex}
          label={
            rowLabels && rowIndex in rowLabels ? rowLabels[rowIndex] : undefined
          }
        />
      </div>
    );
  }

  // Adjust column index for actual data column
  const actualColumnIndex = hideRowIndicators ? columnIndex : columnIndex - 1;

  return (
    <div style={style} className="Spreadsheet__cell-wrapper">
      {/* @ts-ignore - Cell component receives additional props via enhance() */}
      <Cell row={rowIndex} column={actualColumnIndex} DataViewer={DataViewer} />
    </div>
  );
});

CellRenderer.displayName = "CellRenderer";

/** Header row with column indicators */
const VirtualizedHeader: React.FC<{
  context: VirtualizedTableContextType;
  totalWidth: number;
}> = React.memo(({ context, totalWidth }) => {
  const {
    columns,
    columnWidth = DEFAULT_COLUMN_WIDTH,
    rowIndicatorWidth = DEFAULT_ROW_INDICATOR_WIDTH,
    hideRowIndicators,
    hideColumnIndicators,
    columnLabels,
    ColumnIndicator,
    CornerIndicator,
    scrollLeft,
  } = context;

  if (hideColumnIndicators) return null;

  const indicatorWidth = hideRowIndicators ? 0 : rowIndicatorWidth;

  // Calculate visible columns based on scroll position
  const colWidthValue =
    typeof columnWidth === "number" ? columnWidth : DEFAULT_COLUMN_WIDTH;

  return (
    <div
      className="Spreadsheet__header-row Spreadsheet__virtualized-header"
      style={{
        display: "flex",
        position: "sticky",
        top: 0,
        zIndex: 3,
        width: totalWidth,
        backgroundColor: "var(--Spreadsheet-background, #fff)",
      }}
    >
      {/* Corner indicator */}
      {!hideRowIndicators && (
        <div
          style={{
            width: indicatorWidth,
            minWidth: indicatorWidth,
            flexShrink: 0,
            position: "sticky",
            left: 0,
            zIndex: 4,
            backgroundColor: "var(--Spreadsheet-background, #fff)",
          }}
          className="Spreadsheet__header"
        >
          <CornerIndicator />
        </div>
      )}

      {/* Column indicators container */}
      <div
        style={{
          display: "flex",
          transform: `translateX(-${scrollLeft}px)`,
          willChange: "transform",
        }}
      >
        {Array.from({ length: columns }, (_, columnIndex) => {
          const width =
            typeof columnWidth === "function"
              ? columnWidth(columnIndex)
              : colWidthValue;

          return (
            <div
              key={columnIndex}
              style={{
                width,
                minWidth: width,
                flexShrink: 0,
              }}
              className="Spreadsheet__header"
            >
              <ColumnIndicator
                column={columnIndex}
                label={
                  columnLabels && columnIndex in columnLabels
                    ? columnLabels[columnIndex]
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedHeader.displayName = "VirtualizedHeader";

/** Virtualized spreadsheet table component */
const VirtualizedTable: React.FC<VirtualizedTableProps> = (props) => {
  const {
    rows,
    columns,
    height,
    width,
    rowHeight = DEFAULT_ROW_HEIGHT,
    columnWidth = DEFAULT_COLUMN_WIDTH,
    rowIndicatorWidth = DEFAULT_ROW_INDICATOR_WIDTH,
    hideRowIndicators = false,
    hideColumnIndicators = false,
    overscanRowCount = 2,
    overscanColumnCount = 2,
  } = props;

  const [scrollState, setScrollState] = React.useState({
    scrollLeft: 0,
    scrollTop: 0,
  });
  const gridRef = React.useRef<typeof Grid>(null);

  // Handle scroll events
  const handleScroll = React.useCallback(
    ({ scrollLeft, scrollTop }: ScrollProps) => {
      setScrollState({ scrollLeft, scrollTop });
    },
    [],
  );

  // Calculate dimensions
  const headerHeight = hideColumnIndicators ? 0 : rowHeight;
  const gridHeight = height - headerHeight;
  const totalColumns = hideRowIndicators ? columns : columns + 1;

  // Column width getter
  const getColumnWidth = React.useCallback(
    (index: number) =>
      getColumnWidthInternal(
        index,
        hideRowIndicators,
        rowIndicatorWidth,
        columnWidth,
      ),
    [hideRowIndicators, rowIndicatorWidth, columnWidth],
  );

  // Calculate total width for header
  const totalWidth = React.useMemo(() => {
    let total = 0;
    for (let i = 0; i < totalColumns; i++) {
      total += getColumnWidth(i);
    }
    return total;
  }, [totalColumns, getColumnWidth]);

  // Context value
  const contextValue = React.useMemo(
    (): VirtualizedTableContextType => ({
      ...props,
      scrollLeft: scrollState.scrollLeft,
      scrollTop: scrollState.scrollTop,
    }),
    [props, scrollState],
  );

  // Cell renderer wrapper for react-window
  const cellRenderer = React.useCallback(
    ({
      columnIndex,
      rowIndex,
      style,
    }: {
      columnIndex: number;
      rowIndex: number;
      style: React.CSSProperties;
    }) => (
      <CellRenderer
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        style={style}
      />
    ),
    [],
  );

  return (
    <VirtualizedTableContext.Provider value={contextValue}>
      <div
        className="Spreadsheet__virtualized-table"
        style={{
          width,
          height,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header row */}
        <VirtualizedHeader context={contextValue} totalWidth={totalWidth} />

        {/* Virtualized grid */}
        <Grid
          ref={gridRef}
          className="Spreadsheet__grid"
          columnCount={totalColumns}
          columnWidth={getColumnWidth}
          height={gridHeight}
          rowCount={rows}
          rowHeight={() => rowHeight}
          width={width}
          // @ts-ignore - react-window v2 typing issue
          onScroll={handleScroll}
          overscanRowCount={overscanRowCount}
          overscanColumnCount={overscanColumnCount}
          style={{ outline: "none", overflowX: "auto", overflowY: "auto" }}
        >
          {/* @ts-ignore - react-window typing issue */}
          {cellRenderer}
        </Grid>
      </div>
    </VirtualizedTableContext.Provider>
  );
};

export default VirtualizedTable;

/** Hook to use virtualization in spreadsheet */
export function useVirtualization(
  containerRef: React.RefObject<HTMLElement>,
  defaultHeight = 400,
  defaultWidth = 600,
): { width: number; height: number } {
  const [dimensions, setDimensions] = React.useState({
    width: defaultWidth,
    height: defaultHeight,
  });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      const { width, height } = container.getBoundingClientRect();
      setDimensions({ width, height });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return dimensions;
}
