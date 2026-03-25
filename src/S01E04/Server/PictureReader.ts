import { Message } from "@openrouter/sdk/esm/models/message.js";
import { OpenRouterService } from "../../tools/OpenRouterService.js";

export class PictureReader {
    constructor(private openRouter: OpenRouterService) {
    }

    public async readPicture(binaryData: Buffer, mimeType: string, prompt: string): Promise<string> {

        const dataUrl = this.toDataUrl(binaryData, mimeType);
        const information = await this.openRouter.ask({
            model: "openai/gpt-4.1", messages: [
                { role: "system", content: prompt },
                {
                    role: "user",
                    content: [{ type: "image_url", image_url: { url: dataUrl } }]
                }
            ] as Message[]
        });
        return information.message!;
    }

    private toDataUrl(binaryData: Buffer, mimeType: string): string {
        return `data:${mimeType};base64,${binaryData.toString('base64')}`;
    }
}