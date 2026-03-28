import mongoose from "mongoose";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export function toObjectId(value: unknown): mongoose.Types.ObjectId | undefined {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }

  if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  return undefined;
}

export function requireObjectId(
  value: unknown,
  label: string
): mongoose.Types.ObjectId {
  const objectId = toObjectId(value);
  if (!objectId) {
    throw new Error(`${label} is not a valid ObjectId`);
  }
  return objectId;
}

export function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (Array.isArray(base) && Array.isArray(patch)) {
    return [...patch] as T;
  }

  if (isRecord(base) && isRecord(patch)) {
    const result: UnknownRecord = { ...base };

    for (const [key, patchValue] of Object.entries(patch)) {
      if (patchValue === undefined) {
        continue;
      }

      const baseValue = result[key];

      if (Array.isArray(patchValue)) {
        result[key] = [...patchValue];
        continue;
      }

      if (isRecord(baseValue) && isRecord(patchValue)) {
        result[key] = deepMerge(baseValue, patchValue);
        continue;
      }

      result[key] = patchValue;
    }

    return result as T;
  }

  return patch as T;
}
