import { FSCache } from "./fsCache";
import type { ICache } from "./type";
import { AuthSession } from "@/providers";

const BASE_PATH = "./.store/sessions";

export function getTokenStorageKey(udid: string, resource: string) {
  //ToDo: retrieve the proper key for the user (AgentDID-UserDID-Resource)
  return decodeURIComponent(`${udid}-${resource}`);
}

class SessionManager<T> {
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
}

// export a singleton instance of SessionManager
const sessionManager = new SessionManager<AuthSession>(new FSCache(BASE_PATH));
console.log("renewed session manager");
export default sessionManager;
