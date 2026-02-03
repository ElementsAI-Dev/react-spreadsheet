import * as React from "react";
import { getRangeDimensions } from "../util";
import useShallowSelector from "../state/use-shallow-selector";
import FloatingRect from "./FloatingRect";

const Copied: React.FC = () => {
  // Combined selector with shallow comparison for better performance
  const { dimensions, hidden } = useShallowSelector((state) => {
    const range = state.copied;
    return {
      dimensions: range
        ? getRangeDimensions(state.rowDimensions, state.columnDimensions, range)
        : undefined,
      hidden: range === null,
    };
  });

  return (
    <FloatingRect
      variant="copied"
      dimensions={dimensions}
      hidden={hidden}
      dragging={false}
    />
  );
};

export default Copied;
