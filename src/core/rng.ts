/** Small, explicit serializable streams. Cosmetic code never imports these. */
export function hash(text: string): number {
  let h = 2166136261;
  for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0 || 1;
}
export function random(stream: { [key: string]: number }, key: string): number {
  let x = stream[key] || 1;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  stream[key] = x >>> 0;
  return (x >>> 0) / 4294967296;
}
export function shuffle<T>(values: readonly T[], stream: { [key: string]: number }, key: string): T[] {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(stream, key) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function weighted<T>(values: T[], weight: (v: T) => number, stream: { [key: string]: number }, key: string): T {
  if (!values.length) throw new Error('Cannot choose from an empty pool');
  const weights = values.map(weight);
  let draw = random(stream, key) * weights.reduce((a,b) => a+b, 0);
  for (let i=0;i<values.length;i++) { draw -= weights[i]; if (draw < 0) return values[i]; }
  return values[values.length-1];
}
