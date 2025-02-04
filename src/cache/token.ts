import { FSCache } from "./fsCache";
import { ICache } from "./type";
import { Credentials } from "@/providers";
import { KVCache } from "./kvCache";

const BASE_PATH = "./.store/tokens";

class TokenManager<T> {
  private cache: ICache<string, T>;
  constructor(cache: ICache<string, T>) {
    this.cache = cache;
  }
  async get(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }
  async set(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
  }
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
  async take(key: string): Promise<T | undefined> {
    const value = await this.get(key);
    await this.delete(key);
    return value;
  }
  async *keys(): AsyncIterableIterator<string> {
    yield* this.cache.keys();
  }
}

// export a singleton instance of SessionManager
const tokenManager = new TokenManager<Credentials>(new KVCache("token"));
export default tokenManager;
