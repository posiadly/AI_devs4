import type { Maze } from "./Maze.js";

export enum MazeEdgeStatus {
  open = "open",
  closed = "closed",
}
export enum MazeCellEdge {
  top = "top",
  right = "right",
  bottom = "bottom",
  left = "left",
}

export type MazeCellEdges = {
  top?: MazeEdgeStatus;
  right?: MazeEdgeStatus;
  bottom?: MazeEdgeStatus;
  left?: MazeEdgeStatus;
};

const EDGE_OFFSET: Record<MazeCellEdge, { row: number; col: number }> = {
  [MazeCellEdge.top]: { row: -1, col: 0 },
  [MazeCellEdge.right]: { row: 0, col: 1 },
  [MazeCellEdge.bottom]: { row: 1, col: 0 },
  [MazeCellEdge.left]: { row: 0, col: -1 },
};

export class MazeCell {
  private edges: Map<MazeCellEdge, MazeEdgeStatus> = new Map<
    MazeCellEdge,
    MazeEdgeStatus
  >();

  constructor(
    private readonly maze: Maze,
    private readonly row: number,
    private readonly col: number,
    topStatus: MazeEdgeStatus = MazeEdgeStatus.closed,
    rightStatus: MazeEdgeStatus = MazeEdgeStatus.closed,
    bottomStatus: MazeEdgeStatus = MazeEdgeStatus.closed,
    leftStatus: MazeEdgeStatus = MazeEdgeStatus.closed,
  ) {
    this.edges.set(MazeCellEdge.top, topStatus);
    this.edges.set(MazeCellEdge.right, rightStatus);
    this.edges.set(MazeCellEdge.bottom, bottomStatus);
    this.edges.set(MazeCellEdge.left, leftStatus);
  }

  public rotateClockwise() {
    const top = this.edges.get(MazeCellEdge.top)!;
    const right = this.edges.get(MazeCellEdge.right)!;
    const bottom = this.edges.get(MazeCellEdge.bottom)!;
    const left = this.edges.get(MazeCellEdge.left)!;
    this.edges.set(MazeCellEdge.top, left);
    this.edges.set(MazeCellEdge.right, top);
    this.edges.set(MazeCellEdge.bottom, right);
    this.edges.set(MazeCellEdge.left, bottom);
  }

  public getOpenEdges(): MazeCellEdge[] {
    return Array.from(this.edges.entries())
      .filter(([_, value]) => value === MazeEdgeStatus.open)
      .map(([key]) => key);
  }

  public getNeighbors(): MazeCell[] {
    const neighbors: MazeCell[] = [];
    for (const edge of this.getOpenEdges()) {
      const { row: dRow, col: dCol } = EDGE_OFFSET[edge];
      const nRow = this.row + dRow;
      const nCol = this.col + dCol;
      if (
        nRow < 0 ||
        nRow >= this.maze.size ||
        nCol < 0 ||
        nCol >= this.maze.size
      ) {
        continue;
      }
      neighbors.push(this.maze.getCell(nRow, nCol));
    }
    return neighbors;
  }
  public getCoordinates(): { row: number; col: number } {
    return { row: this.row, col: this.col };
  }
}
