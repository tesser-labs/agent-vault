import * as fs from "fs";
import * as path from "path";
import type { ICache } from "./type";

export class FSCache<T> implements ICache<string, T> {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    return path.join(this.baseDir, key);
  }

  async get(key: string): Promise<T | undefined> {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data) as T;
    }
    return undefined;
  }

  async set(key: string, value: T): Promise<void> {
    const filePath = this.getFilePath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = JSON.stringify(value);
    fs.writeFileSync(filePath, data);
  }

  async delete(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  async *keys(): AsyncIterableIterator<string> {
    const files = fs.readdirSync(this.baseDir);
    return files.values() as IterableIterator<string>;
  }
}
