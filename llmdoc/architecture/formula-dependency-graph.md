# Formula Dependency Graph Architecture

## 1. Identity

- **What it is:** Immutable directed graph tracking cell-to-cell dependencies for formula evaluation.
- **Purpose:** Enable topological sorting, circular dependency detection, and incremental re-evaluation.

## 2. Core Components

- `src/engine/point-graph.ts` (PointGraph, hasCircularDependency, traverseBFSBackwards, getBackwardsRecursive): Immutable directed graph with lazy backwards lookup cache.
- `src/engine/point-set.ts` (PointSet): Immutable set of Points using string hashing for storage.
- `src/engine/point-hash.ts` (toString, fromString): Converts Points to/from "row,column" string format.
- `src/engine/engine.ts` (createReferenceGraph, updateReferenceGraph): Builds and updates dependency graph from formula cells.

## 3. Execution Flow (LLM Retrieval Map)

### Graph Creation

- **1. Initial build:** `createReferenceGraph()` in `src/engine/engine.ts:137-152` iterates over all cells in data matrix.
- **2. Formula filtering:** Checks `Formula.isFormulaValue()` for each cell (`src/engine/engine.ts:142`).
- **3. Reference extraction:** Calls `Formula.getReferences()` to extract dependencies (`src/engine/engine.ts:143-146`).
- **4. Graph construction:** Builds `PointGraph` via `PointGraph.from()` with [Point, PointSet] pairs (`src/engine/engine.ts:151`).

### Graph Updates

- **1. Cell change detection:** `updateReferenceGraph()` in `src/engine/engine.ts:57-70` checks if new value is formula.
- **2. Re-extraction:** Calls `Formula.getReferences()` to get new dependencies (`src/engine/engine.ts:63-66`).
- **3. Immutable update:** Returns new graph via `PointGraph.set()` (`src/engine/engine.ts:68`).

### Traversal for Evaluation

- **1. BFS initialization:** `traverseBFSBackwards()` in `src/engine/point-graph.ts:147-198` starts with leaf nodes (no dependencies).
- **2. Queue processing:** Uses index-based iteration for O(1) dequeue (`src/engine/point-graph.ts:165-168`).
- **3. Dependency validation:** Checks `allDepsVisited` before enqueuing dependents (`src/engine/point-graph.ts:184-190`).
- **4. Yield order:** Yields points in topological order (dependencies before dependents).

### Circular Dependency Detection

- **1. DFS traversal:** `hasCircularDependency()` in `src/engine/point-graph.ts:100-127` uses stack-based depth-first search.
- **2. Cycle detection:** Tracks visited nodes via string hash Set (`src/engine/point-graph.ts:102, 109-111`).
- **3. Error marking:** `evaluateCell()` marks cell and recursive referrers with `FormulaError.REF` (`src/engine/engine.ts:80-102`).

## 4. Design Rationale

Immutable graph design enables efficient change detection and prevents accidental mutations. Lazy backwards lookup cache (`_backwardsCacheBuilt` flag) avoids unnecessary computation. String-based hashing ("row,column") provides efficient key storage for Map/Set operations. BFS traversal ensures formulas are evaluated after all their dependencies are computed.
