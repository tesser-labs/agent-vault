import { Transport } from "./types";
import { createInterface } from "readline";

export class StdioTransport implements Transport {
  private buffer: string = "";
  private resolveRead: ((value: string) => void) | null = null;
  private readonly delimiter = "\n\n";

  constructor() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", (line) => {
      this.buffer += line + "\n";

      if (this.buffer.endsWith(this.delimiter)) {
        const message = this.buffer.slice(0, -this.delimiter.length);
        this.buffer = "";

        if (this.resolveRead) {
          this.resolveRead(message);
          this.resolveRead = null;
        }
      }
    });
  }

  async read(): Promise<string> {
    if (this.buffer.endsWith(this.delimiter)) {
      const message = this.buffer.slice(0, -this.delimiter.length);
      this.buffer = "";
      return message;
    }

    return new Promise((resolve) => {
      this.resolveRead = resolve;
    });
  }

  async write(data: string): Promise<void> {
    process.stdout.write(data + this.delimiter);
  }
}
