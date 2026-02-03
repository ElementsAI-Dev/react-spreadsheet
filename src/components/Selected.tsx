import * as React from "react";
import { getSelectedDimensions } from "../util";
import useShallowSelector from "../state/use-shallow-selector";
import FloatingRect from "./FloatingRect";

const Selected: React.FC = () => {
  // Combined selector with shallow comparison for better performance
  const { dimensions, dragging, hidden } = useShallowSelector((state) => ({
    dimensions: getSelectedDimensions(
      state.rowDimensions,
      state.columnDimensions,
      state.model.data,
      state.selected,
    ),
    dragging: state.dragging,
    hidden: state.selected.size(state.model.data) < 2,
  }));
  return (
    <FloatingRect
      variant="selected"
      dimensions={dimensions}
      dragging={dragging}
      hidden={hidden}
    />
  );
};

export default Selected;
