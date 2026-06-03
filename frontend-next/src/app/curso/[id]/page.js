'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import { 
  apiBuscarCurso, 
  apiListarInscricoesPorUsuario, 
  apiInscrever, 
  apiExcluirCurso, 
  apiListarAvaliacoes, 
  apiListarModulosPorCurso,
  apiCriarAvaliacao,
  apiAtualizarAvaliacao,
  apiExcluirAvaliacao
} from '@/lib/api';
import Swal from 'sweetalert2';

export default function CursoDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const { session, isLoading } = useSession();
  
  const [curso, setCurso] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [activeTab, setActiveTab] = useState('sobre');

  // Estado da avaliação do usuário logado
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ nota: 5, comentario: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiBuscarCurso(id);
        setCurso(data);

        let avs = [];
        try {
          avs = await apiListarAvaliacoes(id);
          setAvaliacoes(avs);
        } catch (e) {
          console.error("Erro ao carregar avaliações");
        }

        try {
          const mods = await apiListarModulosPorCurso(id);
          setModulos(mods);
        } catch (e) {
          console.error("Erro ao carregar módulos");
        }

        if (session) {
          const inscricoes = await apiListarInscricoesPorUsuario(session.userId);
          const inscrito = inscricoes.some((insc) => insc?.curso?.idCurso === id);
          setIsEnrolled(inscrito);
          
          if (inscrito) {
            const mAv = avs.find(av => String(av.usuario?.idUsuario) === String(session.userId) || String(av.usuarioId) === String(session.userId));
            if (mAv) {
              setMinhaAvaliacao(mAv);
              setReviewForm({ nota: mAv.nota, comentario: mAv.comentario || '' });
            }
          }
        }
      } catch (err) {
        setErrorMsg('Curso não encontrado.');
      }
    }
    if (!isLoading) loadData();
  }, [id, session, isLoading]);

  const handleEnroll = async () => {
    if (!session) {
      Swal.fire('Faça login', 'Faça login para se inscrever no curso', 'info');
      router.push('/login');
      return;
    }
    try {
      await apiInscrever(session.userId, id);
      Swal.fire('Sucesso!', 'Inscrição realizada com sucesso!', 'success');
      setIsEnrolled(true);
      router.push(`/aula/${id}`);
    } catch (error) {
      Swal.fire('Erro', error.message || 'Não foi possível inscrever neste curso.', 'error');
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({ title: 'Tem certeza que deseja excluir este curso?', text: 'Esta ação não pode ser desfeita.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;
    try {
      await apiExcluirCurso(id, session.userId);
      await Swal.fire('Excluído!', 'Curso excluído com sucesso.', 'success');
      router.push('/cursos');
    } catch (error) {
      Swal.fire('Erro', error.message || 'Não foi possível excluir o curso.', 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!session) return;
    
    try {
      if (minhaAvaliacao && isEditingReview) {
        const updated = await apiAtualizarAvaliacao(minhaAvaliacao.idAvaliacao, {
          usuarioId: session.userId,
          nota: reviewForm.nota,
          comentario: reviewForm.comentario
        });
        setMinhaAvaliacao(updated);
        setAvaliacoes(avaliacoes.map(av => av.idAvaliacao === updated.idAvaliacao ? updated : av));
        setIsEditingReview(false);
        Swal.fire('Sucesso!', 'Avaliação atualizada!', 'success');
      } else {
        const created = await apiCriarAvaliacao({
          usuarioId: session.userId,
          cursoId: id,
          nota: reviewForm.nota,
          comentario: reviewForm.comentario
        });
        setMinhaAvaliacao(created);
        setAvaliacoes([created, ...avaliacoes]);
        Swal.fire('Sucesso!', 'Avaliação enviada com sucesso!', 'success');
      }
    } catch (error) {
      Swal.fire('Erro', error.message || 'Erro ao salvar avaliação.', 'error');
    }
  };

  const handleDeleteReview = async () => {
    if (!minhaAvaliacao || !session) return;
    const result = await Swal.fire({ title: 'Tem certeza que deseja excluir sua avaliação?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;

    try {
      await apiExcluirAvaliacao(minhaAvaliacao.idAvaliacao, session.userId);
      setAvaliacoes(avaliacoes.filter(av => av.idAvaliacao !== minhaAvaliacao.idAvaliacao));
      setMinhaAvaliacao(null);
      setReviewForm({ nota: 5, comentario: '' });
      setIsEditingReview(false);
      Swal.fire('Sucesso!', 'Avaliação excluída!', 'success');
    } catch (error) {
      Swal.fire('Erro', error.message || 'Erro ao excluir avaliação.', 'error');
    }
  };

  if (errorMsg) return <main style={{ padding: '40px', textAlign: 'center' }}><p>{errorMsg}</p></main>;
  if (!curso) return <main style={{ padding: '40px', textAlign: 'center' }}><p>Carregando...</p></main>;

  const isOwner = (session?.tipoUsuario === 'INSTRUTOR' && String(session.userId) === String(curso.instrutor?.idUsuario)) || session?.tipoUsuario === 'ADMIN';

  const mediaAvaliacoes = avaliacoes.length > 0 
    ? (avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length).toFixed(1)
    : 0;

  const renderStars = (nota, interactive = false, onClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          onClick={() => interactive && onClick && onClick(i)}
          style={{ 
            color: i <= nota ? '#f59e0b' : '#d1d5db', 
            fontSize: '1.2rem',
            cursor: interactive ? 'pointer' : 'default',
            marginRight: '2px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <main style={{ padding: 0 }}>
      {/* ====== HERO ESCURO (estilo Udemy) ====== */}
      <div className="curso-hero-banner">
        <div className="curso-hero-content">
          <nav className="curso-breadcrumb">
            <Link href="/cursos">Cursos</Link>
            <span>›</span>
            <span>{curso.titulo}</span>
          </nav>
          <h1 className="curso-hero-title">{curso.titulo}</h1>
          <p className="curso-hero-desc">
            {curso.descricao?.length > 150 ? curso.descricao.substring(0, 150) + '...' : curso.descricao}
          </p>
          <div className="curso-hero-meta">
            {avaliacoes.length > 0 && (
              <span className="curso-rating">
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{mediaAvaliacoes}</span>
                {' '}{renderStars(Math.round(mediaAvaliacoes))}
                {' '}<span className="curso-rating-count">({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})</span>
              </span>
            )}
            {avaliacoes.length === 0 && <span className="curso-badge-new">Novo</span>}
            {curso.instrutor?.nome && (
              <span className="curso-instructor">
                Criado por <strong>{curso.instrutor.nome}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ====== CONTEÚDO + SIDEBAR ====== */}
      <div className="curso-layout">
        {/* Coluna principal */}
        <div className="curso-main">
          {/* Tabs */}
          <div className="curso-tabs">
            <button 
              className={`curso-tab ${activeTab === 'sobre' ? 'active' : ''}`}
              onClick={() => setActiveTab('sobre')}
            >
              Sobre o Curso
            </button>
            <button 
              className={`curso-tab ${activeTab === 'conteudo' ? 'active' : ''}`}
              onClick={() => setActiveTab('conteudo')}
            >
              Conteúdo ({modulos.length} {modulos.length === 1 ? 'aula' : 'aulas'})
            </button>
            <button 
              className={`curso-tab ${activeTab === 'avaliacoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('avaliacoes')}
            >
              Comentários e Avaliações ({avaliacoes.length})
            </button>
          </div>

          {/* Tab: Sobre */}
          {activeTab === 'sobre' && (
            <div className="curso-tab-content">
              <h2>O que você vai aprender</h2>
              <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--fg)' }}>{curso.descricao}</p>

              <h2 style={{ marginTop: '32px' }}>Este curso inclui</h2>
              <div className="curso-includes">
                <div className="curso-include-item">Vídeo-aulas sob demanda</div>
                <div className="curso-include-item">Acesso em qualquer dispositivo</div>
                <div className="curso-include-item">{modulos.length} {modulos.length === 1 ? 'módulo' : 'módulos'} de conteúdo</div>
                <div className="curso-include-item">Acesso vitalício</div>
              </div>
            </div>
          )}

          {/* Tab: Conteúdo */}
          {activeTab === 'conteudo' && (
            <div className="curso-tab-content">
              <h2>Conteúdo do Curso</h2>
              {modulos.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>Nenhum módulo cadastrado ainda.</p>
              ) : (
                <div className="curso-modulos-list">
                  {modulos.map((mod, i) => (
                    <div key={mod.idModulo || i} className="curso-modulo-item">
                      <div className="curso-modulo-num">{i + 1}</div>
                      <div className="curso-modulo-info">
                        <h4>{mod.titulo}</h4>
                        {mod.descricao && <p>{mod.descricao}</p>}
                      </div>
                      {mod.videoUrl && <span className="curso-modulo-video">Vídeo</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Avaliações */}
          {activeTab === 'avaliacoes' && (
            <div className="curso-tab-content">
              <h2>Comentários e Avaliações dos Alunos</h2>
              
              {/* Formulário / Ações do Aluno */}
              {isEnrolled && (
                <div style={{ background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '32px' }}>
                  {(!minhaAvaliacao || isEditingReview) ? (
                    <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h3 style={{ margin: 0 }}>{minhaAvaliacao ? 'Editar Avaliação' : 'Deixe sua Avaliação'}</h3>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--muted)' }}>Sua nota (1 a 5)</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {renderStars(reviewForm.nota, true, (n) => setReviewForm({...reviewForm, nota: n}))}
                        </div>
                      </div>
                      <div>
                        <textarea 
                          required 
                          value={reviewForm.comentario} 
                          onChange={(e) => setReviewForm({...reviewForm, comentario: e.target.value})}
                          placeholder="Conte-nos o que achou do curso..."
                          style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                        ></textarea>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn primary">{minhaAvaliacao ? 'Salvar Alterações' : 'Enviar Avaliação'}</button>
                        {isEditingReview && (
                          <button type="button" className="btn" onClick={() => setIsEditingReview(false)}>Cancelar</button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px' }}>Sua Avaliação</h3>
                          <div>{renderStars(minhaAvaliacao.nota)}</div>
                          <p style={{ margin: '12px 0 0', lineHeight: 1.6 }}>{minhaAvaliacao.comentario}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setIsEditingReview(true)} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Editar</button>
                          <button onClick={handleDeleteReview} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', border: '1px solid #ef4444', color: '#ef4444' }}>Excluir</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lista Geral */}
              {avaliacoes.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>Nenhuma avaliação ainda. Seja o primeiro!</p>
              ) : (
                <>
                  <div className="curso-rating-summary">
                    <div className="curso-rating-big">
                      <span className="curso-rating-number">{mediaAvaliacoes}</span>
                      <div>{renderStars(Math.round(mediaAvaliacoes))}</div>
                      <span className="curso-rating-total">{avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}</span>
                    </div>
                  </div>
                  
                  <div className="curso-avaliacoes-list">
                    {avaliacoes.map((av, i) => {
                      const isMine = minhaAvaliacao && String(av.idAvaliacao) === String(minhaAvaliacao.idAvaliacao);
                      if (isMine && !isEditingReview) return null; // Já mostrei em cima
                      
                      const nomeDisplay = av.usuario?.nome || av.nomeUsuario || 'Aluno';
                      return (
                        <div key={av.idAvaliacao || i} className="curso-avaliacao-item">
                          <div className="curso-avaliacao-header">
                            <div className="curso-avaliacao-avatar">
                              {nomeDisplay.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong>{nomeDisplay}</strong>
                              <div>{renderStars(av.nota)}</div>
                            </div>
                          </div>
                          {av.comentario && <p className="curso-avaliacao-text">{av.comentario}</p>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar (card fixo estilo Udemy) */}
        <aside className="curso-sidebar">
          <div className="curso-sidebar-card">
            <img 
              src={curso.imagemBase64 || '/assets/pagina de cursos.jpg'} 
              alt={curso.titulo}
              className="curso-sidebar-img"
              onError={(e) => { e.target.onerror = null; e.target.src = '/assets/pagina de cursos.jpg'; }}
            />
            <div className="curso-sidebar-body">
              <div className="curso-price">Gratuito</div>
              {isEnrolled ? (
                <Link href={`/aula/${id}`} className="btn primary curso-enroll-btn" style={{ textDecoration: 'none' }}>
                  Continuar Assistindo
                </Link>
              ) : (
                <button onClick={handleEnroll} className="btn primary curso-enroll-btn">
                  Inscrever-se Agora
                </button>
              )}
              {session?.tipoUsuario === 'INSTRUTOR' && (
                <Link href="/criar-curso" className="btn secondary curso-enroll-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Criar Novo Curso
                </Link>
              )}
              {isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '8px' }}>
                  <Link href={`/editar-curso/${id}`} className="btn secondary curso-enroll-btn" style={{ textAlign: 'center', textDecoration: 'none', margin: 0 }}>
                    Editar Curso
                  </Link>
                  <button onClick={handleDelete} className="curso-delete-btn" style={{ margin: 0, width: '100%' }}>
                    Excluir Curso
                  </button>
                </div>
              )}
              <div className="curso-sidebar-details">
                <div className="curso-sidebar-detail">
                  <span>Nível iniciante</span>
                </div>
                <div className="curso-sidebar-detail">
                  <span>{modulos.length} {modulos.length === 1 ? 'aula' : 'aulas'}</span>
                </div>
                <div className="curso-sidebar-detail">
                  <span>Português</span>
                </div>
                <div className="curso-sidebar-detail">
                  <span>Acesso vitalício</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
