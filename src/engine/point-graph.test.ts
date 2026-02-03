import { Point } from "../core/point";
import { PointSet } from "./point-set";
import { PointGraph } from "./point-graph";

const EMPTY = PointGraph.from([]);

describe("PointGraph.prototype.from", () => {
  test("empty", () => {
    const graph = PointGraph.from([]);
    // Test functional behavior instead of internal structure
    expect(graph.get({ row: 0, column: 0 }).size).toBe(0);
    expect(Array.from(graph)).toEqual([]);
  });
  test("single edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    // Test functional behavior
    expect(graph.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([{ row: 0, column: 1 }]),
    );
  });
  test("two edges", () => {
    const graph = PointGraph.from([
      [
        { row: 0, column: 0 },
        PointSet.from([
          { row: 0, column: 1 },
          { row: 0, column: 2 },
        ]),
      ],
    ]);
    // Test functional behavior
    expect(graph.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );
  });
});

describe("PointGraph.prototype.set", () => {
  test("add single edge to empty", () => {
    const pair: [Point, PointSet] = [
      { row: 0, column: 0 },
      PointSet.from([{ row: 0, column: 1 }]),
    ];
    const graph = EMPTY.set(pair[0], pair[1]);
    // Test functional behavior
    expect(graph.get({ row: 0, column: 0 })).toEqual(pair[1]);
  });
  test("add two edges to empty", () => {
    const graph = EMPTY.set(
      { row: 0, column: 0 },
      PointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );
    expect(graph.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );
  });
  test("remove single edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    const updatedGraph = graph.set({ row: 0, column: 0 }, PointSet.from([]));
    expect(updatedGraph.get({ row: 0, column: 0 }).size).toBe(0);
  });
  test("remove and add single edges", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    const updated = graph.set(
      { row: 0, column: 0 },
      PointSet.from([{ row: 0, column: 2 }]),
    );
    expect(updated.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([{ row: 0, column: 2 }]),
    );
  });
  test("add and remove multiple edges", () => {
    const graph1 = EMPTY.set(
      { row: 0, column: 0 },
      PointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );

    expect(graph1.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );

    const graph2 = graph1.set(
      { row: 0, column: 1 },
      PointSet.from([{ row: 0, column: 2 }]),
    );

    expect(graph2.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([
        { row: 0, column: 1 },
        { row: 0, column: 2 },
      ]),
    );
    expect(graph2.get({ row: 0, column: 1 })).toEqual(
      PointSet.from([{ row: 0, column: 2 }]),
    );

    const graph3 = graph2.set({ row: 0, column: 0 }, PointSet.from([]));
    expect(graph3.get({ row: 0, column: 0 }).size).toBe(0);
    expect(graph3.get({ row: 0, column: 1 })).toEqual(
      PointSet.from([{ row: 0, column: 2 }]),
    );
  });
  test("add existing edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    const updated = graph.set(
      { row: 0, column: 0 },
      PointSet.from([{ row: 0, column: 1 }]),
    );
    expect(updated.get({ row: 0, column: 0 })).toEqual(
      PointSet.from([{ row: 0, column: 1 }]),
    );
  });
});

describe("PointGraph.prototype.getBackwards", () => {
  test("backwards get single edge", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.getBackwards({ row: 0, column: 1 })).toEqual(
      PointSet.from([{ row: 0, column: 0 }]),
    );
  });
  test("get backwards from non-existent point", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.getBackwards({ row: 0, column: 2 })).toEqual(
      PointSet.from([]),
    );
  });
  test("get backwards from point with no incoming edges", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
    ]);
    expect(graph.getBackwards({ row: 0, column: 0 })).toEqual(
      PointSet.from([]),
    );
  });
  test("get backwards from point with multiple incoming edges", () => {
    const graph = PointGraph.from([
      [
        { row: 0, column: 0 },
        PointSet.from([
          { row: 0, column: 1 },
          { row: 1, column: 0 },
        ]),
      ],
      [
        { row: 1, column: 0 },
        PointSet.from([
          { row: 0, column: 1 },
          { row: 0, column: 2 },
        ]),
      ],
    ]);
    expect(graph.getBackwards({ row: 0, column: 1 })).toEqual(
      PointSet.from([
        { row: 0, column: 0 },
        { row: 1, column: 0 },
      ]),
    );
  });
});

describe("PointGraph.prototype.traverseBFSBackwards", () => {
  test("empty graph", () => {
    const graph = PointGraph.from([]);
    expect(Array.from(graph.traverseBFSBackwards())).toEqual([]);
  });
  test("single point, no values", () => {
    const graph = PointGraph.from([[{ row: 0, column: 0 }, PointSet.from([])]]);
    expect(Array.from(graph.traverseBFSBackwards())).toEqual([
      { row: 0, column: 0 },
    ]);
  });
  test("two point, no values", () => {
    const graph = PointGraph.from([
      [{ row: 0, column: 0 }, PointSet.from([])],
      [{ row: 1, column: 1 }, PointSet.from([])],
    ]);
    expect(Array.from(graph.traverseBFSBackwards())).toEqual([
      { row: 0, column: 0 },
      { row: 1, column: 1 },
    ]);
  });
  test("complex graph", () => {
    const graph = PointGraph.from([
      [
        { row: 0, column: 0 },
        PointSet.from([
          { row: 1, column: 0 },
          { row: 2, column: 0 },
        ]),
      ],
      [{ row: 1, column: 0 }, PointSet.from([{ row: 2, column: 0 }])],
      [{ row: 3, column: 0 }, PointSet.from([{ row: 4, column: 0 }])],
      [{ row: 4, column: 0 }, PointSet.from([{ row: 5, column: 0 }])],
    ]);
    expect(Array.from(graph.traverseBFSBackwards())).toEqual([
      { row: 2, column: 0 },
      { row: 5, column: 0 },
      { row: 1, column: 0 },
      { row: 4, column: 0 },
      { row: 0, column: 0 },
      { row: 3, column: 0 },
    ]);
  });
});

test("no circular dependency", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 1 }, PointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 2 }, PointSet.from([{ row: 0, column: 1 }])],
    [{ row: 0, column: 3 }, PointSet.from([{ row: 0, column: 2 }])],
    [{ row: 0, column: 4 }, PointSet.from([{ row: 0, column: 3 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 1 })).toBe(false);
});

test("simple circular dependency", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 1 }, PointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 1 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 0 })).toBe(true);
});

test("multiple circular dependencies", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 1 }, PointSet.from([{ row: 0, column: 0 }])],
    [{ row: 0, column: 2 }, PointSet.from([{ row: 0, column: 1 }])],
    [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 2 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 0 })).toBe(true);
});

test("self-referential circular dependency", () => {
  const graph = PointGraph.from([
    [{ row: 0, column: 0 }, PointSet.from([{ row: 0, column: 0 }])],
  ]);
  expect(graph.hasCircularDependency({ row: 0, column: 0 })).toBe(true);
});
