import { Reporter } from "../../tools/Reporter.js";

export class TaskReporter {
  public constructor(
    private readonly pictureUrl: string,
    private url: string,
    private apiKey: string,
  ) {}
  public async reset() {
    const response = await fetch(`${this.pictureUrl}?reset=1`);
  }
  public async rotate(row: number, col: number) {
    const reporter = new Reporter(this.url, this.apiKey);
    const result = await reporter.sendAnswer("electricity", {
      rotate: `${row}x${col}`,
    });
    return result;
  }
}
