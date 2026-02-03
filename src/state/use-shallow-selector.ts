import * as React from "react";
import { useContextSelector } from "use-context-selector";
import * as Types from "../types";
import context from "./context";

/**
 * Shallow comparison for objects
 * Returns true if both objects have the same keys with the same values (using Object.is)
 */
function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !Object.is(a[key], b[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * A selector hook that uses shallow comparison for object results.
 * This allows combining multiple state selections into a single object
 * while avoiding unnecessary re-renders when the values haven't changed.
 */
function useShallowSelector<T extends object>(
  selector: (state: Types.StoreState) => T,
): T {
  const prevRef = React.useRef<T | undefined>(undefined);

  return useContextSelector(context, ([state]) => {
    const next = selector(state);

    // If previous value exists and is shallowly equal, return the previous reference
    if (prevRef.current !== undefined && shallowEqual(prevRef.current, next)) {
      return prevRef.current;
    }

    prevRef.current = next;
    return next;
  });
}

export default useShallowSelector;
