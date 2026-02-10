import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';

interface TypingInfoProps {
  hidden?: boolean;
}

export function TypingInfo({ hidden }: TypingInfoProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '32px 0 24px' : '48px 0 32px',
        opacity: hidden ? 0 : 1,
        maxHeight: hidden ? 0 : '2000px',
        overflow: 'hidden',
        transition: 'opacity 0.3s ease, max-height 0.3s ease',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {/* Feature highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
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
      <div style={{
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        padding: isMobile ? '20px 16px' : '24px 28px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--main-color)',
          marginBottom: '16px',
        }}>
          {t('info.tipsTitle')}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '12px',
        }}>
          <TipItem text={t('info.tip1')} />
          <TipItem text={t('info.tip2')} />
          <TipItem text={t('info.tip3')} />
          <TipItem text={t('info.tip4')} />
        </div>
      </div>

      {/* WPM benchmarks */}
      <div style={{
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        padding: isMobile ? '20px 16px' : '24px 28px',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--main-color)',
          marginBottom: '16px',
        }}>
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
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-color)',
              borderRadius: '6px',
              fontSize: '13px',
            }}>
              <span style={{ color: 'var(--sub-color)' }}>{label}</span>
              <span style={{ color: 'var(--main-color)', fontWeight: 600 }}>{wpm}</span>
            </div>
          ))}
        </div>
        <p style={{
          fontSize: '13px',
          color: 'var(--sub-color)',
          marginTop: '12px',
          lineHeight: 1.6,
        }}>
          {t('info.benchmarkNote')}
        </p>
      </div>

      {/* How WPM is calculated */}
      <div style={{
        backgroundColor: 'var(--sub-alt-color)',
        borderRadius: 'var(--border-radius)',
        padding: isMobile ? '20px 16px' : '24px 28px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--main-color)',
          marginBottom: '12px',
        }}>
          {t('info.howWpmTitle')}
        </h2>
        <p style={{
          fontSize: '13px',
          color: 'var(--sub-color)',
          lineHeight: 1.7,
          marginBottom: '12px',
        }}>
          {t('info.howWpmDesc')}
        </p>
        <div style={{
          backgroundColor: 'var(--bg-color)',
          padding: '10px 16px',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '13px',
          color: 'var(--main-color)',
        }}>
          WPM = (correct characters / 5) / (time in minutes)
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--sub-alt-color)',
      borderRadius: 'var(--border-radius)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-color)',
        marginBottom: '6px',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--sub-color)',
        lineHeight: 1.5,
      }}>
        {desc}
      </div>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-start',
      fontSize: '13px',
      color: 'var(--sub-color)',
      lineHeight: 1.6,
    }}>
      <span style={{ color: 'var(--main-color)', flexShrink: 0, marginTop: '2px' }}>•</span>
      <span>{text}</span>
    </div>
  );
}
