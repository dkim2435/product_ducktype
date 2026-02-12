import { useIsMobile } from '../../hooks/useIsMobile';

interface FooterProps {
  onNavigate: (page: string) => void;
  hidden?: boolean;
}

export function Footer({ onNavigate, hidden }: FooterProps) {
  const isMobile = useIsMobile();
  const mobileHidden = isMobile && hidden;

  const linkStyle: React.CSSProperties = {
    color: 'var(--sub-color)',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'color 0.15s',
  };

  const sepStyle: React.CSSProperties = {
    color: 'var(--sub-alt-color)',
    fontSize: '12px',
  };

  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'var(--footer-gap)',
      padding: mobileHidden ? '0 12px' : 'var(--header-padding)',
      flexShrink: 0,
      flexWrap: 'wrap',
      maxHeight: mobileHidden ? 0 : '200px',
      overflow: mobileHidden ? 'hidden' : undefined,
      opacity: mobileHidden ? 0 : 1,
      transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
    }}>
      <button style={linkStyle} onClick={() => onNavigate('about')}>about</button>
      <span style={sepStyle}>|</span>
      <button style={linkStyle} onClick={() => onNavigate('contact')}>contact</button>
      <span style={sepStyle}>|</span>
      <button style={linkStyle} onClick={() => onNavigate('privacy')}>privacy policy</button>
      <span style={sepStyle}>|</span>
      <button style={linkStyle} onClick={() => onNavigate('terms')}>terms of service</button>
      <span style={sepStyle}>|</span>
      <a href="/blog" style={linkStyle}>blog</a>
    </footer>
  );
}
