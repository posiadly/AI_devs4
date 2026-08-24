import axios from "axios";
import { Reporter } from "../../tools/Reporter.js";

export async function extraTask(url: string, apiKey: string): Promise<string> {
  /*number of tokens from ascii codes
    F – 70
    L – 76
    A – 65
    G – 71
*/
  const slices = [180, 197, 168, 184];

  let result = undefined;
  for (const slice of slices) {
    const reporter = new Reporter(url, apiKey);
    try {
      result = await reporter.sendAnswer("failure", {
        logs: textWithTokens.slice(0, slice),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error.response!.data);
      }
    }
  }
  return result!.message;
}

const textWithTokens = `
one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\neleven\ntwelve\nthirteen\nfourteen\n
fifteen\nsixteen\nseventeen\neighteen\nnineteen\ntwenty\ntwentyone\ntwentytwo\ntwentythree\ntwentyfour\ntwentyfive\ntwentysix\ntwentyseven\ntwentyeight\ntwentynine\nthirty\n
`;
