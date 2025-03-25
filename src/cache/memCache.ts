import type { ICache } from "./types";

export class Memcache<key, value> implements ICache<key, value> {
  private cache: Map<key, value> = new Map();
  async get(key: key): Promise<value | undefined> {
    return this.cache.get(key);
  }
  async set(key: key, value: value): Promise<void> {
    this.cache.set(key, value);
  }
  async delete(key: key): Promise<boolean> {
    return this.cache.delete(key);
  }
  async *keys(): AsyncIterableIterator<key> {
    yield* this.cache.keys();
  }
}
