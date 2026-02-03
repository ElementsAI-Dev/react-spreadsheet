import FormulaParser, { FormulaError, Value } from "fast-formula-parser";
import * as Matrix from "../core/matrix";
import { Point } from "../core/point";
import { CellBase, CreateFormulaParser } from "../types";
import * as Formula from "./formula";
import { PointGraph } from "./point-graph";
import { PointSet } from "./point-set";

export class Model<Cell extends CellBase> {
  readonly data!: Matrix.Matrix<Cell>;
  readonly evaluatedData!: Matrix.Matrix<Cell>;
  readonly referenceGraph!: PointGraph;
  readonly createFormulaParser!: CreateFormulaParser;

  constructor(
    createFormulaParser: CreateFormulaParser,
    data: Matrix.Matrix<Cell>,
    referenceGraph?: PointGraph,
    evaluatedData?: Matrix.Matrix<Cell>,
  ) {
    this.createFormulaParser = createFormulaParser;
    this.data = data;
    this.referenceGraph = referenceGraph || createReferenceGraph(data);
    this.evaluatedData =
      evaluatedData ||
      createEvaluatedData(data, this.referenceGraph, this.createFormulaParser);
  }
}

export function updateCellValue<Cell extends CellBase>(
  model: Model<Cell>,
  point: Point,
  cell: Cell,
): Model<Cell> {
  const nextData = Matrix.set(point, cell, model.data);
  const nextReferenceGraph = Formula.isFormulaValue(cell.value)
    ? updateReferenceGraph(model.referenceGraph, point, cell, nextData)
    : model.referenceGraph;

  const formulaParser = model.createFormulaParser(nextData);
  const nextEvaluatedData = evaluateCell(
    model.evaluatedData,
    nextData,
    nextReferenceGraph,
    point,
    cell,
    formulaParser,
  );
  return new Model(
    model.createFormulaParser,
    nextData,
    nextReferenceGraph,
    nextEvaluatedData,
  );
}

function updateReferenceGraph(
  referenceGraph: PointGraph,
  point: Point,
  cell: CellBase<string>,
  data: Matrix.Matrix<CellBase>,
): PointGraph {
  const references = Formula.getReferences(
    Formula.extractFormula(cell.value),
    point,
    data,
  );
  const nextReferenceGraph = referenceGraph.set(point, references);
  return nextReferenceGraph;
}

function evaluateCell<Cell extends CellBase>(
  prevEvaluatedData: Matrix.Matrix<Cell>,
  data: Matrix.Matrix<Cell>,
  referenceGraph: PointGraph,
  point: Point,
  cell: Cell,
  formulaParser: FormulaParser,
): Matrix.Matrix<Cell> {
  if (referenceGraph.hasCircularDependency(point)) {
    // Collect all updates for batch operation
    const updates: Array<[Point, Cell]> = [
      [point, { ...cell, value: FormulaError.REF } as Cell],
    ];
    let visited = PointSet.from([point]);

    for (const referrer of referenceGraph.getBackwardsRecursive(point)) {
      if (visited.has(referrer)) {
        break;
      }
      visited = visited.add(referrer);
      const referrerCell = Matrix.get(referrer, data);
      if (!referrerCell) {
        continue;
      }
      updates.push([
        referrer,
        { ...referrerCell, value: FormulaError.REF } as Cell,
      ]);
    }

    return Matrix.setMultiple(updates, prevEvaluatedData);
  }

  // Collect all updates for batch operation
  const updates: Array<[Point, Cell]> = [];

  const evaluatedValue = Formula.isFormulaValue(cell.value)
    ? getFormulaComputedValue(cell.value, point, formulaParser)
    : cell.value;

  updates.push([point, { ...cell, value: evaluatedValue } as Cell]);

  // for every formula cell that references the cell re-evaluate (recursive)
  for (const referrer of referenceGraph.getBackwardsRecursive(point)) {
    const referrerCell = Matrix.get(referrer, data);
    if (!referrerCell) {
      continue;
    }
    const evaluatedValue = Formula.isFormulaValue(referrerCell.value)
      ? getFormulaComputedValue(referrerCell.value, referrer, formulaParser)
      : referrerCell.value;
    updates.push([
      referrer,
      { ...referrerCell, value: evaluatedValue } as Cell,
    ]);
  }

  return Matrix.setMultiple(updates, prevEvaluatedData);
}

/**
 *
 * @param data - the spreadsheet data
 * @returns the spreadsheet reference graph
 */
export function createReferenceGraph(
  data: Matrix.Matrix<CellBase>,
): PointGraph {
  const entries: Array<[Point, PointSet]> = [];
  for (const [point, cell] of Matrix.entries(data)) {
    if (cell && Formula.isFormulaValue(cell.value)) {
      const references = Formula.getReferences(
        Formula.extractFormula(cell.value),
        point,
        data,
      );
      entries.push([point, references]);
    }
  }
  return PointGraph.from(entries);
}

export function createEvaluatedData<Cell extends CellBase>(
  data: Matrix.Matrix<Cell>,
  referenceGraph: PointGraph,
  createFormulaParser: CreateFormulaParser,
): Matrix.Matrix<Cell> {
  // Collect all formula cells that need evaluation
  const formulaCells: Array<{ point: Point; cell: Cell }> = [];
  for (const point of referenceGraph.traverseBFSBackwards()) {
    const cell = Matrix.get(point, data);
    if (cell && Formula.isFormulaValue(cell.value)) {
      formulaCells.push({ point, cell });
    }
  }

  // If no formula cells, return data as-is
  if (formulaCells.length === 0) {
    return data;
  }

  // For formula evaluation, we need to evaluate in order since formulas
  // may depend on previously evaluated cells. Use mutable approach for
  // intermediate state, then create immutable result.
  let evaluatedData = data;
  let formulaParser = createFormulaParser(evaluatedData);

  // Process formulas in dependency order (leaves first from BFS traversal)
  for (const { point, cell } of formulaCells) {
    const evaluatedValue = getFormulaComputedValue(
      cell.value,
      point,
      formulaParser,
    );
    evaluatedData = Matrix.set(
      point,
      { ...cell, value: evaluatedValue },
      evaluatedData,
    );
    // Only recreate parser if there are more cells to process
    // This is necessary because subsequent formulas may reference this cell
    formulaParser = createFormulaParser(evaluatedData);
  }

  return evaluatedData;
}

/** Get the computed value of a formula cell */
export function getFormulaComputedValue(
  value: string,
  point: Point,
  formulaParser: FormulaParser,
): Value {
  const formula = Formula.extractFormula(value);
  try {
    return Formula.evaluate(formula, point, formulaParser);
  } catch (e) {
    return FormulaError.REF;
  }
}
