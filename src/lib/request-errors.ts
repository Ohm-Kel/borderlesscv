type FieldErrorMap = Record<string, string[] | undefined>;

function flattenFieldErrors(fieldErrors: FieldErrorMap) {
  const messages = Object.values(fieldErrors)
    .flatMap((value) => value ?? [])
    .filter(Boolean);

  return messages[0];
}

export function getErrorDescription(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if ("error" in payload) {
    const error = (payload as { error?: unknown }).error;

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object") {
      const fieldMessage = flattenFieldErrors(error as FieldErrorMap);

      if (fieldMessage) {
        return fieldMessage;
      }
    }
  }

  return fallback;
}

