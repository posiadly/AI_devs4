import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getGoodsCountTool = tool(
    (input) => {
        const lines = input.csvContent.trim().split("\n");
        const dataRows = Math.max(0, lines.length - 1);
        return `The CSV has ${dataRows} data row(s) (${lines.length} line(s) including header).`;
    },
    {
        name: "get_goods_count",
        description: "Counts the number of data rows in a CSV string (excluding the header row).",
        schema: z.object({
            csvContent: z.string().describe("The full CSV content as a string."),
        }),
    }
);
