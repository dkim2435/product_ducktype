import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { KeyStatsMap } from '../../types/gamification';

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
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const hasData = Object.keys(keyStats).length > 0;

  if (!hasData) {
    return (
      <div style={{
        textAlign: 'center',
        color: 'var(--sub-color)',
        fontSize: '13px',
        padding: '40px 0',
      }}>
        {t('profile.noKeyData')}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        alignItems: 'center',
      }}>
        {ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: 'flex',
              gap: '4px',
              paddingLeft: `${ROW_OFFSETS[rowIdx]}px`,
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
                  style={{
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    backgroundColor: bgColor,
                    color: hasKeyData ? 'var(--bg-color)' : 'var(--sub-color)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'transform 0.1s',
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
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-color)',
          border: '1px solid var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          fontSize: '12px',
          color: 'var(--text-color)',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}>
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
