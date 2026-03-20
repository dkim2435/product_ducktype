import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KeyStatsMap } from '../../types/gamification';
import { useIsMobile } from '../../hooks/useIsMobile';

interface KeyboardHeatmapProps {
  keyStats: KeyStatsMap;
}

// Standard QWERTY layout
const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
];

const ROW_OFFSETS = [0, 20, 40]; // px offset for each row

function getHeatColor(errorRate: number): string {
  if (errorRate === 0) return 'var(--main-color)';
  if (errorRate < 0.05) return '#4caf50';
  if (errorRate < 0.1) return '#8bc34a';
  if (errorRate < 0.15) return '#cddc39';
  if (errorRate < 0.2) return '#ffeb3b';
  if (errorRate < 0.3) return '#ff9800';
  if (errorRate < 0.4) return '#ff5722';
  return '#f44336';
}

export function KeyboardHeatmap({ keyStats }: KeyboardHeatmapProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const keySize = isMobile ? 28 : 38;
  const keyGap = isMobile ? 3 : 4;
  const rowOffsets = isMobile ? [0, 14, 28] : ROW_OFFSETS;

  const hasData = Object.keys(keyStats).length > 0;

  if (!hasData) {
    return (
      <div className="text-center text-sub text-[13px] py-10">
        {t('profile.noKeyData')}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col items-center" style={{ gap: `${keyGap}px` }}>
        {ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex"
            style={{
              gap: `${keyGap}px`,
              paddingLeft: `${rowOffsets[rowIdx]}px`,
            }}
          >
            {row.map(key => {
              const stat = keyStats[key];
              const errorRate = stat?.errorRate || 0;
              const hasKeyData = stat && stat.totalAttempts > 0;
              const bgColor = hasKeyData
                ? getHeatColor(errorRate)
                : 'var(--sub-alt-color)';

              return (
                <div
                  key={key}
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className="flex items-center justify-center rounded-[6px] text-[13px] font-semibold cursor-default transition-transform duration-100"
                  style={{
                    width: `${keySize}px`,
                    height: `${keySize}px`,
                    backgroundColor: bgColor,
                    color: hasKeyData ? 'var(--bg-color)' : 'var(--sub-color)',
                    transform: hoveredKey === key ? 'scale(1.15)' : 'scale(1)',
                    opacity: hasKeyData ? 1 : 0.4,
                  }}
                >
                  {key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredKey && keyStats[hoveredKey] && (
        <div className="absolute -top-[50px] left-1/2 -translate-x-1/2 px-3 py-2 bg-bg border border-sub-alt rounded-default text-xs text-text whitespace-nowrap z-10" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <strong>{hoveredKey.toUpperCase()}</strong>
          {' - '}
          {t('stats.accuracy')}: {((1 - keyStats[hoveredKey].errorRate) * 100).toFixed(1)}%
          {' | '}
          {keyStats[hoveredKey].totalAttempts} attempts
        </div>
      )}
    </div>
  );
}
