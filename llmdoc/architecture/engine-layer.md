# Engine Layer Architecture

## 1. Identity

- **What it is:** Formula evaluation engine with dependency tracking and circular reference detection.
- **Purpose:** Compute formula values, track cell dependencies, and maintain evaluated data.

## 2. Core Components

- `src/engine/engine.ts` (Model, updateCellValue, createReferenceGraph, createEvaluatedData): Core Model class wrapping spreadsheet data with formula evaluation.
- `src/engine/formula.ts` (createFormulaParser, isFormulaValue, extractFormula, getReferences, evaluate): Formula parsing and evaluation utilities using fast-formula-parser.
- `src/engine/point-graph.ts` (PointGraph): Graph data structure tracking cell dependencies (references).
- `src/engine/point-set.ts` (PointSet): Set data structure for Point collections.
- `src/engine/point-hash.ts` (pointHash): Hash function for Point objects.
- `src/engine/index.ts`: Public API exports for engine layer.

## 3. Execution Flow (LLM Retrieval Map)

- **1. Model Creation:** `Model` constructor in `src/engine/engine.ts:15-28` creates reference graph via `createReferenceGraph()`.
- **2. Dependency Tracking:** `createReferenceGraph()` in `src/engine/engine.ts:137-152` extracts references from formula cells using `Formula.getReferences()`.
- **3. Formula Evaluation:** `createEvaluatedData()` in `src/engine/engine.ts:154-197` evaluates formulas in topological order using BFS traversal.
- **4. Cell Updates:** `updateCellValue()` in `src/engine/engine.ts:30-55` updates data, rebuilds reference graph if needed, and re-evaluates dependent cells.
- **5. Circular Dependency Detection:** `evaluateCell()` in `src/engine/engine.ts:72-130` checks `referenceGraph.hasCircularDependency()` and marks cells with `FormulaError.REF`.

## 4. Design Rationale

Two data representations (`data` for raw input, `evaluatedData` for computed formulas) allow efficient re-evaluation without re-parsing all formulas. BFS traversal ensures dependencies are computed before dependents.
