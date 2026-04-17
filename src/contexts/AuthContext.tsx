import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useCloudSync } from '../hooks/useCloudSync';
import { clearProgressData } from '../utils/storage';
import { AuthModal } from '../components/auth/AuthModal';
import { WhatsNewModal } from '../components/layout/WhatsNewModal';

interface AuthContextValue {
  user: User | null;
  currentUsername: string | null;
  isSupabaseConfigured: boolean;
  requestSync: (userId: string) => void;
  openLogin: () => void;
  handleLogout: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
  onSyncReload: () => void;
}

export function AuthProvider({ children, onSyncReload }: AuthProviderProps) {
  const {
    user, loading, signUp, signIn, signInWithGoogle,
    signOut, updateUsername, checkUsernameAvailable, isSupabaseConfigured,
  } = useAuth();
  const { loadFromCloud, requestSync, cancelSync } = useCloudSync();
  const [showAuth, setShowAuth] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);

  // When user changes (login/logout), load cloud data
  useEffect(() => {
    if (loading) return;
    const userId = user?.id ?? null;

    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (!userId) {
      cancelSync();
      return;
    }

    loadFromCloud(userId).then((shouldReload) => {
      if (shouldReload) onSyncReload();
    });
  }, [user, loading, loadFromCloud, cancelSync, onSyncReload]);

  // Show "What's New" modal if user hasn't seen this version
  useEffect(() => {
    const seen = localStorage.getItem('ducktype_whats_new_seen');
    if (seen === __APP_VERSION__) return;
    const isFirstVisit = !localStorage.getItem('ducktype_onboarding_seen');
    if (isFirstVisit) return;
    const timer = setTimeout(() => setShowWhatsNew(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsNewClose = useCallback(() => {
    setShowWhatsNew(false);
    localStorage.setItem('ducktype_whats_new_seen', __APP_VERSION__);
  }, []);

  const handleLogout = useCallback(async () => {
    cancelSync();
    await signOut();
    clearProgressData();
    onSyncReload();
  }, [signOut, cancelSync, onSyncReload]);

  const currentUsername = user
    ? (user.user_metadata?.display_name as string) || user.email?.split('@')[0] || null
    : null;

  const openLogin = useCallback(() => setShowAuth(true), []);

  if (loading) return null;

  const value: AuthContextValue = {
    user,
    currentUsername,
    isSupabaseConfigured,
    requestSync,
    openLogin,
    handleLogout,
    updateUsername,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        onSignUp={signUp}
        onSignIn={signIn}
        onGoogleSignIn={signInWithGoogle}
        onCheckUsername={checkUsernameAvailable}
      />
      <WhatsNewModal
        visible={showWhatsNew}
        onClose={handleWhatsNewClose}
      />
    </AuthContext.Provider>
  );
}
