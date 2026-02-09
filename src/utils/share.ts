import type { TestResult } from '../types/stats';

export async function generateResultImage(result: TestResult): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#1a1b2e';
  const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--main-color').trim() || '#ffb347';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#e8e2d6';
  const subColor = getComputedStyle(document.documentElement).getPropertyValue('--sub-color').trim() || '#6b6893';

  // Background
  ctx.fillStyle = bgColor;
  ctx.roundRect(0, 0, 800, 400, 16);
  ctx.fill();

  // Title
  ctx.fillStyle = mainColor;
  ctx.font = 'bold 32px "Roboto Mono", monospace';
  ctx.fillText('DuckType', 40, 55);

  // Duck emoji
  ctx.font = '28px serif';
  ctx.fillText('🦆', 220, 55);

  // WPM large
  ctx.fillStyle = mainColor;
  ctx.font = 'bold 72px "Roboto Mono", monospace';
  ctx.fillText(String(result.wpm), 40, 160);

  ctx.fillStyle = subColor;
  ctx.font = '20px "Roboto Mono", monospace';
  ctx.fillText('wpm', 40, 190);

  // Stats
  ctx.fillStyle = textColor;
  ctx.font = '24px "Roboto Mono", monospace';
  const stats = [
    `acc ${result.accuracy}%`,
    `raw ${result.rawWpm}`,
    `con ${result.consistency}%`,
  ];
  stats.forEach((stat, i) => {
    ctx.fillText(stat, 40 + i * 240, 260);
  });

  // Mode info
  ctx.fillStyle = subColor;
  ctx.font = '16px "Roboto Mono", monospace';
  const modeText = `${result.language} | ${result.mode} ${result.modeValue}`;
  ctx.fillText(modeText, 40, 320);

  // Chars
  ctx.fillText(
    `${result.correctChars}/${result.incorrectChars}/${result.extraChars}/${result.missedChars}`,
    40, 350
  );

  // Branding
  ctx.fillStyle = subColor;
  ctx.font = '14px "Roboto Mono", monospace';
  ctx.fillText('ducktype.io', 40, 380);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

export async function copyResultImage(result: TestResult): Promise<boolean> {
  const blob = await generateResultImage(result);
  if (!blob) return false;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export function downloadResultImage(result: TestResult): void {
  generateResultImage(result).then(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ducktype-${result.wpm}wpm.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
