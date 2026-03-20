import type { TestResult } from '../types/stats';
import { getWpmPercentile } from './percentile';

export async function generateResultImage(result: TestResult): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Get theme colors
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#1a1b2e';
  const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--main-color').trim() || '#ffb347';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#e8e2d6';
  const subColor = getComputedStyle(document.documentElement).getPropertyValue('--sub-color').trim() || '#6b6893';
  const subAltColor = getComputedStyle(document.documentElement).getPropertyValue('--sub-alt-color').trim() || '#141525';

  // 1. Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, bgColor);
  gradient.addColorStop(1, subAltColor);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(0, 0, 1200, 630, 24);
  ctx.fill();

  // 2. Header: DuckType branding
  ctx.fillStyle = mainColor;
  ctx.font = 'bold 36px "Roboto Mono", monospace';
  ctx.fillText('DuckType', 60, 70);
  ctx.font = '32px serif';
  ctx.fillText('\u{1F986}', 280, 70);

  // 3. WPM - huge display
  ctx.fillStyle = mainColor;
  ctx.font = 'bold 120px "Roboto Mono", monospace';
  ctx.fillText(String(result.wpm), 60, 230);
  ctx.fillStyle = subColor;
  ctx.font = '28px "Roboto Mono", monospace';
  ctx.fillText('wpm', 60, 270);

  // 4. Percentile badge
  const percentile = getWpmPercentile(result.wpm);
  const badgeText = `Top ${percentile}%`;
  ctx.font = 'bold 24px "Roboto Mono", monospace';
  const badgeWidth = ctx.measureText(badgeText).width + 32;
  ctx.fillStyle = mainColor + '20';
  ctx.beginPath();
  ctx.roundRect(60, 290, badgeWidth, 40, 20);
  ctx.fill();
  ctx.fillStyle = mainColor;
  ctx.fillText(badgeText, 76, 318);

  // 5. Stat cards row (accuracy, raw, consistency)
  const stats = [
    { label: 'accuracy', value: `${result.accuracy}%` },
    { label: 'raw', value: String(result.rawWpm) },
    { label: 'consistency', value: `${result.consistency}%` },
  ];

  stats.forEach((stat, i) => {
    const x = 60 + i * 200;
    const y = 370;
    // Card background
    ctx.fillStyle = subAltColor;
    ctx.beginPath();
    ctx.roundRect(x, y, 180, 90, 12);
    ctx.fill();
    // Value
    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px "Roboto Mono", monospace';
    ctx.fillText(stat.value, x + 16, y + 42);
    // Label
    ctx.fillStyle = subColor;
    ctx.font = '16px "Roboto Mono", monospace';
    ctx.fillText(stat.label, x + 16, y + 70);
  });

  // 6. Characters info
  ctx.fillStyle = subColor;
  ctx.font = '16px "Roboto Mono", monospace';
  ctx.fillText(`${result.correctChars}/${result.incorrectChars}/${result.extraChars}/${result.missedChars} chars`, 60, 510);

  // 7. Mini WPM chart (right side)
  if (result.wpmHistory && result.wpmHistory.length > 1) {
    const chartX = 700;
    const chartY = 120;
    const chartW = 440;
    const chartH = 200;

    // Chart background
    ctx.fillStyle = subAltColor + '80';
    ctx.beginPath();
    ctx.roundRect(chartX, chartY, chartW, chartH, 12);
    ctx.fill();

    const values = result.wpmHistory.map(h => h.value);
    const maxWpm = Math.max(...values, 1);
    const minWpm = Math.min(...values);
    const range = maxWpm - minWpm || 1;

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    values.forEach((val, i) => {
      const x = chartX + 20 + (i / (values.length - 1)) * (chartW - 40);
      const y = chartY + chartH - 20 - ((val - minWpm) / range) * (chartH - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill area under line
    const lastX = chartX + 20 + ((values.length - 1) / (values.length - 1)) * (chartW - 40);
    ctx.lineTo(lastX, chartY + chartH - 20);
    ctx.lineTo(chartX + 20, chartY + chartH - 20);
    ctx.closePath();
    ctx.fillStyle = mainColor + '15';
    ctx.fill();
  }

  // 8. Mode info (bottom right)
  ctx.fillStyle = subColor;
  ctx.font = '18px "Roboto Mono", monospace';
  const modeText = `${result.language} \u00B7 ${result.mode} ${result.modeValue}${result.mode === 'time' ? 's' : ''}`;
  ctx.textAlign = 'right';
  ctx.fillText(modeText, 1140, 560);

  // 9. Branding (bottom right)
  ctx.fillStyle = subColor;
  ctx.font = '16px "Roboto Mono", monospace';
  ctx.fillText('ducktype.xyz', 1140, 590);

  // Reset text alignment
  ctx.textAlign = 'left';

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
