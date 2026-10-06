export function logError(scope: string, error: unknown) {
  console.error(`[${scope}]`, error);
}

export function isDuplicateError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { message?: string; code?: string; details?: string };
  const text = `${record.message ?? ""} ${record.details ?? ""}`;
  return record.code === "23505" || text.includes("duplicate_mobile") || text.includes("customers_mobile_unique");
}

export function saveErrorMessage(error: unknown) {
  logError("save-shop", error);
  if (isDuplicateError(error)) return "duplicate";
  const text = error instanceof Error ? error.message.toLowerCase() : "";
  if (text.includes("photo") || text.includes("storage") || text.includes("upload")) {
    return "Photo upload failed. Please try again.";
  }
  return "Could not save this shop. Your information has not been confirmed as saved. Please try again.";
}
