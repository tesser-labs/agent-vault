import * as fs from "fs";
import * as path from "path";
import type { ICache } from "./type";

export class FSCache<T> implements ICache<string, T> {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    return path.join(this.basePath, key);
  }

  get(key: string): T | undefined {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data) as T;
    }
    return undefined;
  }

  set(key: string, value: T): void {
    const filePath = this.getFilePath(key);
    const data = JSON.stringify(value);
    fs.writeFileSync(filePath, data);
  }

  delete(key: string): boolean {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  keys(): IterableIterator<string> {
    const files = fs.readdirSync(this.basePath);
    return files.values() as IterableIterator<string>;
  }
}
