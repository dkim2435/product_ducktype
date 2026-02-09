/**
 * Calculate WPM (Words Per Minute)
 * Standard: 1 word = 5 characters
 * WPM = (correct characters / 5) / (elapsed seconds / 60)
 */
export function calculateWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

/**
 * Calculate raw WPM (includes incorrect characters)
 */
export function calculateRawWpm(totalChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((totalChars / 5) / (elapsedSeconds / 60));
}

/**
 * Calculate CPM (Characters Per Minute) - useful for CJK
 */
export function calculateCpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round(correctChars / (elapsedSeconds / 60));
}
