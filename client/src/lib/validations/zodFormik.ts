import type { ZodSchema } from "zod";

function setNestedError(
  target: Record<string, unknown>,
  path: string[],
  message: string,
) {
  let current: Record<string, unknown> = target;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKeyIsIndex = /^\d+$/.test(path[i + 1]);
    if (current[key] === undefined) {
      current[key] = nextKeyIsIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = path[path.length - 1];
  // Keep the first error at a given path; don't let a later issue overwrite it.
  if (current[lastKey] === undefined) {
    current[lastKey] = message;
  }
}

/**
 * Adapts a Zod schema into a Formik-compatible `validate` function.
 * Builds a genuinely nested error object (not a flat "items.0.productId"
 * map) so Formik can resolve errors correctly for array/object fields.
 */
export function zodToFormikValidate<T>(schema: ZodSchema<T>) {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      if (issue.path.length === 0) continue;
      setNestedError(errors, issue.path.map(String), issue.message);
    }
    return errors;
  };
}
