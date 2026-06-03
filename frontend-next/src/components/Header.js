'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useEffect, useState, useRef } from 'react';
import { apiBuscarUsuario, apiContarNotificacoesNaoLidas } from '@/lib/api';
import { setSession, getSession } from '@/lib/session';

export default function Header() {
  const { session, logout, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchedUserRef = useRef(null);

  // Dependências estáveis (primitivas) em vez do objeto session inteiro
  const userId = session?.userId;
  const sessionUserName = session?.userName;

  useEffect(() => {
    async function fetchUser() {
      if (userId && !sessionUserName && fetchedUserRef.current !== userId) {
        fetchedUserRef.current = userId;
        try {
          const user = await apiBuscarUsuario(userId);
          const name = user?.nome || 'Usuário';
          setUserName(name);
          // Lê a sessão fresca do storage para evitar sobrescrever dados
          const currentSession = getSession();
          if (currentSession && !currentSession.userName) {
            setSession({ ...currentSession, userName: name, tipoUsuario: user?.tipoUsuario || currentSession.tipoUsuario });
          }
        } catch (e) {
          logout();
          router.push('/login');
        }
      } else if (sessionUserName) {
        setUserName(sessionUserName);
      }
    }
    fetchUser();
  }, [userId, sessionUserName]);

  useEffect(() => {
    async function fetchNotificacoes() {
      if (userId) {
        try {
          const res = await apiContarNotificacoesNaoLidas(userId);
          if (res && typeof res.count === 'number') {
            setUnreadCount(res.count);
          }
        } catch (e) {}
      }
    }
    if (!isLoading && userId) {
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, 30000); // Polling cada 30s
      return () => clearInterval(interval);
    }
  }, [userId, isLoading]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="site-header">
      <div className="brand">
        <img src="/assets/logo do site.jpg" alt="Partilhando o Saber" className="logo" />
        <h1>Partilhando o <span>Saber</span></h1>
      </div>
      <nav>
        <Link href="/">Início</Link>
        <Link href="/cursos">Cursos</Link>
        
        {!isLoading && session && (
          <Link 
            href="/meus-cursos" 
            style={pathname === '/meus-cursos' ? { color: 'var(--primary)', fontWeight: 600 } : {}}
          >
            Meus Cursos
          </Link>
        )}

        {!isLoading && session?.tipoUsuario === 'INSTRUTOR' && (
          <Link href="/criar-curso">Criar Curso</Link>
        )}

        {!isLoading && session?.tipoUsuario === 'ADMIN' && (
          <Link href="/admin" style={{ color: '#f59e0b', fontWeight: 600 }}>
            Painel Admin
          </Link>
        )}

        {!isLoading && session && (
          <Link href="/notificacoes" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            Notificações
            {unreadCount > 0 && (
              <span style={{ background: 'var(--danger)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        <span id="userInfo">
          {!isLoading && session ? `Bem-vindo, ${userName || 'Usuário'}` : ''}
        </span>

        {!isLoading && !session && (
          <Link href="/login" className="btn primary">
            Entrar / Cadastrar
          </Link>
        )}

        {!isLoading && session && (
          <button onClick={handleLogout} className="btn danger">
            Sair
          </button>
        )}
      </nav>
    </header>
  );
}
