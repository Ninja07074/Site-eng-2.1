'use client';

import { useState, useEffect } from 'react';
import { getSession, setSession, clearSession } from '@/lib/session';

export function useSession() {
  const [session, setSessionState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega a sessão na montagem do componente (client-side apenas)
    const loadSession = () => {
      setSessionState(getSession());
      setIsLoading(false);
    };

    loadSession();

    // Listener para o evento customizado disparado por setSession/clearSession
    const handleSessionChange = () => {
      setSessionState(getSession());
    };

    // Listener para mudanças no localStorage de outras abas
    const handleStorageChange = (e) => {
      if (e.key === 'ps_session_v1') {
        setSessionState(getSession());
      }
    };

    window.addEventListener('session-changed', handleSessionChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('session-changed', handleSessionChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = (userData) => {
    setSession(userData);
  };

  const logout = () => {
    clearSession();
  };

  return { session, login, logout, isLoading };
}
