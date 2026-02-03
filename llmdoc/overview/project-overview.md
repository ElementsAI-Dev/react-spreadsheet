# React Spreadsheet Project Overview

## 1. Identity

- **What it is:** A performant, customizable React spreadsheet component library with formula evaluation, cell selection, and virtualization support.
- **Purpose:** Provides developers with an Excel-like spreadsheet interface for React applications, supporting formula calculations, clipboard operations, and customizable rendering.

## 2. High-Level Description

react-spreadsheet is a TypeScript library that implements a full-featured spreadsheet grid component. It uses a Redux-style reducer pattern for state management, an immutable engine layer for formula evaluation and dependency tracking, and a component layer built with React hooks and context. The library supports optional virtualization via react-window for large datasets, provides keyboard navigation, clipboard operations (copy/cut/paste), and allows complete customization of all visual components through props.

## 3. Tech Stack

- **Framework:** React >=16.8.0 (hooks-based)
- **Language:** TypeScript 5.9.3
- **State Management:** Custom reducer pattern with React useReducer
- **Context Optimization:** use-context-selector for granular re-render control
- **Formula Parsing:** fast-formula-parser (1.0.19)
- **Virtualization:** react-window (2.2.6)
- **Build Tools:** Rollup, Jest, Storybook

## 4. Key Features

- **Formula Evaluation:** Excel-style formulas with automatic dependency tracking and circular dependency detection
- **Cell Selection:** Range selection, entire row/column selection, and select-all support
- **Clipboard Operations:** Copy, cut, and paste with TSV/CSV support
- **Virtualization:** Optional windowed rendering for large datasets via react-window
- **Component Customization:** All components (Cell, DataViewer, DataEditor, Table, Indicators) are overridable via props
- **Keyboard Navigation:** Arrow keys, Tab, Enter, Escape, Shift+arrows for selection expansion
- **Read-Only Cells:** Per-cell readOnly flag for preventing edits
- **Performance Optimization:** use-context-selector prevents unnecessary re-renders, batch matrix operations

## 5. Architecture Layers

- **Components:** React UI components with HOC enhancement pattern (`src/components/`)
- **State Management:** Reducer pattern with 20 action types and React context (`src/state/`)
- **Engine:** Formula evaluation, dependency graph, and Model class (`src/engine/`)
- **Core Data:** Immutable Matrix, Point, PointRange, Selection classes (`src/core/`)
