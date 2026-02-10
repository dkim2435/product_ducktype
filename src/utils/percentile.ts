/**
 * Estimate WPM percentile using a normal distribution approximation.
 * Based on typical typing speed data:
 * - Mean: ~42 WPM
 * - Standard deviation: ~17 WPM
 * Returns a number 1-99 representing "top X%"
 */

function normalCDF(x: number): number {
  // Approximation of the cumulative distribution function
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.8212560 + t * 1.3302744))));
  return x > 0 ? 1 - p : p;
}

export function getWpmPercentile(wpm: number): number {
  const mean = 42;
  const sd = 17;
  const z = (wpm - mean) / sd;
  const percentile = normalCDF(z) * 100;

  // "Top X%" means (100 - percentile), clamped to 1-99
  const topPercent = Math.round(100 - percentile);
  return Math.max(1, Math.min(99, topPercent));
}
