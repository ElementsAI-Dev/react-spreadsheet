/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render } from "@testing-library/react";
import * as Types from "../types";
import { VirtualizedTableProps } from "./VirtualizedTable";

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock components for testing
const MockCell: Types.CellComponent = ({ row, column }) => (
  <div data-testid={`cell-${row}-${column}`}>
    Cell {row},{column}
  </div>
);

const MockRowIndicator: React.FC<
  Omit<Types.RowIndicatorProps, "selected" | "onSelect">
> = ({ row, label }) => (
  <div data-testid={`row-indicator-${row}`}>{label ?? String(row + 1)}</div>
);

const MockColumnIndicator: React.FC<
  Omit<Types.ColumnIndicatorProps, "selected" | "onSelect">
> = ({ column, label }) => (
  <div data-testid={`column-indicator-${column}`}>
    {label ?? String(column)}
  </div>
);

const MockCornerIndicator: React.FC = () => (
  <div data-testid="corner-indicator">Corner</div>
);

const MockDataViewer: Types.DataViewerComponent = () => <span>View</span>;

const defaultProps: VirtualizedTableProps = {
  rows: 100,
  columns: 10,
  height: 400,
  width: 600,
  rowHeight: 28,
  columnWidth: 100,
  Cell: MockCell,
  RowIndicator: MockRowIndicator,
  ColumnIndicator: MockColumnIndicator,
  CornerIndicator: MockCornerIndicator,
  DataViewer: MockDataViewer,
};

describe("VirtualizedTable", () => {
  test("has correct default props structure", () => {
    expect(defaultProps.rows).toBe(100);
    expect(defaultProps.columns).toBe(10);
    expect(defaultProps.height).toBe(400);
    expect(defaultProps.width).toBe(600);
    expect(defaultProps.rowHeight).toBe(28);
    expect(defaultProps.columnWidth).toBe(100);
  });

  test("Cell mock component renders correctly", () => {
    const { container } = render(
      <MockCell
        row={0}
        column={0}
        selected={false}
        active={false}
        copied={false}
        dragging={false}
        mode="view"
        data={undefined}
        evaluatedData={undefined}
        select={() => {}}
        activate={() => {}}
        setCellDimensions={() => {}}
        setCellData={() => {}}
        DataViewer={MockDataViewer}
      />,
    );
    expect(container.querySelector('[data-testid="cell-0-0"]')).toBeTruthy();
  });

  test("RowIndicator mock component renders correctly", () => {
    const { container } = render(<MockRowIndicator row={0} />);
    expect(
      container.querySelector('[data-testid="row-indicator-0"]'),
    ).toBeTruthy();
  });

  test("RowIndicator renders with custom label", () => {
    const { container } = render(<MockRowIndicator row={0} label="Custom" />);
    expect(container.textContent).toContain("Custom");
  });

  test("ColumnIndicator mock component renders correctly", () => {
    const { container } = render(<MockColumnIndicator column={0} />);
    expect(
      container.querySelector('[data-testid="column-indicator-0"]'),
    ).toBeTruthy();
  });

  test("ColumnIndicator renders with custom label", () => {
    const { container } = render(
      <MockColumnIndicator column={0} label="Col A" />,
    );
    expect(container.textContent).toContain("Col A");
  });

  test("CornerIndicator mock component renders correctly", () => {
    const { container } = render(<MockCornerIndicator />);
    expect(
      container.querySelector('[data-testid="corner-indicator"]'),
    ).toBeTruthy();
  });

  test("props accept function-based column width", () => {
    const columnWidthFn = (index: number) => (index === 0 ? 150 : 100);
    const propsWithFn: VirtualizedTableProps = {
      ...defaultProps,
      columnWidth: columnWidthFn,
    };
    expect(typeof propsWithFn.columnWidth).toBe("function");
    expect((propsWithFn.columnWidth as (index: number) => number)(0)).toBe(150);
    expect((propsWithFn.columnWidth as (index: number) => number)(1)).toBe(100);
  });

  test("props accept custom labels", () => {
    const columnLabels = ["A", "B", "C"];
    const rowLabels = ["Row 1", "Row 2"];
    const propsWithLabels: VirtualizedTableProps = {
      ...defaultProps,
      columnLabels,
      rowLabels,
    };
    expect(propsWithLabels.columnLabels).toEqual(["A", "B", "C"]);
    expect(propsWithLabels.rowLabels).toEqual(["Row 1", "Row 2"]);
  });

  test("props accept overscan counts", () => {
    const propsWithOverscan: VirtualizedTableProps = {
      ...defaultProps,
      overscanRowCount: 5,
      overscanColumnCount: 3,
    };
    expect(propsWithOverscan.overscanRowCount).toBe(5);
    expect(propsWithOverscan.overscanColumnCount).toBe(3);
  });

  test("props accept hide indicators flags", () => {
    const propsHidden: VirtualizedTableProps = {
      ...defaultProps,
      hideRowIndicators: true,
      hideColumnIndicators: true,
    };
    expect(propsHidden.hideRowIndicators).toBe(true);
    expect(propsHidden.hideColumnIndicators).toBe(true);
  });
});

describe("useVirtualization hook", () => {
  test("exports useVirtualization function", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useVirtualization } = require("./VirtualizedTable");
    expect(typeof useVirtualization).toBe("function");
  });

  test("exports VirtualizedTable component", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const VirtualizedTable = require("./VirtualizedTable").default;
    expect(typeof VirtualizedTable).toBe("function");
  });
});

describe("VirtualizationConfig type", () => {
  test("can create valid virtualization config", () => {
    const config: Types.VirtualizationConfig = {
      enabled: true,
      height: 500,
      width: 800,
      rowHeight: 30,
      columnWidth: 120,
      rowIndicatorWidth: 60,
      overscanRowCount: 3,
      overscanColumnCount: 2,
    };
    expect(config.enabled).toBe(true);
    expect(config.height).toBe(500);
    expect(config.width).toBe(800);
  });

  test("minimal config only requires enabled, height, width", () => {
    const minimalConfig: Types.VirtualizationConfig = {
      enabled: true,
      height: 400,
      width: 600,
    };
    expect(minimalConfig.enabled).toBe(true);
    expect(minimalConfig.rowHeight).toBeUndefined();
  });
});
