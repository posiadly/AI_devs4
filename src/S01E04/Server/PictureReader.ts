
import { OpenRouterService } from "../../tools/OpenRouterService.js";
import { Message, UserMessage, ChatMessageContentItemImage, ChatMessageContentItemImageType } from "@openrouter/sdk/models";


export class PictureReader {
    constructor(private openRouter: OpenRouterService) {
    }

    public async readPicture(binaryData: Buffer, mimeType: string, prompt: string): Promise<string> {

        const dataUrl = this.toDataUrl(binaryData, mimeType);
        const information = await this.openRouter.ask({
            model: "openai/gpt-4.1", messages: [
                { role: "system", content: prompt } as Message,
                {
                    role: "user",
                    content: [{ type: ChatMessageContentItemImageType.ImageUrl, imageUrl: { url: dataUrl } } as ChatMessageContentItemImage]
                } as UserMessage
            ]
        });
        return information.message!;
    }

    private toDataUrl(binaryData: Buffer, mimeType: string): string {
        return `data:${mimeType};base64,${binaryData.toString('base64')}`;
    }
}