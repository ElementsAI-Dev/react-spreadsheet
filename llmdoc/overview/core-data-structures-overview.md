# Core Data Structures Overview

## 1. Identity

- **What it is:** Immutable 2D grid data structures and coordinate systems for spreadsheet operations.
- **Purpose:** Provide type-safe, performant operations on cell data, selections, and coordinate ranges.

## 2. High-Level Description

The core data structures form the foundation of spreadsheet data management. Four main types work together: **Matrix** stores 2D cell data with immutable operations, **Point** represents cell coordinates, **PointRange** defines rectangular cell ranges, and **Selection** provides polymorphic selection modes (empty, range, entire rows/columns/worksheet). All structures follow immutable patterns for safe state updates and efficient change detection in React components.
