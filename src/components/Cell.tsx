import * as React from "react";
import classnames from "classnames";
import * as Matrix from "../core/matrix";
import * as Types from "../types";
import * as Point from "../core/point";
import * as Actions from "../state/actions";
import { isActive, getOffsetRect } from "../util";
import useDispatch from "../state/use-dispatch";
import useShallowSelector from "../state/use-shallow-selector";

export const Cell: React.FC<Types.CellComponentProps> = ({
  row,
  column,
  DataViewer,
  selected,
  active,
  dragging,
  mode,
  data,
  evaluatedData,
  select,
  activate,
  setCellDimensions,
  setCellData,
}): React.ReactElement => {
  const rootRef = React.useRef<HTMLTableCellElement | null>(null);
  const point = React.useMemo(
    (): Point.Point => ({
      row,
      column,
    }),
    [row, column],
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLTableCellElement>) => {
      if (mode === "view") {
        setCellDimensions(point, getOffsetRect(event.currentTarget));

        if (event.shiftKey) {
          select(point);
        } else {
          activate(point);
        }
      }
    },
    [mode, setCellDimensions, point, select, activate],
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLTableCellElement>) => {
      if (dragging) {
        setCellDimensions(point, getOffsetRect(event.currentTarget));
        select(point);
      }
    },
    [setCellDimensions, select, dragging, point],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (selected && root) {
      setCellDimensions(point, getOffsetRect(root));
    }
    if (root && active && mode === "view") {
      root.focus();
    }
  }, [setCellDimensions, selected, active, mode, point, data]);

  if (data && data.DataViewer) {
    // @ts-ignore
    DataViewer = data.DataViewer;
  }

  return (
    <td
      ref={rootRef}
      className={classnames("Spreadsheet__cell", data?.className, {
        "Spreadsheet__cell--readonly": data?.readOnly,
      })}
      onMouseOver={handleMouseOver}
      onMouseDown={handleMouseDown}
      tabIndex={0}
    >
      <DataViewer
        row={row}
        column={column}
        cell={data}
        evaluatedCell={evaluatedData}
        setCellData={setCellData}
      />
    </td>
  );
};

export const enhance = (
  CellComponent: React.ComponentType<Types.CellComponentProps>,
): React.FC<
  Omit<
    Types.CellComponentProps,
    | "selected"
    | "active"
    | "copied"
    | "dragging"
    | "mode"
    | "data"
    | "select"
    | "activate"
    | "setCellDimensions"
  >
> => {
  return function CellWrapper(props) {
    const { row, column } = props;
    const dispatch = useDispatch();
    const point = React.useMemo(
      (): Point.Point => ({
        row,
        column,
      }),
      [row, column],
    );
    const setCellData = React.useCallback(
      (data: Types.CellBase) => dispatch(Actions.setCellData(point, data)),
      [dispatch, point],
    );
    const select = React.useCallback(
      (point: Point.Point) => dispatch(Actions.select(point)),
      [dispatch],
    );
    const activate = React.useCallback(
      (point: Point.Point) => dispatch(Actions.activate(point)),
      [dispatch],
    );
    const setCellDimensions = React.useCallback(
      (point: Point.Point, dimensions: Types.Dimensions) =>
        dispatch(Actions.setCellDimensions(point, dimensions)),
      [dispatch],
    );

    // Combined selector with shallow comparison for better performance
    const cellState = useShallowSelector((state) => {
      const active = isActive(state.active, point);
      return {
        active,
        mode: active ? state.mode : "view",
        data: Matrix.get(point, state.model.data),
        evaluatedData: Matrix.get(point, state.model.evaluatedData),
        selected: state.selected.has(state.model.data, point),
        dragging: state.dragging,
        copied: state.copied?.has(point) || false,
      };
    });

    return (
      <CellComponent
        {...props}
        selected={cellState.selected}
        active={cellState.active}
        copied={cellState.copied}
        dragging={cellState.dragging}
        mode={cellState.mode}
        evaluatedData={cellState.evaluatedData}
        data={cellState.data}
        select={select}
        activate={activate}
        setCellDimensions={setCellDimensions}
        setCellData={setCellData}
      />
    );
  };
};
