import { Point } from "../core/point";
import * as pointHash from "./point-hash";
import { PointSet } from "./point-set";

/** Empty PointSet singleton for reuse */
const EMPTY_POINT_SET = PointSet.from([]);

/**
 * Immutable directed graph of points, where each point can have multiple
 * edges to other points.
 */
export class PointGraph {
  /** Cache for backwards lookups - lazily built */
  private _backwards: Map<string, PointSet>;
  /** Flag to track if backwards cache has been built */
  private _backwardsCacheBuilt: boolean;

  private constructor(private forwards = new Map<string, PointSet>()) {
    // Initialize cache properties as non-enumerable to avoid test comparison issues
    this._backwards = new Map();
    this._backwardsCacheBuilt = false;
    Object.defineProperty(this, "_backwards", { enumerable: false });
    Object.defineProperty(this, "_backwardsCacheBuilt", { enumerable: false });
  }

  /** Creates a new PointGraph instance from an array-like or iterable object */
  static from(pairs: Iterable<[Point, PointSet]>): PointGraph {
    const forwards = new Map<string, PointSet>();
    for (const [node, edges] of pairs) {
      forwards.set(pointHash.toString(node), edges);
    }
    return new PointGraph(forwards);
  }

  set(node: Point, edges: PointSet): PointGraph {
    const newGraph = new PointGraph(new Map(this.forwards));
    if (edges.size === 0) {
      newGraph.forwards.delete(pointHash.toString(node));
      return newGraph;
    }
    newGraph.forwards.set(pointHash.toString(node), edges);
    return newGraph;
  }

  get(node: Point): PointSet {
    return this.forwards.get(pointHash.toString(node)) || EMPTY_POINT_SET;
  }

  /** Build backwards index cache lazily */
  private buildBackwardsCache(): Map<string, PointSet> {
    if (this._backwardsCacheBuilt) {
      return this._backwards;
    }
    const backwards = new Map<string, Set<string>>();
    for (const [key, edges] of this.forwards) {
      for (const edge of edges) {
        const edgeHash = pointHash.toString(edge);
        let set = backwards.get(edgeHash);
        if (!set) {
          set = new Set<string>();
          backwards.set(edgeHash, set);
        }
        set.add(key);
      }
    }
    // Convert to PointSet and store in cache
    for (const [key, set] of backwards) {
      const points: Point[] = [];
      for (const hash of set) {
        points.push(pointHash.fromString(hash));
      }
      this._backwards.set(key, PointSet.from(points));
    }
    this._backwardsCacheBuilt = true;
    return this._backwards;
  }

  getBackwards(node: Point): PointSet {
    const backwards = this.buildBackwardsCache();
    return backwards.get(pointHash.toString(node)) || EMPTY_POINT_SET;
  }

  getBackwardsRecursive(
    node: Point,
    visited: PointSet = PointSet.from([]),
  ): PointSet {
    let result = this.getBackwards(node);
    let newVisited = visited;
    for (const point of result) {
      if (newVisited.has(point)) {
        continue;
      }
      newVisited = newVisited.add(point);
      result = result.union(this.getBackwardsRecursive(point, newVisited));
    }
    return result;
  }

  /** Determine whether the graph has a circular dependency, starting from given start point */
  hasCircularDependency(startPoint: Point): boolean {
    // Use native Set with string hashes for better performance
    const visited = new Set<string>();
    const stack: Point[] = [startPoint];

    while (stack.length > 0) {
      const current = stack.pop()!;
      const hash = pointHash.toString(current);

      if (visited.has(hash)) {
        return true;
      }

      visited.add(hash);

      const dependents = this.get(current);

      if (dependents.size === 0) {
        continue;
      }

      for (const dependent of dependents) {
        stack.push(dependent);
      }
    }

    return false;
  }

  *[Symbol.iterator](): Iterator<[Point, PointSet]> {
    const visitedHashes = new Set<string>();
    for (const [key, values] of this.forwards) {
      const point = pointHash.fromString(key);
      visitedHashes.add(key);
      yield [point, values];

      // Make sure to include values that are not included in the forwards map keys
      for (const value of values) {
        const hash = pointHash.toString(value);
        if (!visitedHashes.has(hash) && !this.forwards.has(hash)) {
          visitedHashes.add(hash);
          yield [value, PointSet.from([])];
        }
      }
    }
  }

  /** Get the points in the graph in a breadth-first order */
  *traverseBFSBackwards(): Generator<Point> {
    // Use native Set with string hashes for better performance
    const visited = new Set<string>();

    // Create a queue to store the points that still need to be visited
    // Use index-based iteration to avoid O(n) shift() operations
    const queue: Point[] = [];

    // Iterate over all the points and add the ones with no dependencies to the queue
    for (const [point, values] of this) {
      if (values.size === 0) {
        visited.add(pointHash.toString(point));
        queue.push(point);
      }
    }

    // Use index instead of shift() for O(1) dequeue
    let queueIndex = 0;
    while (queueIndex < queue.length) {
      const point = queue[queueIndex++];
      yield point;

      // Get the set of points that depend on the current point
      const dependents = this.getBackwards(point);

      // If there are no dependents, skip to the next iteration
      if (dependents.size === 0) {
        continue;
      }

      // Otherwise, add the dependents to the queue if they have not yet been visited
      for (const dependent of dependents) {
        const dependentHash = pointHash.toString(dependent);
        if (!visited.has(dependentHash)) {
          // Check if all dependencies of dependent are visited
          const deps = this.get(dependent);
          let allDepsVisited = true;
          for (const dep of deps) {
            if (!visited.has(pointHash.toString(dep))) {
              allDepsVisited = false;
              break;
            }
          }
          if (allDepsVisited) {
            queue.push(dependent);
            visited.add(dependentHash);
          }
        }
      }
    }
  }
}
