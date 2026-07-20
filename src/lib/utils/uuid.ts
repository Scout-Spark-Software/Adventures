const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validates that a string is a well-formed UUID before it's used in an eq()
// lookup against a uuid column — an invalid string there causes Postgres to
// throw an uncaught cast error (500) instead of a clean 400.
export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}
