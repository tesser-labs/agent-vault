import { KVCache } from "../kvCache";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
describe("KVCache Integration Tests", () => {
  let cache: KVCache<string | Record<string, string | number>>;
  const testPrefix = "test:";

  beforeEach(() => {
    cache = new KVCache(testPrefix);
  });

  afterEach(async () => {
    // Cleanup: delete all test keys
    for await (const key of cache.keys()) {
      await cache.delete(key);
    }
  });

  test("should set and get a string value", async () => {
    const key = "hello";
    const value = "world";

    await cache.set(key, value);
    const result = await cache.get(key);

    expect(result).toBe(value);
  });

  test("should set and get an object value", async () => {
    const key = "user";
    const value = { name: "John", age: 30 };

    await cache.set(key, value);
    const result = await cache.get(key);

    expect(result).toEqual(value);
  });

  test("should return undefined for non-existent key", async () => {
    const result = await cache.get("non-existent");
    expect(result).toBeUndefined();
  });

  test("should delete a key", async () => {
    const key = "delete-test";
    const value = "test-value";

    await cache.set(key, value);
    const deleteResult = await cache.delete(key);
    const getResult = await cache.get(key);

    expect(deleteResult).toBe(true);
    expect(getResult).toBeUndefined();
  });

  test("should list all keys", async () => {
    const testData = {
      key1: "value1",
      key2: "value2",
      key3: "value3",
    };

    // Set multiple keys
    for (const [key, value] of Object.entries(testData)) {
      await cache.set(key, value);
    }

    // Collect all keys into an array
    const keys: string[] = [];
    for await (const key of cache.keys()) {
      keys.push(key);
    }

    expect(keys.sort()).toEqual(Object.keys(testData).sort());
  });
});
