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
      className="relative inline-flex items-center justify-center w-[14px] h-[14px] rounded-full border border-sub text-[9px] font-semibold text-sub cursor-help opacity-60 shrink-0"
    >
      ?
      {show && (
        <span className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 px-[10px] py-1.5 bg-text text-bg text-[11px] font-normal rounded-[6px] whitespace-nowrap z-10 pointer-events-none">
          {tooltip}
        </span>
      )}
    </span>
  );
}
