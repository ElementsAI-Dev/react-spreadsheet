import * as Point from "./point";

/** A two-dimensional array of given type T in rows and columns */
export type Matrix<T> = Array<Array<T | undefined>>;

/**
 * Creates an empty matrix with given rows and columns
 * @param rows - integer, the amount of rows the matrix should have
 * @param columns - integer, the amount of columns the matrix should have
 * @returns an empty matrix with given rows and columns
 */
export function createEmpty<T>(rows: number, columns: number): Matrix<T> {
  const matrix = Array(rows);
  for (let i = 0; i < rows; i++) {
    matrix[i] = Array(columns);
  }
  return matrix;
}

/** Gets the value at row and column of matrix. */
export function get<T>(point: Point.Point, matrix: Matrix<T>): T | undefined {
  const columns = matrix[point.row];
  if (columns === undefined) {
    return undefined;
  }
  return columns[point.column];
}

/** Creates a slice of matrix from startPoint up to, but not including, endPoint. */
export function slice<T>(
  startPoint: Point.Point,
  endPoint: Point.Point,
  matrix: Matrix<T>,
): Matrix<T> {
  const sliced: Matrix<T> = [];
  const columns = endPoint.column - startPoint.column;
  for (let row = startPoint.row; row <= endPoint.row; row++) {
    const slicedRow = row - startPoint.row;
    sliced[slicedRow] = sliced[slicedRow] || Array(columns);
    for (let column = startPoint.column; column <= endPoint.column; column++) {
      sliced[slicedRow][column - startPoint.column] = get(
        { row, column },
        matrix,
      );
    }
  }
  return sliced;
}

/** Sets the value at row and column of matrix. If a row doesn't exist, it's created. */
export function set<T>(
  point: Point.Point,
  value: T,
  matrix: Matrix<T>,
): Matrix<T> {
  const nextMatrix = [...matrix];

  // Synchronize first row length
  const firstRow = matrix[0];
  const nextFirstRow = firstRow ? [...firstRow] : [];
  if (nextFirstRow.length - 1 < point.column) {
    nextFirstRow[point.column] = undefined;
    nextMatrix[0] = nextFirstRow;
  }

  const nextRow = matrix[point.row] ? [...matrix[point.row]] : [];
  nextRow[point.column] = value;
  nextMatrix[point.row] = nextRow;

  return nextMatrix;
}

/** Like Matrix.set() but mutates the matrix */
export function mutableSet<T>(
  point: Point.Point,
  value: T,
  matrix: Matrix<T>,
): void {
  let firstRow = matrix[0];
  if (!firstRow) {
    firstRow = [];
    matrix[0] = firstRow;
  }
  if (!(point.row in matrix)) {
    matrix[point.row] = [];
  }
  // Synchronize first row length
  if (!(point.column in firstRow)) {
    firstRow[point.column] = undefined;
  }
  matrix[point.row][point.column] = value;
}

/**
 * Sets multiple values in the matrix immutably in a single operation.
 * More efficient than calling set() multiple times as it only creates
 * one copy of the matrix structure.
 */
