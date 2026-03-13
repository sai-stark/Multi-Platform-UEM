/**
 * Recursively removes empty/null/undefined values from an object before sending as API payload.
 * - Strips keys with `undefined`, `null`, or `""` (empty string) values
 * - Recursively cleans nested objects
 * - Removes nested objects that become empty after cleaning
 * - Preserves `false`, `0`, and other falsy-but-meaningful values
 * - Preserves arrays (even empty ones)
 */
export function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
    if (obj === null || obj === undefined) return obj;

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        // Skip null, undefined, and empty strings
        if (value === null || value === undefined || value === '') {
            continue;
        }

        // Recursively clean nested plain objects (not arrays, not dates, etc.)
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            const cleaned = cleanPayload(value);
            // Only include if the cleaned object still has keys
            if (Object.keys(cleaned).length > 0) {
                result[key] = cleaned;
            }
            continue;
        }

        // Keep everything else (booleans, numbers, arrays, dates, non-empty strings)
        result[key] = value;
    }

    return result as Partial<T>;
}
