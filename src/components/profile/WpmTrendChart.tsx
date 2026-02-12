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
import { useTranslation } from 'react-i18next';
import type { TestResult } from '../../types/stats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

interface WpmTrendChartProps {
  history: TestResult[];
}

export function WpmTrendChart({ history }: WpmTrendChartProps) {
  const { t } = useTranslation();

  const mainColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--main-color').trim() || '#e2b714';
  const subColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--sub-color').trim() || '#646669';
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-color').trim() || '#323437';

  if (history.length < 2) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        color: 'var(--sub-color)',
        fontSize: '13px',
      }}>
        {t('profile.noTrendData')}
      </div>
    );
  }

  // Take last 50 tests, sorted oldest → newest
  const recent = history
    .slice(0, 50)
    .reverse();

  const labels = recent.map(r => {
    const d = new Date(r.timestamp);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'WPM',
        data: recent.map(r => r.wpm),
        borderColor: mainColor,
        backgroundColor: mainColor + '20',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Accuracy',
        data: recent.map(r => r.accuracy),
        borderColor: subColor,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1,
        borderDash: [5, 5],
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
        ticks: { color: subColor, font: { size: 10 }, maxRotation: 45 },
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
        min: 0,
        max: 100,
        ticks: { color: subColor + '80', font: { size: 10 } },
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: 'Accuracy %',
          color: subColor + '80',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div style={{ height: '220px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
