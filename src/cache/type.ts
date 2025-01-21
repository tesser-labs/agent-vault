export interface ICache<key, value> {
  get(key: key): value | undefined;
  set(key: key, value: value): void;
  delete(key: key): boolean;
  keys(): IterableIterator<key>;
}
