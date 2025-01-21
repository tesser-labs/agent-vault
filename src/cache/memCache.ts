import type { ICache } from "./type";

export class Memcache<key, value> implements ICache<key, value> {
  private cache: Map<key, value> = new Map();
  get(key: key): value | undefined {
    return this.cache.get(key);
  }
  set(key: key, value: value): void {
    this.cache.set(key, value);
  }
  delete(key: key): boolean {
    return this.cache.delete(key);
  }
  keys(): IterableIterator<key> {
    return this.cache.keys();
  }
}
