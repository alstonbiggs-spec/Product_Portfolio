/**
 * Map a value from one range to another, clamped to the output edges.
 * Supports multi-stop ranges: interp(p, [0, 0.5, 1], [0, 100, 0]).
 */
export function interp(value: number, input: number[], output: number[]): number {
  if (value <= input[0]) return output[0]
  const last = input.length - 1
  if (value >= input[last]) return output[last]
  for (let i = 0; i < last; i++) {
    const a = input[i]
    const b = input[i + 1]
    if (value >= a && value <= b) {
      const t = b === a ? 0 : (value - a) / (b - a)
      return output[i] + t * (output[i + 1] - output[i])
    }
  }
  return output[last]
}
