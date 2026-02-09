import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestResult } from '../../types/stats';
import { copyResultImage, downloadResultImage } from '../../utils/share';

interface ShareButtonProps {
  result: TestResult;
}

export function ShareButton({ result }: ShareButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyResultImage(result);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadResultImage(result);
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={handleCopy}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          backgroundColor: 'var(--sub-alt-color)',
          color: copied ? 'var(--main-color)' : 'var(--sub-color)',
          borderRadius: 'var(--border-radius)',
          transition: 'color 0.15s',
        }}
      >
        {copied ? t('results.copied') : t('results.copyImage')}
      </button>
      <button
        onClick={handleDownload}
        style={{
          padding: '8px 16px',
          fontSize: '13px',
          backgroundColor: 'var(--sub-alt-color)',
          color: 'var(--sub-color)',
          borderRadius: 'var(--border-radius)',
        }}
      >
        {t('results.download')}
      </button>
    </div>
  );
}
