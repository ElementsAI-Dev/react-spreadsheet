# Formula Engine Overview

## 1. Identity

- **What it is:** A formula evaluation system with automatic dependency tracking and circular reference detection.
- **Purpose:** Compute spreadsheet formulas, track cell dependencies, and maintain evaluated results efficiently.

## 2. High-Level Description

The formula engine processes cell values starting with "=" as formulas. It uses the `fast-formula-parser` library to parse and evaluate formulas, while maintaining a custom dependency graph (`PointGraph`) to track relationships between cells. The engine maintains two data representations: `data` (raw user input including formula strings) and `evaluatedData` (computed values where formulas are replaced with their results). This dual representation enables efficient incremental updates—only changed cells and their dependents require re-computation.

The dependency graph enables topological sorting via breadth-first traversal, ensuring formulas are evaluated in correct dependency order (dependencies before dependents). Circular dependencies are detected during graph traversal and result in `FormulaError.REF` errors.

Key operations:

- **Formula detection**: `isFormulaValue()` in `src/engine/formula.ts:16-22` checks for "=" prefix
- **Reference extraction**: `getReferences()` in `src/engine/formula.ts:69-108` parses dependencies
- **Evaluation**: `evaluate()` in `src/engine/formula.ts:110-125` computes formula results
- **Dependency tracking**: `PointGraph` in `src/engine/point-graph.ts:12-199` manages cell relationships
- **Circular detection**: `hasCircularDependency()` in `src/engine/point-graph.ts:100-127` identifies cycles
