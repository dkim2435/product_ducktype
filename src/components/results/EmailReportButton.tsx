import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import type { TestResult } from '../../types/stats';
import type { XpGain, KeyStats } from '../../types/gamification';
import { getWpmPercentile } from '../../utils/percentile';

interface EmailReportButtonProps {
  result: TestResult;
  xpGain?: XpGain | null;
  weakKeys?: KeyStats[];
}

type SendState = 'idle' | 'sending' | 'sent' | 'error';

export function EmailReportButton({ result, xpGain, weakKeys }: EmailReportButtonProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<SendState>('idle');

  const handleSend = async () => {
    if (state === 'sending' || state === 'sent' || !supabase) return;

    setState('sending');
    try {
      const topPercent = getWpmPercentile(result.wpm);
      const { error } = await supabase.functions.invoke('send-report', {
        body: {
          result: {
            wpm: result.wpm,
            rawWpm: result.rawWpm,
            accuracy: result.accuracy,
            consistency: result.consistency,
            correctChars: result.correctChars,
            incorrectChars: result.incorrectChars,
            extraChars: result.extraChars,
            missedChars: result.missedChars,
            mode: result.mode,
            modeValue: result.modeValue,
            language: result.language,
          },
          xpGain: xpGain ?? null,
          weakKeys: weakKeys?.map(k => ({
            key: k.key,
            errors: k.errors,
            totalAttempts: k.totalAttempts,
            errorRate: k.errorRate,
          })) ?? [],
          topPercent,
        },
      });

      if (error) throw error;
      setState('sent');
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const label = {
    idle: t('results.emailReport'),
    sending: t('results.emailSending'),
    sent: t('results.emailSent'),
    error: t('results.emailError'),
  }[state];

  const icon = {
    idle: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    sending: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
    sent: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" x2="9" y1="9" y2="15" />
        <line x1="9" x2="15" y1="9" y2="15" />
      </svg>
    ),
  }[state];

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button
        onClick={handleSend}
        disabled={state === 'sending' || state === 'sent'}
        style={{
          padding: '10px 24px',
          fontSize: '14px',
          color: state === 'sent' ? 'var(--main-color)' : state === 'error' ? 'var(--error-color)' : 'var(--sub-color)',
          backgroundColor: 'var(--sub-alt-color)',
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: state === 'sending' || state === 'sent' ? 'default' : 'pointer',
          opacity: state === 'sending' ? 0.7 : 1,
          transition: 'color 0.2s, opacity 0.2s',
        }}
      >
        {icon}
        {label}
      </button>
    </>
  );
}
