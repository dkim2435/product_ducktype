import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestResult } from '../../types/stats';
import { useIsMobile } from '../../hooks/useIsMobile';
import { copyResultImage, downloadResultImage } from '../../utils/share';
import { getWpmPercentile } from '../../utils/percentile';

interface ShareButtonProps {
  result: TestResult;
  onShareClick?: () => void;
}

const SITE_URL = 'https://ducktype.xyz';

function getShareText(result: TestResult): string {
  const topPercent = getWpmPercentile(result.wpm);
  return `I just typed ${result.wpm} WPM (Top ${topPercent}%) with ${result.accuracy}% accuracy on DuckType! Think you can beat me?`;
}

function getShareUrl(result: TestResult): string {
  return `${SITE_URL}/#c=${result.wpm}-${result.accuracy}`;
}

export function ShareButton({ result, onShareClick }: ShareButtonProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const shareText = getShareText(result);
  const shareUrl = getShareUrl(result);
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyImage = async () => {
    const success = await copyResultImage(result);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadResultImage(result);
  };

  const handleCopyLink = async () => {
    const textWithLink = `${shareText}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(textWithLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DuckType - ${result.wpm} WPM`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    }
    setMenuOpen(false);
  };

  const handleX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      '_blank',
      'width=550,height=420'
    );
    onShareClick?.();
    setMenuOpen(false);
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      '_blank',
      'width=550,height=420'
    );
    onShareClick?.();
    setMenuOpen(false);
  };

  const handleKakao = async () => {
    // Try Kakao SDK first
    const w = window as typeof window & { Kakao?: { isInitialized: () => boolean; Share: { sendDefault: (params: Record<string, unknown>) => void } } };
    if (w.Kakao && w.Kakao.isInitialized()) {
      w.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `DuckType - ${result.wpm} WPM`,
          description: shareText,
          imageUrl: `${SITE_URL}/og-image.svg`,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          {
            title: 'Try DuckType',
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
        ],
      });
      onShareClick?.();
      setMenuOpen(false);
      return;
    }
    // Fallback: use native share sheet (shows KakaoTalk on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DuckType - ${result.wpm} WPM`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
      onShareClick?.();
      setMenuOpen(false);
      return;
    }
    // Last resort: copy link with feedback
    const textWithLink = `${shareText}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(textWithLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // ignore
    }
    onShareClick?.();
    setMenuOpen(false);
  };

  const handleReddit = () => {
    window.open(
      `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(`I typed ${result.wpm} WPM on DuckType!`)}`,
      '_blank'
    );
    onShareClick?.();
    setMenuOpen(false);
  };

  const handleLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=550,height=420'
    );
    onShareClick?.();
    setMenuOpen(false);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
    onShareClick?.();
    setMenuOpen(false);
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text-color)',
    textAlign: 'left',
    borderRadius: '6px',
    transition: 'background-color 0.1s',
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Share trigger button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          padding: '10px 24px',
          fontSize: '14px',
          color: 'var(--bg-color)',
          backgroundColor: 'var(--main-color)',
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
        }}
      >
        {/* Share icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" x2="12" y1="2" y2="15" />
        </svg>
        {t('results.share')}
      </button>

      {/* Backdrop overlay for mobile modal */}
      {menuOpen && isMobile && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
        />
      )}

      {/* Dropdown menu / mobile modal */}
      {menuOpen && (
        <div
          className="fade-in"
          style={isMobile ? {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100vw - 48px)',
            maxWidth: '320px',
            maxHeight: '80vh',
            overflowY: 'auto',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            padding: '6px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          } : {
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '8px',
            width: '240px',
            backgroundColor: 'var(--sub-alt-color)',
            borderRadius: 'var(--border-radius)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            padding: '6px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {/* SNS sharing */}
          <button onClick={handleX} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X (Twitter)
          </button>

          <button onClick={handleKakao} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.72 1.8 5.108 4.514 6.467-.145.52-.93 3.346-.964 3.559 0 0-.019.159.084.22.103.06.224.013.224.013.296-.04 3.427-2.242 3.965-2.625.7.1 1.42.152 2.177.152 5.523 0 10-3.463 10-7.786S17.523 3 12 3z"/></svg>
            KakaoTalk
          </button>

          <button onClick={handleWhatsApp} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>

          <button onClick={handleFacebook} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>

          <button onClick={handleReddit} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
            Reddit
          </button>

          <button onClick={handleLinkedIn} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </button>

          {/* Divider */}
          <div style={{
            height: '1px',
            backgroundColor: 'var(--sub-color)',
            opacity: 0.2,
            margin: '4px 0',
          }} />

          {/* Utility actions */}
          <button onClick={handleCopyLink} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {linkCopied ? t('results.copied') : t('results.copyLink')}
          </button>

          <button onClick={handleCopyImage} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            {copied ? t('results.copied') : t('results.copyImage')}
          </button>

          <button onClick={handleDownload} style={btnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            {t('results.download')}
          </button>

          {/* Web Share API (mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <>
              <div style={{
                height: '1px',
                backgroundColor: 'var(--sub-color)',
                opacity: 0.2,
                margin: '4px 0',
              }} />
              <button onClick={handleWebShare} style={btnStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                  <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                </svg>
                {t('results.moreOptions')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
