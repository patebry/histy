export function clampIndex(index: number, maxIndex: number): number {
  return Math.min(Math.max(0, index), Math.max(0, maxIndex));
}
