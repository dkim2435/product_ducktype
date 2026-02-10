import { useState } from 'react';

interface HelpBadgeProps {
  tooltip: string;
}

export function HelpBadge({ tooltip }: HelpBadgeProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
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
        color: 'var(--sub-color)',
        cursor: 'help',
        opacity: 0.6,
        flexShrink: 0,
      }}
    >
      ?
      {show && (
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
        }}>
          {tooltip}
        </span>
      )}
    </span>
  );
}
