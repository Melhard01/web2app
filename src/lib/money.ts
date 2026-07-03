/** Format integer cents as a USD price string, e.g. 2999 → "$29.99". */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}
