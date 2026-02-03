# State Management Overview

## 1. Identity

- **What it is:** Redux-style reducer pattern with React Context for centralized spreadsheet state management.
- **Purpose:** Manage spreadsheet state (data, selection, active cell, mode, dimensions, clipboard) with predictable state transitions and optimized component re-renders.

## 2. High-Level Description

The state management system implements a unidirectional data flow architecture. User interactions dispatch actions to a central reducer, which produces immutable state updates. React Context with `use-context-selector` delivers state slices to components without unnecessary re-renders. This pattern is essential for spreadsheet performance, as thousands of cells must efficiently subscribe to only their relevant state changes. The system supports two interaction modes (view/edit), manages clipboard operations, tracks cell dimensions for virtualization, and records commit history for undo/change tracking.
