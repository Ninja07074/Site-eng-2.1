'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import {
  apiListarCursosPendentes,
  apiListarTodosCursos,
  apiAprovarCurso,
  apiRejeitarCurso,
  apiDesativarCurso,
  apiExcluirCurso,
  apiListarUsuarios,
  apiExcluirUsuario,
  apiAtualizarTipoUsuario
} from '@/lib/api';
import Swal from 'sweetalert2';

export default function AdminPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const [activeTab, setActiveTab] = useState('pendentes');
  const [pendentes, setPendentes] = useState([]);
  const [todosCursos, setTodosCursos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [msg, setMsg] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [rejectMotivo, setRejectMotivo] = useState('');

  useEffect(() => {
    if (!isLoading && (!session || session.tipoUsuario !== 'ADMIN')) {
      router.push('/');
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    if (session?.tipoUsuario === 'ADMIN') {
      loadData();
    }
  }, [session, activeTab]);

  async function loadData() {
    try {
      if (activeTab === 'pendentes') {
        const data = await apiListarCursosPendentes();
        setPendentes(data);
      } else if (activeTab === 'cursos') {
        const data = await apiListarTodosCursos();
        setTodosCursos(data);
      } else if (activeTab === 'usuarios') {
        const data = await apiListarUsuarios();
        setUsuarios(data);
      }
    } catch (err) {
      setMsg('Erro ao carregar dados: ' + (err.message || 'Erro desconhecido'));
    }
  }

  // ===================== AÇÕES DE CURSO =====================

  async function handleAprovar(id) {
    try {
      await apiAprovarCurso(id);
      setMsg('Curso aprovado com sucesso!');
      loadData();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handleRejeitar(id) {
    if (!rejectMotivo.trim()) {
      setMsg('Informe o motivo da rejeição.');
      return;
    }
    try {
      await apiRejeitarCurso(id, rejectMotivo);
      setMsg('Curso rejeitado.');
      setRejectId(null);
      setRejectMotivo('');
      loadData();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handleDesativar(id) {
    const result = await Swal.fire({ title: 'Desativar este curso?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;
    try {
      await apiDesativarCurso(id);
      setMsg('Curso desativado.');
      loadData();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handleExcluirCurso(id) {
    const result = await Swal.fire({ title: 'Excluir este curso permanentemente?', text: 'Esta ação não pode ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;
    try {
      await apiExcluirCurso(id, session.userId);
      setMsg('Curso excluído.');
      loadData();
    } catch (err) {
      setMsg(err.message);
    }
  }

  // ===================== AÇÕES DE USUÁRIO =====================

  async function handleExcluirUsuario(id) {
    const result = await Swal.fire({ title: 'Excluir este usuário permanentemente?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;
    try {
      await apiExcluirUsuario(id);
      setMsg('Usuário excluído.');
      loadData();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function handleMudarTipo(id, novoTipo) {
    try {
      await apiAtualizarTipoUsuario(id, novoTipo);
      setMsg(`Tipo atualizado para ${novoTipo}.`);
      loadData();
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (isLoading || !session || session.tipoUsuario !== 'ADMIN') return null;

  // ===================== HELPERS DE STATUS =====================

  function statusBadge(status) {
    const colors = {
      PENDENTE: { bg: '#fef3c7', color: '#92400e' },
      ATIVO: { bg: '#d1fae5', color: '#065f46' },
      REJEITADO: { bg: '#fee2e2', color: '#991b1b' },
      INATIVO: { bg: '#e2e8f0', color: '#475569' }
    };
    const c = colors[status] || colors.INATIVO;
    return (
      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: c.bg, color: c.color }}>
        {status}
      </span>
    );
  }

  // ===================== RENDER =====================

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Painel de Administração</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Gerencie cursos e usuários da plataforma.</p>

      {msg && (
        <div style={{ padding: '12px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '20px', color: 'var(--primary)', fontWeight: 500 }}>
          {msg}
          <button onClick={() => setMsg('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        </div>
      )}

      {/* Abas */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
        {[
          { key: 'pendentes', label: `Pendentes (${pendentes.length})` },
          { key: 'cursos', label: 'Todos os Cursos' },
          { key: 'usuarios', label: 'Usuários' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setMsg(''); }}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--muted)',
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========== ABA: PENDENTES ========== */}
      {activeTab === 'pendentes' && (
        <div>
          {pendentes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <p style={{ fontSize: '1.2rem' }}>Nenhum curso pendente de aprovação!</p>
            </div>
          ) : (
            pendentes.map(curso => (
              <div key={curso.idCurso} className="card" style={{ marginBottom: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px' }}>{curso.titulo}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>
                      Instrutor: {curso.instrutorNome || 'Desconhecido'}
                    </p>
                  </div>
                  {statusBadge(curso.status)}
                </div>
                <p style={{ color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                  {curso.descricao?.substring(0, 200)}{curso.descricao?.length > 200 ? '...' : ''}
                </p>

                {rejectId === curso.idCurso ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      placeholder="Motivo da rejeição..."
                      value={rejectMotivo}
                      onChange={e => setRejectMotivo(e.target.value)}
                      style={{ flex: 1, minWidth: '200px' }}
                    />
                    <button onClick={() => handleRejeitar(curso.idCurso)} className="btn danger" style={{ padding: '10px 20px' }}>Confirmar Rejeição</button>
                    <button onClick={() => { setRejectId(null); setRejectMotivo(''); }} className="btn" style={{ padding: '10px 20px' }}>Cancelar</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAprovar(curso.idCurso)} className="btn primary" style={{ padding: '10px 20px' }}>Aprovar</button>
                    <button onClick={() => setRejectId(curso.idCurso)} className="btn danger" style={{ padding: '10px 20px' }}>Rejeitar</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ========== ABA: TODOS OS CURSOS ========== */}
      {activeTab === 'cursos' && (
        <div>
          {todosCursos.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>Nenhum curso cadastrado.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>TÍTULO</th>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>INSTRUTOR</th>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {todosCursos.map(curso => (
                  <tr key={curso.idCurso} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 500 }}>{curso.titulo}</td>
                    <td style={{ padding: '14px 8px', color: 'var(--muted)' }}>{curso.instrutorNome || '—'}</td>
                    <td style={{ padding: '14px 8px' }}>{statusBadge(curso.status)}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {curso.status === 'PENDENTE' && (
                          <button onClick={() => handleAprovar(curso.idCurso)} className="btn primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Aprovar</button>
                        )}
                        {curso.status === 'ATIVO' && (
                          <button onClick={() => handleDesativar(curso.idCurso)} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Desativar</button>
                        )}
                        <button onClick={() => handleExcluirCurso(curso.idCurso)} className="btn danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ========== ABA: USUÁRIOS ========== */}
      {activeTab === 'usuarios' && (
        <div>
          {usuarios.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>Nenhum usuário cadastrado.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>NOME</th>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>EMAIL</th>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>TIPO</th>
                  <th style={{ padding: '12px 8px', color: 'var(--muted)', fontWeight: 600, fontSize: '0.85rem' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(user => (
                  <tr key={user.idUsuario} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 8px', fontWeight: 500 }}>{user.nome}</td>
                    <td style={{ padding: '14px 8px', color: 'var(--muted)' }}>{user.email}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <select
                        value={user.tipoUsuario}
                        onChange={e => handleMudarTipo(user.idUsuario, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', background: 'var(--card)', color: 'var(--fg)' }}
                        disabled={user.idUsuario === session.userId}
                      >
                        <option value="ALUNO">ALUNO</option>
                        <option value="INSTRUTOR">INSTRUTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      {user.idUsuario !== session.userId && (
                        <button onClick={() => handleExcluirUsuario(user.idUsuario)} className="btn danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Excluir</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}
