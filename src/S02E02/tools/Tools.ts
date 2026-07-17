import { ToolDefinitionJson } from "@openrouter/sdk/models";
import { Maze } from "./Maze.js";
import { TaskReporter } from "./TaskReporter.js";

/**
 * Collection-level tool type. Args must be `any` so tools with different
 * handler signatures can live in one array (parameter contravariance).
 */
export type Tool = {
  name: string;
  definition: ToolDefinitionJson;
  handler: (args: any) => Promise<unknown>;
};

/** Preserves each tool's arg/result types at the definition site. */
export function defineTool<TArgs, TResult>(tool: {
  name: string;
  definition: ToolDefinitionJson;
  handler: (args: TArgs) => Promise<TResult>;
}): Tool {
  return tool;
}

export function createTools(maze: Maze, taskReporter: TaskReporter): Tool[] {
  return [
    defineTool({
      name: "rotate",
      definition: {
        type: "function",
        function: {
          name: "rotate",
          description: "Rotate a maze cell clockwise",
          parameters: {
            type: "object",
            properties: {
              row: { type: "integer", description: "Row index (1-3)" },
              col: { type: "integer", description: "Column index (1-3)" },
            },
            required: ["row", "col"],
          },
        },
      },
      handler: async (args: { row: number; col: number }) => {
        console.log(`Rotating cell at (${args.row}, ${args.col})`);
        maze.rotate(args.row - 1, args.col - 1);
        const result = await taskReporter.rotate(args.row, args.col);
        console.log(`API answer:`, result);
        return {
          structuredContent: result,
        };
      },
    }),
    {
      name: "get_maze",
      definition: {
        type: "function",
        function: {
          name: "get_maze",
          description: "Get the current state of the maze",
        },
      },
      handler: async () => {
        const cells = maze.getCells();
        return {
          content: [
            {
              type: "text",
              text: describeMaze(maze),
            },
          ],
        };
      },
    },
  ];
}

function describeMaze(maze: Maze): string {
  const description = `
          cell (1,1) has open edges: ${maze.getCell(0, 0).getOpenEdges().join(", ")}
          cell (1,2) has open edges: ${maze.getCell(0, 1).getOpenEdges().join(", ")}
          cell (1,3) has open edges: ${maze.getCell(0, 2).getOpenEdges().join(", ")}
          cell (2,1) has open edges: ${maze.getCell(1, 0).getOpenEdges().join(", ")}
          cell (2,2) has open edges: ${maze.getCell(1, 1).getOpenEdges().join(", ")}
          cell (2,3) has open edges: ${maze.getCell(1, 2).getOpenEdges().join(", ")}
          cell (3,1) has open edges: ${maze.getCell(2, 0).getOpenEdges().join(", ")}
          cell (3,2) has open edges: ${maze.getCell(2, 1).getOpenEdges().join(", ")}
          cell (3,3) has open edges: ${maze.getCell(2, 2).getOpenEdges().join(", ")}`;
  console.log(description);
  return description;
}
