'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { apiListarNotificacoes, apiMarcarNotificacaoComoLida, apiExcluirNotificacao } from '@/lib/api';
import Link from 'next/link';

export default function NotificacoesPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const [notificacoes, setNotificacoes] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    async function loadNotificacoes() {
      if (session?.userId) {
        try {
          const data = await apiListarNotificacoes(session.userId);
          setNotificacoes(data);
        } catch (e) {
          setErrorMsg('Erro ao carregar notificações.');
        }
      }
    }
    if (!isLoading) loadNotificacoes();
  }, [session, isLoading]);

  const handleMarcarComoLida = async (idNotificacao) => {
    try {
      await apiMarcarNotificacaoComoLida(idNotificacao);
      setNotificacoes(prev => 
        prev.map(notif => notif.idNotificacao === idNotificacao ? { ...notif, lida: true } : notif)
      );
    } catch (e) {
      console.error("Erro ao marcar como lida:", e);
    }
  };

  const handleExcluirNotificacao = async (idNotificacao) => {
    try {
      await apiExcluirNotificacao(idNotificacao);
      setNotificacoes(prev => prev.filter(notif => notif.idNotificacao !== idNotificacao));
    } catch (e) {
      console.error("Erro ao excluir notificação:", e);
    }
  };

  if (isLoading || !session) return null;

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Minhas Notificações</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Fique por dentro das atualizações dos seus cursos.</p>

      {errorMsg && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{errorMsg}</p>}

      {notificacoes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.2rem' }}>Você não tem nenhuma notificação.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notificacoes.map((notif) => (
            <div 
              key={notif.idNotificacao} 
              style={{ 
                position: 'relative',
                padding: '24px', 
                background: notif.lida ? 'var(--card)' : 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px',
                borderLeft: notif.lida ? '1px solid var(--border)' : '4px solid var(--primary)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', paddingRight: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: notif.lida ? 'var(--fg)' : 'var(--primary)' }}>
                  {notif.tipo === 'CURSO_APROVADO' && 'Curso Aprovado'}
                  {notif.tipo === 'CURSO_REJEITADO' && 'Curso Rejeitado'}
                  {notif.tipo === 'NOVO_COMENTARIO' && 'Novo Comentário na Aula'}
                  {notif.tipo === 'NOVA_AVALIACAO' && 'Nova Avaliação no Curso'}
                  {!['CURSO_APROVADO', 'CURSO_REJEITADO', 'NOVO_COMENTARIO', 'NOVA_AVALIACAO'].includes(notif.tipo) && 'Notificação'}
                </h3>
                <small style={{ color: 'var(--muted)', marginRight: '8px' }}>
                  {new Date(notif.dataCriacao).toLocaleString('pt-BR')}
                </small>
              </div>
              
              <button 
                onClick={() => handleExcluirNotificacao(notif.idNotificacao)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.2s ease'
                }}
                title="Excluir notificação"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--danger)';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                &times;
              </button>
              
              <p style={{ margin: '0 0 16px 0', lineHeight: 1.5, color: 'var(--fg)' }}>{notif.mensagem}</p>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {!notif.lida && (
                  <button 
                    onClick={() => handleMarcarComoLida(notif.idNotificacao)}
                    className="btn primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Marcar como lida
                  </button>
                )}
                
                {notif.cursoId && (
                  <Link href={`/curso/${notif.cursoId}`} className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Ver Curso
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
