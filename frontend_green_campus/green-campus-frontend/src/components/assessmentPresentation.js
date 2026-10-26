export function greenIndexNote(data) {
  const details = data.green_index_details;
  if (details?.assessment === "partial") {
    const missing = details.unavailable_resources?.join(", ");
    return `Partial score${missing ? `: ${missing} unavailable` : ""}. Missing resource weights are excluded; assessed weights are normalized. Not directly comparable to complete scores.`;
  }
  if (details?.assessment === "unavailable") {
    return "Green Index unavailable: no resources could be assessed.";
  }
  return null;
}
