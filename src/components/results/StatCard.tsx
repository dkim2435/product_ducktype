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
    <div className="text-left">
      <div className="text-xs text-sub mb-1 lowercase inline-flex items-center gap-1">
        {label}
        {tooltip && (
          <span
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative inline-flex items-center justify-center w-[14px] h-[14px] rounded-full border border-sub text-[9px] font-semibold cursor-help opacity-60 shrink-0"
          >
            ?
            {showTooltip && (
              <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-[10px] py-1.5 bg-text text-bg text-[11px] font-normal rounded-[6px] whitespace-nowrap z-10 pointer-events-none normal-case">
                {tooltip}
              </span>
            )}
          </span>
        )}
      </div>
      <div
        className="font-light leading-[1.1]"
        style={{
          fontSize: large ? 'var(--stat-value-large)' : 'var(--stat-value-normal)',
          color: color || 'var(--main-color)',
        }}
      >
        {value}
        {unit && (
          <span className="text-base ml-1 text-sub">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
