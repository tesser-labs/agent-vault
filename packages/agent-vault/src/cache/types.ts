export interface ICache<key, value> {
  get(key: key): Promise<value | undefined>;
  set(key: key, value: value): Promise<void>;
  delete(key: key): Promise<boolean>;
  keys(): AsyncIterableIterator<key>;
}
