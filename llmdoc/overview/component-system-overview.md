# Component System Overview

## 1. Identity

- **What it is:** A modular React component architecture with HOC-based dependency injection and component override system.
- **Purpose:** Provide a customizable spreadsheet interface where every visual component can be replaced while maintaining consistent state management.

## 2. High-Level Description

The component system uses an HOC (Higher-Order Component) enhancement pattern to inject state and callbacks into otherwise pure presentational components. The `Spreadsheet` component acts as the orchestrator, managing a Redux-style reducer and React context (via `use-context-selector`). All sub-components (`Cell`, `RowIndicator`, `ColumnIndicator`, `CornerIndicator`, `DataViewer`, `DataEditor`, `Table`, `Row`, `HeaderRow`) are overridable via props. Components subscribe to specific state slices using `useSelector` or `useShallowSelector`, ensuring minimal re-renders. Virtualization is optional via the `VirtualizedTable` component which uses `react-window` for windowed rendering of large datasets.
