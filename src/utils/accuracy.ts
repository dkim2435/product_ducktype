/**
 * Calculate accuracy as percentage
 * accuracy = (correct keystrokes / total keystrokes) * 100
 */
export function calculateAccuracy(correctKeystrokes: number, totalKeystrokes: number): number {
  if (totalKeystrokes <= 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 10000) / 100;
}
