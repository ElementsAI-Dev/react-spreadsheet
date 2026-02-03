# Formula Evaluation Flow Architecture

## 1. Identity

- **What it is:** End-to-end formula processing pipeline from input to computed result.
- **Purpose:** Parse formulas, resolve cell references, compute results, and propagate updates.

## 2. Core Components

- `src/engine/formula.ts` (isFormulaValue, extractFormula, getReferences, createFormulaParser, evaluate): Formula parsing, dependency extraction, and evaluation using fast-formula-parser.
- `src/engine/engine.ts` (Model, createEvaluatedData, evaluateCell, updateCellValue): Model class and evaluation orchestration.
- `src/core/matrix.ts` (get, slice, setMultiple): Cell value retrieval and batch updates.

## 3. Execution Flow (LLM Retrieval Map)

### Initial Data Processing (Model Creation)

- **1. Data ingestion:** `Model` constructor receives data Matrix (`src/engine/engine.ts:15-27`).
- **2. Reference graph creation:** Calls `createReferenceGraph()` to build dependency graph (`src/engine/engine.ts:23`).
- **3. Batch evaluation:** `createEvaluatedData()` processes all formula cells in BFS order (`src/engine/engine.ts:24-26`).
- **4. Parser creation:** `createFormulaParser()` builds FormulaParser with cell/range callbacks (`src/engine/engine.ts:177`).

### Formula Cell Evaluation

- **1. BFS traversal:** `traverseBFSBackwards()` yields formula cells in dependency order (`src/engine/engine.ts:161`).
- **2. Sequential processing:** Iterates over formula cells with mutable intermediate state (`src/engine/engine.ts:180-194`).
- **3. Parser recreation:** Recreates parser after each evaluation for chained dependencies (`src/engine/engine.ts:193`).
- **4. Value computation:** `getFormulaComputedValue()` calls `Formula.evaluate()` with current parser (`src/engine/engine.ts:181-185`).

### Single Cell Update (Incremental)

- **1. Data update:** `updateCellValue()` sets new cell value in data matrix (`src/engine/engine.ts:35`).
- **2. Graph update:** Updates reference graph if formula changed (`src/engine/engine.ts:36-38`).
- **3. Circular check:** `evaluateCell()` checks `hasCircularDependency()` first (`src/engine/engine.ts:80`).
- **4. Cell evaluation:** Evaluates updated cell using `getFormulaComputedValue()` (`src/engine/engine.ts:108-112`).
- **5. Dependent propagation:** Iterates `getBackwardsRecursive()` to re-evaluate affected cells (`src/engine/engine.ts:115-127`).
- **6. Batch application:** Applies all updates via `Matrix.setMultiple()` (`src/engine/engine.ts:129`).

### Cell Reference Resolution

- **1. onCell callback:** `createFormulaParser()` converts 0-based Point to 1-based CellRef (`src/engine/formula.ts:36-39`).
- **2. Value lookup:** Calls `Matrix.get()` to retrieve cell value from evaluatedData (`src/engine/formula.ts:40`).
- **3. Number coercion:** Returns `Number(value)` if numeric (`src/engine/formula.ts:41`).
- **4. Range handling:** onRange callback uses `Matrix.slice()` for range references (`src/engine/formula.ts:44-59`).

## 4. Design Rationale

Two data representations (`data` vs `evaluatedData`) separate user input from computed results, enabling efficient re-evaluation without re-parsing. Parser recreation after each evaluation ensures subsequent formulas can reference newly computed values. Batch updates via `Matrix.setMultiple()` minimize matrix copies. Coordinate conversion (0-based to 1-based) maintains compatibility with fast-formula-parser.
