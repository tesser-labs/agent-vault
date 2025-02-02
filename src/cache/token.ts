import { FSCache } from "./fsCache";
import { ICache } from "./type";
import { Credentials } from "@/providers";

const BASE_PATH = "./.store/tokens";

class TokenManager<T> {
  private cache: ICache<string, T>;
  constructor(cache: ICache<string, T>) {
    this.cache = cache;
  }
  get(key: string): T | undefined {
    return this.cache.get(key);
  }
  set(key: string, value: T): void {
    this.cache.set(key, value);
  }
  delete(key: string): void {
    this.cache.delete(key);
  }
  take(key: string): T | undefined {
    const value = this.get(key);
    this.delete(key);
    return value;
  }
  keys(): IterableIterator<string> {
    return this.cache.keys();
  }
}

// export a singleton instance of SessionManager
const tokenManager = new TokenManager<Credentials>(new FSCache(BASE_PATH));
export default tokenManager;
