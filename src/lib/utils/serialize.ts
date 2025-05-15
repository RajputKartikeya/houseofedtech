/**
 * Safely serializes MongoDB documents to prevent
 * "Only plain objects can be passed to Client Components from Server Components" errors
 *
 * @param data Any object or array to be serialized
 * @returns A safe version of the object with ObjectIds converted to strings
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  // Handle objects
  if (typeof data === "object") {
    // Check if it's a MongoDB document (has _id with toString method)
    if (
      data &&
      "_id" in data &&
      typeof (data as Record<string, { toString(): string }>)._id?.toString ===
        "function"
    ) {
      return {
        ...serializeData({ ...(data as object) }),
        _id: (data as Record<string, { toString(): string }>)._id.toString(),
        id: (data as Record<string, { toString(): string }>)._id.toString(),
      } as T;
    }

    // Regular object - process all properties
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // Handle ObjectId fields
      if (
        value &&
        typeof value === "object" &&
        "toString" in value &&
        typeof value.toString === "function" &&
        "_bsontype" in value
      ) {
        result[key] = value.toString();
      }
      // Handle Date objects
      else if (value instanceof Date) {
        result[key] = value;
      }
      // Recursively serialize nested objects
      else if (value && typeof value === "object") {
        result[key] = serializeData(value);
      }
      // Handle primitive values
      else {
        result[key] = value;
      }
    }

    return result as T;
  }

  // Handle primitive values (string, number, boolean)
  return data;
}
