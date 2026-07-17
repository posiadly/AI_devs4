import { Maze } from "./Maze.js";
import { InterpretPictureResult } from "../schemas/interpretPicture.js";
import { MazeEdgeStatus } from "./MazeCell.js";

export function buildMaze(pictures: InterpretPictureResult["pictures"]): Maze {
  if (pictures.length !== 9) {
    throw new Error(`Expected 9 pictures, got ${pictures.length}`);
  }

  const cellEdges = pictures.map((picture) => {
    const existing = new Set(picture.existing);
    return {
      top: existing.has("top") ? MazeEdgeStatus.open : MazeEdgeStatus.closed,
      right: existing.has("right")
        ? MazeEdgeStatus.open
        : MazeEdgeStatus.closed,
      bottom: existing.has("bottom")
        ? MazeEdgeStatus.open
        : MazeEdgeStatus.closed,
      left: existing.has("left") ? MazeEdgeStatus.open : MazeEdgeStatus.closed,
    };
  });

  return new Maze(cellEdges);
}
