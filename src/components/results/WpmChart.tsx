import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { WpmSample } from '../../types/test';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface WpmChartProps {
  wpmHistory: WpmSample[];
  rawWpmHistory: WpmSample[];
  errorHistory: WpmSample[];
}

export function WpmChart({ wpmHistory, rawWpmHistory, errorHistory }: WpmChartProps) {
  const mainColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--main-color').trim() || '#e2b714';
  const subColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sub-color').trim() || '#646669';
  const errorColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--error-color').trim() || '#ca4754';
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-color').trim() || '#323437';

  const labels = wpmHistory.map(s => `${s.time}s`);

  const data = {
    labels,
    datasets: [
      {
        label: 'WPM',
        data: wpmHistory.map(s => s.value),
        borderColor: mainColor,
        backgroundColor: mainColor + '20',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Raw WPM',
        data: rawWpmHistory.map(s => s.value),
        borderColor: subColor,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1,
        borderDash: [5, 5],
      },
      {
        label: 'Errors',
        data: errorHistory.map(s => s.value),
        borderColor: errorColor,
        backgroundColor: errorColor + '40',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: subColor,
          font: { family: 'Roboto Mono, monospace', size: 11 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: bgColor + 'ee',
        titleColor: subColor,
        bodyColor: subColor,
        borderColor: subColor + '40',
        borderWidth: 1,
        titleFont: { family: 'Roboto Mono, monospace' },
        bodyFont: { family: 'Roboto Mono, monospace' },
      },
    },
    scales: {
      x: {
        ticks: { color: subColor, font: { size: 10 } },
        grid: { color: subColor + '15' },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: { color: subColor, font: { size: 10 } },
        grid: { color: subColor + '15' },
        title: {
          display: true,
          text: 'WPM',
          color: subColor,
          font: { size: 11 },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: { color: errorColor + '80', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: 'Errors',
          color: errorColor + '80',
          font: { size: 11 },
        },
      },
    },
  };

  if (wpmHistory.length < 2) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'var(--sub-color)',
      }}>
        Not enough data for chart
      </div>
    );
  }

  return (
    <div style={{ height: '200px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
