interface NotFoundProps {
  onBack: () => void;
}

export function NotFound({ onBack }: NotFoundProps) {
  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🦆</div>
      <h1 style={{
        color: 'var(--main-color)',
        fontSize: '48px',
        fontWeight: 700,
        marginBottom: '8px',
      }}>
        404
      </h1>
      <p style={{
        color: 'var(--sub-color)',
        fontSize: '16px',
        marginBottom: '32px',
        lineHeight: 1.6,
      }}>
        This page doesn't exist. The duck couldn't find it either.
      </p>
      <button
        onClick={onBack}
        style={{
          padding: '12px 32px',
          backgroundColor: 'var(--main-color)',
          color: 'var(--bg-color)',
          border: 'none',
          borderRadius: 'var(--border-radius)',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Go Home
      </button>
    </div>
  );
}