export function setMultiple<T>(
  entries: Iterable<[Point.Point, T]>,
  matrix: Matrix<T>,
): Matrix<T> {
  // First, collect all changes to determine which rows need copying
  const changes = new Map<number, Map<number, T>>();
  let maxColumn = matrix[0]?.length ?? 0;
  let maxRow = matrix.length;

  for (const [point, value] of entries) {
    let rowChanges = changes.get(point.row);
    if (!rowChanges) {
      rowChanges = new Map<number, T>();
      changes.set(point.row, rowChanges);
    }
    rowChanges.set(point.column, value);
    if (point.column >= maxColumn) {
      maxColumn = point.column + 1;
    }
    if (point.row >= maxRow) {
      maxRow = point.row + 1;
    }
  }

  if (changes.size === 0) {
    return matrix;
  }

  // Create new matrix with only necessary row copies
  const nextMatrix: Matrix<T> = new Array(maxRow);

  // Handle first row separately to sync column length
  const firstRowChanges = changes.get(0);
  const originalFirstRow = matrix[0];
  if (
    firstRowChanges ||
    (originalFirstRow && originalFirstRow.length < maxColumn)
  ) {
    const nextFirstRow = originalFirstRow ? [...originalFirstRow] : [];
    if (nextFirstRow.length < maxColumn) {
      nextFirstRow.length = maxColumn;
    }
    if (firstRowChanges) {
      for (const [col, value] of firstRowChanges) {
        nextFirstRow[col] = value;
      }
    }
    nextMatrix[0] = nextFirstRow;
  } else if (originalFirstRow) {
    nextMatrix[0] = originalFirstRow;
  } else {
    nextMatrix[0] = new Array(maxColumn);
  }

  // Copy/modify remaining rows
  for (let row = 1; row < maxRow; row++) {
    const rowChanges = changes.get(row);
    const originalRow = matrix[row];
    if (rowChanges) {
      const nextRow = originalRow ? [...originalRow] : [];
      for (const [col, value] of rowChanges) {
        nextRow[col] = value;
      }
      nextMatrix[row] = nextRow;
    } else if (originalRow) {
      nextMatrix[row] = originalRow;
    } else {
      nextMatrix[row] = [];
    }
  }

  return nextMatrix;
}

/** Removes the coordinate of matrix */
export function unset<T>(point: Point.Point, matrix: Matrix<T>): Matrix<T> {
  if (!has(point, matrix)) {
    return matrix;
  }
  const nextMatrix = [...matrix];
  const nextRow = [...matrix[point.row]];

  // Avoid deleting to preserve first row length
  nextRow[point.column] = undefined;
  nextMatrix[point.row] = nextRow;

  return nextMatrix;
}

/** Creates an array of values by running each element in collection thru iteratee. */
export function map<T, T2>(
  func: (value: T | undefined, point: Point.Point) => T2,
  matrix: Matrix<T>,
): Matrix<T2> {
  const rows = matrix.length;
  if (rows === 0) {
    return [];
  }
  const columns = matrix[0]?.length ?? 0;
  const newMatrix: Matrix<T2> = new Array(rows);

  for (let row = 0; row < rows; row++) {
    const newRow: Array<T2 | undefined> = new Array(columns);
    const matrixRow = matrix[row];
    for (let column = 0; column < columns; column++) {
      const value = matrixRow?.[column];
      newRow[column] = func(value, { row, column });
    }
    newMatrix[row] = newRow;
  }
  return newMatrix;
}

/** Create an iterator over the cells in the matrix */
export function* entries<T>(
  matrix: Matrix<T>,
): IterableIterator<[Point.Point, T | undefined]> {
  for (const [row, values] of matrix.entries()) {
    for (const [column, value] of values.entries()) {
      const point = { row, column };
      yield [point, value];
    }
  }
}

/**
 * Converts all elements in row into a string separated by horizontalSeparator and each row string
 * to string separated by verticalSeparator
 */
export function join(
  matrix: Matrix<unknown>,
  horizontalSeparator = "\t",
  verticalSeparator = "\n",
): string {
  const { rows, columns } = getSize(matrix);
  if (rows === 0 || columns === 0) {
    return "";
  }

  const rowStrings: string[] = new Array(rows);
  for (let row = 0; row < rows; row++) {
    const cellValues: string[] = new Array(columns);
    const matrixRow = matrix[row];
    for (let column = 0; column < columns; column++) {
      cellValues[column] =
        matrixRow && column in matrixRow ? String(matrixRow[column]) : "";
    }
    rowStrings[row] = cellValues.join(horizontalSeparator);
  }
  return rowStrings.join(verticalSeparator);
}

/**
 * Parses a CSV separated by a horizontalSeparator and verticalSeparator into a
 * Matrix using a transform function
 */
export function split<T>(
  csv: string,
  transform: (value: string) => T,
  horizontalSeparator = "\t",
  verticalSeparator: string | RegExp = /\r\n|\n|\r/,
): Matrix<T> {
  // Temporarily replace line breaks inside quotes
  const replaced = csv.replace(/"([^"]*?)"/g, (match, p1) => {
    return p1.replace(/\n/g, "\\n");
  });
  return replaced.split(verticalSeparator).map((row) =>
    row
      .split(horizontalSeparator)
      .map((line) => {
        // Restore original line breaks in each line
        return line.replace(/\\n/g, "\n");
      })
      .map(transform),
  );
}

