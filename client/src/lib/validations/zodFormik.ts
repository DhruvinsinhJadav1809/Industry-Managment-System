import type { ZodSchema } from "zod";

/**
 * Adapts a Zod schema into a Formik-compatible `validate` function,
 * so we get Zod's schema definitions with Formik's form state handling.
 */
export function zodToFormikValidate<T>(schema: ZodSchema<T>) {
  return (values: T) => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    }
    return errors;
  };
}
