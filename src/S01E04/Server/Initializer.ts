import fs from "fs";
import path from "path";

export class Initializer {
    public constructor(private filesDirectory: string) {
    }

    public async initialize() {
        if (!fs.existsSync(this.filesDirectory)) {
            fs.mkdirSync(this.filesDirectory, { recursive: true });
        } else {
            fs.readdirSync(this.filesDirectory).forEach(file => {
                //fs.unlinkSync(path.join(this.filesDirectory, file));
            });
        }
    }
}