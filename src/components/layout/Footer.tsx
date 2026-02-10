interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
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
      gap: '16px',
      padding: '16px 32px',
      flexShrink: 0,
      flexWrap: 'wrap',
    }}>
      <button style={linkStyle} onClick={() => onNavigate('about')}>about</button>
      <span style={sepStyle}>|</span>
      <button style={linkStyle} onClick={() => onNavigate('contact')}>contact</button>
      <span style={sepStyle}>|</span>
      <button style={linkStyle} onClick={() => onNavigate('privacy')}>privacy policy</button>
      <span style={sepStyle}>|</span>
      <button style={linkStyle} onClick={() => onNavigate('terms')}>terms of service</button>
    </footer>
  );
}
