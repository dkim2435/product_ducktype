import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';

interface TypingInfoProps {
  hidden?: boolean;
  onNavigate?: (page: string) => void;
}

export function TypingInfo({ hidden, onNavigate }: TypingInfoProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.intersectionRatio > 0.3),
      { threshold: [0, 0.3] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showMask = !hidden && !isInView;

  return (
    <section
      ref={sectionRef}
      className="w-full flex flex-col items-center overflow-hidden transition-[opacity,max-height,padding] duration-[400ms] ease-in-out"
      style={{
        padding: hidden ? 0 : (isMobile ? '0 16px 40px' : '0 24px 48px'),
        opacity: hidden ? 0 : 1,
        maxHeight: hidden ? 0 : '9999px',
        pointerEvents: hidden ? 'none' : 'auto',
        maskImage: showMask ? 'linear-gradient(to bottom, transparent 0%, black 20%)' : 'none',
        WebkitMaskImage: showMask ? 'linear-gradient(to bottom, transparent 0%, black 20%)' : 'none',
      }}
    >
      <div className="w-full max-w-[700px] text-center">
      {/* Adventure promo */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('adventure')}
          className="flex items-center gap-4 w-full mb-5 bg-sub-alt border-[1.5px] border-main rounded-default cursor-pointer text-left transition-[filter] duration-150 hover:brightness-[1.15]"
          style={{
            padding: isMobile ? '16px' : '16px 24px',
          }}
        >
          <span className="text-[28px] shrink-0">🐤⚔️🐺</span>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-text">
              Adventure Mode
            </div>
            <div className="text-xs text-sub mt-0.5">
              Type to fight monsters and explore worlds!
            </div>
          </div>
          <span className="text-[13px] text-main font-semibold shrink-0 whitespace-nowrap">
            Play Now →
          </span>
        </button>
      )}

      {/* Feature highlights */}
      <div
        className="gap-4 mb-8"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        }}
      >
        <FeatureCard
          icon="⚡"
          title={t('info.speedTitle')}
          desc={t('info.speedDesc')}
        />
        <FeatureCard
          icon="📊"
          title={t('info.trackTitle')}
          desc={t('info.trackDesc')}
        />
        <FeatureCard
          icon="🌍"
          title={t('info.langTitle')}
          desc={t('info.langDesc')}
        />
      </div>

      {/* Typing tips section */}
      <div
        className="bg-sub-alt rounded-default mb-6 text-left"
        style={{ padding: isMobile ? '20px 16px' : '24px 28px' }}
      >
        <h2 className="text-base font-semibold text-main mb-4 text-center">
          {t('info.tipsTitle')}
        </h2>
        <div
          className="gap-3"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          }}
        >
          <TipItem text={t('info.tip1')} />
          <TipItem text={t('info.tip2')} />
          <TipItem text={t('info.tip3')} />
          <TipItem text={t('info.tip4')} />
        </div>
      </div>

      {/* WPM benchmarks */}
      <div
        className="bg-sub-alt rounded-default mb-6 text-left"
        style={{ padding: isMobile ? '20px 16px' : '24px 28px' }}
      >
        <h2 className="text-base font-semibold text-main mb-4 text-center">
          {t('info.benchmarkTitle')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
        }}>
          {[
            { label: t('info.beginner'), wpm: '< 30' },
            { label: t('info.average'), wpm: '40–50' },
            { label: t('info.aboveAvg'), wpm: '60–75' },
            { label: t('info.fast'), wpm: '80–100' },
            { label: t('info.pro'), wpm: '100–130' },
            { label: t('info.expert'), wpm: '130+' },
          ].map(({ label, wpm }) => (
            <div key={label} className="flex justify-between rounded-[6px] bg-bg text-[13px]" style={{ padding: '8px 12px' }}>
              <span className="text-sub">{label}</span>
              <span className="text-main font-semibold">{wpm}</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-sub mt-3 leading-[1.6]">
          {t('info.benchmarkNote')}
        </p>
      </div>

      {/* How WPM is calculated */}
      <div
        className="bg-sub-alt rounded-default text-left"
        style={{ padding: isMobile ? '20px 16px' : '24px 28px' }}
      >
        <h2 className="text-base font-semibold text-main mb-3 text-center">
          {t('info.howWpmTitle')}
        </h2>
        <p className="text-[13px] text-sub leading-[1.7] mb-3">
          {t('info.howWpmDesc')}
        </p>
        <div className="bg-bg rounded-[6px] font-mono text-[13px] text-main" style={{ padding: '10px 16px' }}>
          WPM = (correct characters / 5) / (time in minutes)
        </div>
      </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="p-5 bg-sub-alt rounded-default text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-semibold text-text mb-1.5">
        {title}
      </div>
      <div className="text-xs text-sub leading-normal">
        {desc}
      </div>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex gap-2 items-start text-[13px] text-sub leading-[1.6]">
      <span className="text-main shrink-0 mt-0.5">•</span>
      <span>{text}</span>
    </div>
  );
}
