import { GameSession } from "./engineWrapper";
import { StepInput } from "./types";

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const session = new GameSession();

process.on("uncaughtException", (err) => {
  // console.error("[UNCAUGHT EXCEPTION]", err);
});

rl.on("line", async function (line: string) {
  try {
    // console.error("[RECEIVED]", line);

    const data = JSON.parse(line);

    let result;

    if (data.command === "reset") {
      result = await maybeAsync(session.reset());
    } else if (data.command === "step") {
      result = await maybeAsync(session.step(data.payload as StepInput));
    } else {
      throw new Error(`Unknown command: ${data.command}`);
    }

    if (result === undefined) {
      // console.error(
      //   `[ERROR] Command '${data.command}' returned undefined (bad logic?)`
      // );
      result = {
        error: "Command returned undefined",
      };
    }

    const output = JSON.stringify(result);
    // console.error("[RESPONSE] [index]", output);
    if (!output) {
      // console.error("[FATAL] Tried to write empty output");
    }

    console.log(output);
  } catch (err: any) {
    // console.error("[ERROR] [index]", err);
    console.log(JSON.stringify({ error: err.message }));
  }
});

// Helper to handle both sync and async returns
async function maybeAsync<T>(value: T | Promise<T>): Promise<T> {
  if (value instanceof Promise) {
    return await value;
  }
  return value;
}
