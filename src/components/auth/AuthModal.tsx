import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, username: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

type Tab = 'login' | 'signup';

export function AuthModal({ visible, onClose, onSignUp, onSignIn, onGoogleSignIn }: AuthModalProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setTab('login');
      setUsername('');
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
      // Focus email input after render
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [visible]);

  // ESC key to close
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'signup') {
      const trimmed = username.trim();
      if (trimmed.length < 3 || trimmed.length > 16) {
        setError(t('auth.errorUsernameLength'));
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        setError(t('auth.errorUsernameChars'));
        return;
      }
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(t('auth.errorInvalidEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errorPasswordShort'));
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        await onSignUp(email, password, username.trim());
      } else {
        await onSignIn(email, password);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.errorGeneric');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await onGoogleSignIn();
    } catch {
      setError(t('auth.errorGeneric'));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--sub-alt-color)',
    color: 'var(--text-color)',
    border: '1px solid transparent',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
    >
      <div
        className="slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-color)',
          borderRadius: '12px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '420px',
          border: '1px solid var(--sub-alt-color)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '4px',
            color: 'var(--sub-color)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {(['login', 'signup'] as Tab[]).map((t_) => (
            <button
              key={t_}
              onClick={() => { setTab(t_); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'inherit',
                backgroundColor: tab === t_ ? 'var(--main-color)' : 'var(--sub-alt-color)',
                color: tab === t_ ? 'var(--bg-color)' : 'var(--sub-color)',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              {t_ === 'login' ? t('auth.login') : t('auth.signup')}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--sub-alt-color)',
            background: 'none',
            color: 'var(--text-color)',
            fontSize: '14px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('auth.continueWithGoogle')}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '16px 0',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--sub-alt-color)' }} />
          <span style={{ color: 'var(--sub-color)', fontSize: '12px' }}>{t('auth.or')}</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--sub-alt-color)' }} />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tab === 'signup' && (
            <div>
              <input
                type="text"
                placeholder={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                maxLength={16}
                style={inputStyle}
              />
              <div style={{
                fontSize: '11px',
                color: 'var(--sub-color)',
                marginTop: '4px',
                paddingLeft: '2px',
              }}>
                {t('auth.usernameHint')}
              </div>
            </div>
          )}
          <input
            ref={emailRef}
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
            style={inputStyle}
          />

          {error && (
            <div style={{ color: '#e74c3c', fontSize: '13px' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--main-color)',
              color: 'var(--bg-color)',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? (tab === 'login' ? t('auth.loggingIn') : t('auth.signingUp'))
              : (tab === 'login' ? t('auth.login') : t('auth.signup'))
            }
          </button>
        </form>
      </div>
    </div>
  );
}
