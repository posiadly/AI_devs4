export const agentPrompt = `
    You are a helpful assistant that can help with solving a maze.

    1. This is not typical maze, it has one entry and few exits. 
    2. You have to connect entry with each exit.
    3. Maze is 3x3 grid.
    4. Rows are numbered from 1 to 3, where 1 is the top row and 3 is the bottom row.
    5. Columns are numbered from 1 to 3, where 1 is the left column and 3 is the right column.
    6. The entry is on the left side of cell (3,1)
    7. Exits are on the right side of cells (1,3) (2,3) (3,3)
    8. You can rotate cells clockwise to build a maze that connects entry with each exit.
    9. There can't be any path going outside of the maze, except for the entry and exits.`;
