/**
 * Calculate consistency as 100 - CV (coefficient of variation) of WPM samples
 * Higher = more consistent
 */
export function calculateConsistency(wpmSamples: number[]): number {
  if (wpmSamples.length < 2) return 100;

  const values = wpmSamples.filter(v => v > 0);
  if (values.length < 2) return 100;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 100;

  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / mean) * 100;

  return Math.max(0, Math.round((100 - cv) * 100) / 100);
}
