import { useState } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  large?: boolean;
  color?: string;
  tooltip?: string;
}

export function StatCard({ label, value, unit, large, color, tooltip }: StatCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{
        fontSize: '12px',
        color: 'var(--sub-color)',
        marginBottom: '4px',
        textTransform: 'lowercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        {label}
        {tooltip && (
          <span
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '1px solid var(--sub-color)',
              fontSize: '9px',
              fontWeight: 600,
              cursor: 'help',
              opacity: 0.6,
              flexShrink: 0,
            }}
          >
            ?
            {showTooltip && (
              <span style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '6px 10px',
                backgroundColor: 'var(--text-color)',
                color: 'var(--bg-color)',
                fontSize: '11px',
                fontWeight: 400,
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                zIndex: 10,
                pointerEvents: 'none',
                textTransform: 'none',
              }}>
                {tooltip}
              </span>
            )}
          </span>
        )}
      </div>
      <div style={{
        fontSize: large ? 'var(--stat-value-large)' : 'var(--stat-value-normal)',
        fontWeight: 300,
        color: color || 'var(--main-color)',
        lineHeight: 1.1,
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: '16px', marginLeft: '4px', color: 'var(--sub-color)' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
