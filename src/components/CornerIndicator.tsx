import * as React from "react";
import classNames from "classnames";
import * as Actions from "../state/actions";
import { EntireWorksheetSelection } from "../core/selection";
import * as Types from "../types";
import useDispatch from "../state/use-dispatch";
import useSelector from "../state/use-selector";

const CornerIndicator: Types.CornerIndicatorComponent = ({
  selected,
  onSelect,
}) => {
  const handleClick = React.useCallback(() => {
    onSelect();
  }, [onSelect]);
  return (
    <th
      className={classNames("Spreadsheet__header", {
        "Spreadsheet__header--selected": selected,
      })}
      onClick={handleClick}
      tabIndex={0}
    />
  );
};

export default CornerIndicator;

export const enhance = (
  CornerIndicatorComponent: Types.CornerIndicatorComponent,
): React.FC<Omit<Types.CornerIndicatorProps, "selected" | "onSelect">> => {
  return function CornerIndicatorWrapper(props) {
    const dispatch = useDispatch();
    const selectEntireWorksheet = React.useCallback(
      () => dispatch(Actions.selectEntireWorksheet()),
      [dispatch],
    );
    const selected = useSelector(
      (state) => state.selected instanceof EntireWorksheetSelection,
    );
    return (
      <CornerIndicatorComponent
        {...props}
        selected={selected}
        onSelect={selectEntireWorksheet}
      />
    );
  };
};
