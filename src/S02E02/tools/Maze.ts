import { MazeCell, MazeCellEdges, MazeEdgeStatus } from "./MazeCell.js";

export class Maze {
  private cells: MazeCell[][];

  constructor(cellEdges: MazeCellEdges[]) {
    if (cellEdges.length !== 9) {
      throw new Error(`Expected 9 cells, got ${cellEdges.length}`);
    }
    const built = cellEdges.map((edges, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      return new MazeCell(
        this,
        row,
        col,
        edges.top ?? MazeEdgeStatus.closed,
        edges.right ?? MazeEdgeStatus.closed,
        edges.bottom ?? MazeEdgeStatus.closed,
        edges.left ?? MazeEdgeStatus.closed,
      );
    });
    this.cells = [built.slice(0, 3), built.slice(3, 6), built.slice(6, 9)];
  }

  getCell(row: number, col: number): MazeCell {
    return this.cells[row][col];
  }

  get size(): number {
    return this.cells.length;
  }

  public rotate(row: number, col: number) {
    this.cells[row][col].rotateClockwise();
  }
  public getCells(): MazeCell[][] {
    return this.cells;
  }
}