/** Returns whether the point exists in the matrix or not. */
export function has(point: Point.Point, matrix: Matrix<unknown>): boolean {
  const firstRow = matrix[0];
  return (
    firstRow &&
    // validation
    point.row >= 0 &&
    point.column >= 0 &&
    Number.isInteger(point.row) &&
    Number.isInteger(point.column) &&
    // first row length is in sync with other rows
    point.column < firstRow.length &&
    point.row < matrix.length
  );
}

/** Counts of the rows and column in a matrix */
export type Size = {
  /** Count of the rows in the matrix */
  rows: number;
  /** Count of the columns in the matrix */
  columns: number;
};

/** Gets the count of rows and columns of given matrix */
export function getSize(matrix: Matrix<unknown>): Size {
  return {
    columns: getColumnsCount(matrix),
    rows: getRowsCount(matrix),
  };
}

/** Gets the count of rows of given matrix */
export function getRowsCount(matrix: Matrix<unknown>): number {
  return matrix.length;
}

/** Gets the count of columns of given matrix */
export function getColumnsCount(matrix: Matrix<unknown>): number {
  const firstRow = matrix[0];
  return firstRow ? firstRow.length : 0;
}

/**
 * Pads matrix with empty rows to match given total rows
 * @param matrix - matrix to pad
 * @param totalRows - number of rows the matrix should have
 * @returns the updated matrix
 */
export function padRows<T>(matrix: Matrix<T>, totalRows: number): Matrix<T> {
  const { rows, columns } = getSize(matrix);

  if (rows >= totalRows) {
    return matrix;
  }

  const missingRows = totalRows - rows;
  const emptyRow = Array(columns).fill(undefined);
  const emptyRows = Array(missingRows).fill(emptyRow);
  return [...matrix, ...emptyRows];
}

/**
 * Pads matrix with empty columns to match given total columns
 * @param matrix - matrix to pad
 * @param size - minimum size of the matrix after padding.
 * @returns the updated matrix
 */
export function pad<T>(matrix: Matrix<T>, size: Size): Matrix<T> {
  const { rows, columns } = getSize(matrix);

  if (rows >= size.rows && columns >= size.columns) {
    // Optimization, no padding required.
    return matrix;
  }

  const resultSize: Size = {
    rows: size.rows > rows ? size.rows : rows,
    columns: size.columns > columns ? size.columns : columns,
  };

  let padded = [...matrix];
  if (resultSize.columns > columns) {
    const padColumns = resultSize.columns - columns;
    padded = padded.map((row) => [
      ...row,
      ...Array(padColumns).fill(undefined),
    ]);
  }

  if (resultSize.rows > rows) {
    const padRows = resultSize.rows - rows;
    const emptyRow = Array(resultSize.columns).fill(undefined);
    padded = [...padded, ...Array(padRows).fill(emptyRow)];
  }

  return padded;
}

export function toArray<T>(matrix: Matrix<T>): T[];
export function toArray<T1, T2>(
  matrix: Matrix<T1>,
  transform: (cell: T1 | undefined, coords: Point.Point) => T2,
): T2[];

/**
 * Flattens a matrix values to an array
 * @param matrix - the matrix to flatten values from
 * @param transform - optional transform function to apply to each value in the
 * matrix
 * @returns an array of the values from matrix, transformed if a transform
 * function is passed
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function toArray<T1, T2>(
  matrix: Matrix<T1>,
  transform?: (cell: T1 | undefined, coords: Point.Point) => T2,
) {
  const array = [];
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix[row].length; column++) {
      const value = matrix[row][column];
      array.push(transform ? transform(value, { row, column }) : value);
    }
  }

  return array;
}

/** Returns the maximum point in the matrix */
export function maxPoint(matrix: Matrix<unknown>): Point.Point {
  const size = getSize(matrix);
  return { row: size.rows - 1, column: size.columns - 1 };
}
