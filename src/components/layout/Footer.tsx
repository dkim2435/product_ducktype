import { useIsMobile } from '../../hooks/useIsMobile';

interface FooterProps {
  onNavigate: (page: string) => void;
  hidden?: boolean;
}

export function Footer({ onNavigate, hidden }: FooterProps) {
  const isMobile = useIsMobile();
  const mobileHidden = isMobile && hidden;

  const linkClass = `text-sub cursor-pointer text-xs transition-colors duration-150${
    isMobile ? ' min-h-[44px] py-2 px-1 inline-flex items-center' : ''
  }`;

  return (
    <footer
      className="flex justify-center items-center shrink-0 flex-wrap"
      style={{
        gap: 'var(--footer-gap)',
        padding: mobileHidden ? '0 12px' : 'var(--header-padding)',
        maxHeight: mobileHidden ? 0 : '200px',
        overflow: mobileHidden ? 'hidden' : undefined,
        opacity: mobileHidden ? 0 : 1,
        transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
      }}
    >
      <button className={linkClass} onClick={() => onNavigate('about')}>about</button>
      <span className="text-sub-alt text-xs">|</span>
      <button className={linkClass} onClick={() => onNavigate('contact')}>contact</button>
      <span className="text-sub-alt text-xs">|</span>
      <button className={linkClass} onClick={() => onNavigate('privacy')}>privacy policy</button>
      <span className="text-sub-alt text-xs">|</span>
      <button className={linkClass} onClick={() => onNavigate('terms')}>terms of service</button>
      <span className="text-sub-alt text-xs">|</span>
      <a href="/blog" className={linkClass}>blog</a>
    </footer>
  );
}
