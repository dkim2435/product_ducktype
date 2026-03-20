import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PlayerProfile, StreakState, ToastNotification } from '../types/gamification';
import type { Settings } from '../types/settings';
import { useAuthContext } from '../contexts/AuthContext';
import { Header } from './layout/Header';
import { Footer } from './layout/Footer';
import { ToastContainer } from './layout/ToastContainer';
import { SettingsModal } from './settings/SettingsModal';
import { OnboardingModal } from './layout/OnboardingModal';

interface AppLayoutProps {
  children: ReactNode;
  profile: PlayerProfile;
  streak: StreakState;
  isTypingActive: boolean;
  onNavigate: (page: string) => void;
  settings: Settings;
  onSettingChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  playerLevel: number;
  toasts: ToastNotification[];
  onDismissToast: (id: string) => void;
  isCenteredPage: boolean;
  onLoginClick: () => void;
}

export function AppLayout({
  children,
  profile,
  streak,
  isTypingActive,
  onNavigate,
  settings,
  onSettingChange,
  playerLevel,
  toasts,
  onDismissToast,
  isCenteredPage,
  onLoginClick,
}: AppLayoutProps) {
  const { user, handleLogout, isSupabaseConfigured } = useAuthContext();
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-show onboarding for first-time non-logged-in visitors
  useEffect(() => {
    if (user) return;
    if (localStorage.getItem('ducktype_onboarding_seen')) return;
    const timer = setTimeout(() => {
      if (!isTypingActive) setShowOnboarding(true);
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingsClick = useCallback(() => {
    if (!user && !localStorage.getItem('ducktype_onboarding_seen')) {
      setShowOnboarding(true);
    } else {
      setShowSettings(true);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden">
      <Header
        onSettingsClick={handleSettingsClick}
        onNavigate={onNavigate}
        profile={profile}
        streak={streak}
        hidden={isTypingActive}
        user={user}
        onLoginClick={onLoginClick}
        onLogout={handleLogout}
        isSupabaseConfigured={isSupabaseConfigured}
      />

      <main
        className={`flex-1 flex flex-col items-center ${isCenteredPage ? 'justify-center' : 'justify-start'}`}
        style={{ padding: '0 var(--page-padding)' }}
      >
        {children}
      </main>

      <Footer onNavigate={onNavigate} hidden={isTypingActive} />

      <SettingsModal
        settings={settings}
        onSettingChange={onSettingChange}
        onClose={() => setShowSettings(false)}
        visible={showSettings}
        playerLevel={playerLevel}
        userId={user?.id}
      />

      <OnboardingModal
        visible={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('ducktype_onboarding_seen', '1');
          localStorage.setItem('ducktype_whats_new_seen', __APP_VERSION__);
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
    </div>
  );
}
