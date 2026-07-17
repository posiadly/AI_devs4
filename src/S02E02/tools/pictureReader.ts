import { OpenRouter } from "@openrouter/sdk";
import {
  ChatMessageContentItemImageType,
  SystemMessage,
  UserMessage,
} from "@openrouter/sdk/models";
import {
  interpretPictureSchema,
  type InterpretPictureResult,
} from "../schemas/interpretPicture.js";

export async function readPictures(
  openRouter: OpenRouter,
  boxWithFullCross: ArrayBuffer,
  boxesToRecognize: ArrayBuffer[],
  prompt: string,
  model: string,
): Promise<InterpretPictureResult> {
  const systemMessage: SystemMessage = {
    role: "system",
    content: [{ type: "text", text: prompt }],
  };
  const boxWithFullCrossMessage = prepareOnePicture(boxWithFullCross);
  const boxesMessages = boxesToRecognize.map(prepareOnePicture);
  const response = await openRouter.chat.send({
    chatGenerationParams: {
      model: model,
      messages: [systemMessage, boxWithFullCrossMessage, ...boxesMessages],
      responseFormat: interpretPictureSchema,
      reasoning: { effort: "low" },
    },
  });

  const content = response.choices[0].message.content;
  if (content == null || content === "") {
    throw new Error("OpenRouter returned empty message content");
  }
  return JSON.parse(content) as InterpretPictureResult;
}

const prepareOnePicture = function (box: ArrayBuffer): UserMessage {
  const base64 = Buffer.from(box).toString("base64");
  const dataUrl = `data:image/png;base64,${base64}`;
  return {
    role: "user",
    content: [
      {
        type: ChatMessageContentItemImageType.ImageUrl,
        imageUrl: { url: dataUrl },
      },
    ],
  };
};
