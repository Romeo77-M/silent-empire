// services/cacheService.ts

interface CacheItem<T> {
  expiry: number;
  data: T;
}

/**
 * Stores a value in sessionStorage with a Time To Live (TTL).
 * @param key The key to store the value under.
 * @param value The value to store.
 * @param ttlInMinutes The time to live in minutes.
 */
export function set<T>(key: string, value: T, ttlInMinutes: number): void {
  const now = new Date();
  const expiry = now.getTime() + ttlInMinutes * 60 * 1000;
  
  const item: CacheItem<T> = {
    data: value,
    expiry: expiry,
  };

  try {
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error("Error setting item in sessionStorage:", error);
  }
}

/**
 * Retrieves a value from sessionStorage if it exists and has not expired.
 * @param key The key of the item to retrieve.
 * @returns The stored data or null if not found or expired.
 */
export function get<T>(key: string): T | null {
  try {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      sessionStorage.removeItem(key); // Clean up expired item
      return null;
    }

    return item.data;
  } catch (error) {
    console.error("Error getting item from sessionStorage:", error);
    return null;
  }
}

/**
 * Removes an item from sessionStorage.
 * @param key The key of the item to remove.
 */
export function remove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing item from sessionStorage:", error);
  }
}
