import type { ResponseFormatJSONSchema } from "@openrouter/sdk/models/responseformatjsonschema";

export type CrossPart = "top" | "right" | "bottom" | "left";

export type InterpretPictureResult = {
  pictures: Array<{
    existing: CrossPart[];
  }>;
};

export const interpretPictureSchema: ResponseFormatJSONSchema = {
  type: "json_schema",
  jsonSchema: {
    name: "interpret_picture_output",
    strict: true,
    schema: {
      type: "object",
      properties: {
        pictures: {
          type: "array",
          description:
            "One entry per analyzed tile after the full-cross reference, in order.",
          items: {
            type: "object",
            properties: {
              existing: {
                type: "array",
                description: "Parts of the cross that are present on this tile.",
                items: {
                  type: "string",
                  enum: ["top", "right", "bottom", "left"],
                },
              },
            },
            required: ["existing"],
            additionalProperties: false,
          },
        },
      },
      required: ["pictures"],
      additionalProperties: false,
    },
  },
};
