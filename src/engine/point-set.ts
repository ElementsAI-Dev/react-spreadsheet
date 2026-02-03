import * as Point from "../core/point";
import * as pointHash from "./point-hash";

/**
 * Immutable Set like interface of points
 */
export class PointSet {
  private constructor(private set: Set<string>) {}

  /** Creates a new PointSet instance from an array-like or iterable object */
  static from(points: Iterable<Point.Point>): PointSet {
    const set = new Set<string>();
    for (const point of points) {
      set.add(pointHash.toString(point));
    }
    return new PointSet(set);
  }

  /** Creates a PointSet directly from a Set of hashed strings (internal use) */
  private static fromHashSet(set: Set<string>): PointSet {
    return new PointSet(set);
  }

  /** Returns the internal Set for efficient operations (internal use) */
  get _internalSet(): Set<string> {
    return this.set;
  }

  /** Returns a boolean asserting whether an point is present with the given value in the Set object or not */
  has(point: Point.Point): boolean {
    return this.set.has(pointHash.toString(point));
  }

  /** Returns the number of points in a PointSet object */
  get size(): number {
    return this.set.size;
  }

  /** Add the given point to given set */
  add(point: Point.Point): PointSet {
    const hash = pointHash.toString(point);
    if (this.set.has(hash)) {
      return this;
    }
    const newSet = new Set(this.set);
    newSet.add(hash);
    return new PointSet(newSet);
  }

  /** Remove the given point from the given set */
  delete(point: Point.Point): PointSet {
    const hash = pointHash.toString(point);
    if (!this.set.has(hash)) {
      return this;
    }
    const newSet = new Set(this.set);
    newSet.delete(hash);
    return new PointSet(newSet);
  }

  /** Returns a new PointSet with points in this set but not in other */
  difference(other: PointSet): PointSet {
    if (other.size === 0) {
      return this;
    }
    const otherSet = other._internalSet;
    const newSet = new Set<string>();
    for (const hash of this.set) {
      if (!otherSet.has(hash)) {
        newSet.add(hash);
      }
    }
    if (newSet.size === this.set.size) {
      return this;
    }
    return PointSet.fromHashSet(newSet);
  }

  /** Returns a new PointSet with all points in both sets */
  union(other: PointSet): PointSet {
    if (other.size === 0) {
      return this;
    }
    if (this.size === 0) {
      return other;
    }
    const newSet = new Set(this.set);
    let changed = false;
    for (const hash of other._internalSet) {
      if (!newSet.has(hash)) {
        newSet.add(hash);
        changed = true;
      }
    }
    return changed ? PointSet.fromHashSet(newSet) : this;
  }

  /** Creates an iterator of points in the set */
  *[Symbol.iterator](): Iterator<Point.Point> {
    for (const value of this.set) {
      yield pointHash.fromString(value);
    }
  }
}
