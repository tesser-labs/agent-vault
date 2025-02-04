import { kv } from "@vercel/kv";
import type { ICache } from "./type";

export class KVCache<T> implements ICache<string, T> {
  private prefix: string;

  constructor(prefix: string = "cache:") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    try {
      const value = await kv.get<T>(this.getKey(key));
      return value ?? undefined;
    } catch (error) {
      console.error("KVCache get error:", error);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      await kv.set(this.getKey(key), value);
    } catch (error) {
      console.error("KVCache set error:", error);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await kv.del(this.getKey(key));
      return true;
    } catch (error) {
      console.error("KVCache delete error:", error);
      return false;
    }
  }

  async *keys(): AsyncIterableIterator<string> {
    try {
      // Note: This uses the KEYS command which may be slow for large datasets
      // Consider using SCAN for production use
      const keys = await kv.keys(this.prefix + "*");
      // Remove prefix from keys
      for (const key of keys) {
        yield key.slice(this.prefix.length);
      }
    } catch (error) {
      console.error("KVCache keys error:", error);
      // Empty generator in case of error
      // Explicitly yield nothing by using an empty array
      yield* [];
    }
  }
}
