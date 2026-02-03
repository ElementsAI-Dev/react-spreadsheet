import {} from "jest";
import { Model } from "./engine";
import { PointGraph } from "./engine/point-graph";

function areModelsEqual(a: unknown, b: unknown): boolean | undefined {
  const isAModule = a instanceof Model;
  const isBModule = b instanceof Model;

  if (isAModule && isBModule) {
    // @ts-expect-error
    return this.equals(a, b);
  } else if (isAModule !== isBModule) {
    return false;
  } else {
    return undefined;
  }
}

function arePointGraphsEqual(
  this: { equals: (a: unknown, b: unknown) => boolean },
  a: unknown,
  b: unknown,
): boolean | undefined {
  const isAGraph = a instanceof PointGraph;
  const isBGraph = b instanceof PointGraph;

  if (isAGraph && isBGraph) {
    // Compare by functional behavior, ignoring internal cache state
    // Check that both graphs have the same nodes and edges
    const aEntries = Array.from(a);
    const bEntries = Array.from(b);
    if (aEntries.length !== bEntries.length) {
      return false;
    }
    // Compare each entry using the provided equals function
    for (const [point, edges] of aEntries) {
      const bEdges = b.get(point);
      if (!this.equals(edges, bEdges)) {
        return false;
      }
    }
    return true;
  } else if (isAGraph !== isBGraph) {
    return false;
  } else {
    return undefined;
  }
}

// @ts-expect-error
expect.addEqualityTesters([areModelsEqual, arePointGraphsEqual]);
