/**
 * Get an item from localStorage
 * @param key - The key of the item to retrieve
 * @returns The parsed value or null if the item doesn't exist or cannot be parsed
 */
export function getFromLocalStorage<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    try {
        return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return null;
    }
}

/**
 * Set an item in localStorage
 * @param key - The key of the item to set
 * @param value - The value to store
 */
export function setToLocalStorage<T>(key: string, value: T): void {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
}

/**
 * Remove an item from localStorage
 * @param key - The key of the item to remove
 */
export function removeFromLocalStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
    }
}

/**
 * Clear all items from localStorage
 */
export function clearLocalStorage(): void {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}
