export function parseLimit(
  raw: string | null,
  defaultVal = 50,
  max = 100,
): number {
  const parsed = parseInt(raw || String(defaultVal));
  return Math.max(1, Math.min(isNaN(parsed) ? defaultVal : parsed, max));
}

export function parseOffset(raw: string | null): number {
  const parsed = parseInt(raw || "0");
  return Math.max(0, isNaN(parsed) ? 0 : parsed);
}
