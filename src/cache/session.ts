// import { FSCache } from "./fsCache";
import { KVCache } from "./kvCache";
import type { ICache } from "./types";
import { AuthSession } from "@/authProviders";

// const BASE_PATH = "./.store/sessions";

export function getTokenStorageKey({
  agentName,
  provider,
  resource,
}: {
  agentName?: string;
  provider: string;
  resource?: string;
}) {
  //ToDo: retrieve the proper key for the user (AgentDID-UserDID-Resource)
  return decodeURIComponent(
    `${provider}-${resource || "all"}-${agentName || "all"}`
  );
}

class SessionManager<T> {
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
}

// export a singleton instance of SessionManager
const sessionManager = new SessionManager<AuthSession>(new KVCache("session"));
console.log("renewed session manager");
export default sessionManager;
