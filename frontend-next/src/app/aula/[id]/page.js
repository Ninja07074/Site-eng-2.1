'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';
import { 
  apiBuscarCurso, 
  apiListarInscricoesPorUsuario, 
  apiListarModulosPorCurso,
  apiListarComentariosPorModulo,
  apiCriarComentario,
  apiAtualizarComentario,
  apiExcluirComentario
} from '@/lib/api';
import YouTubePlayer from '@/components/YouTubePlayer';
import Swal from 'sweetalert2';

export default function AulaPage({ params }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;
  const router = useRouter();
  const { session, isLoading } = useSession();
  
  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [activeModuloIndex, setActiveModuloIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estado de comentários da aula atual
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [editComentarioId, setEditComentarioId] = useState(null);
  const [editComentarioTexto, setEditComentarioTexto] = useState('');

  useEffect(() => {
    async function loadData() {
      if (isLoading) return;
      if (!session) {
        router.push('/login');
        return;
      }
      try {
        const inscricoes = await apiListarInscricoesPorUsuario(session.userId);
        const inscrito = inscricoes.some((insc) => insc?.curso?.idCurso === courseId);
        if (!inscrito) {
          router.push(`/curso/${courseId}`);
          return;
        }

        const dataCurso = await apiBuscarCurso(courseId);
        setCurso(dataCurso);

        const dataModulos = await apiListarModulosPorCurso(courseId);
        setModulos(dataModulos.sort((a,b) => a.ordem - b.ordem));
      } catch (err) {
        setErrorMsg('Curso não encontrado ou erro ao carregar.');
      }
    }
    loadData();
  }, [courseId, session, isLoading, router]);

  // Carregar comentários quando mudar de aula
  useEffect(() => {
    async function loadComentarios() {
      if (modulos.length > 0) {
        const currentMod = modulos[activeModuloIndex];
        if (currentMod && currentMod.idModulo) {
          try {
            const coms = await apiListarComentariosPorModulo(currentMod.idModulo);
            setComentarios(coms || []);
          } catch (e) {
            console.error("Erro ao carregar comentários", e);
          }
        }
      }
    }
    loadComentarios();
  }, [activeModuloIndex, modulos]);

  const handlePostarComentario = async (e) => {
    e.preventDefault();
    if (!novoComentario.trim() || !session) return;
    try {
      const currentMod = modulos[activeModuloIndex];
      const criado = await apiCriarComentario({
        usuarioId: session.userId,
        moduloId: currentMod.idModulo,
        texto: novoComentario
      });
      setComentarios([criado, ...comentarios]);
      setNovoComentario('');
    } catch (err) {
      Swal.fire('Erro', err.message || 'Erro ao postar comentário.', 'error');
    }
  };

  const handleSalvarEdicaoComentario = async (idComentario) => {
    if (!editComentarioTexto.trim() || !session) return;
    try {
      const atualizado = await apiAtualizarComentario(idComentario, {
        usuarioId: session.userId,
        texto: editComentarioTexto
      });
      setComentarios(comentarios.map(c => c.idComentario === idComentario ? atualizado : c));
      setEditComentarioId(null);
      setEditComentarioTexto('');
    } catch (err) {
      Swal.fire('Erro', err.message || 'Erro ao editar comentário.', 'error');
    }
  };

  const handleExcluirComentario = async (idComentario) => {
    const result = await Swal.fire({ title: 'Tem certeza que deseja excluir este comentário?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Cancelar' });
    if (!result.isConfirmed) return;
    try {
      await apiExcluirComentario(idComentario, session.userId);
      setComentarios(comentarios.filter(c => c.idComentario !== idComentario));
      Swal.fire('Sucesso!', 'Comentário excluído!', 'success');
    } catch (err) {
      Swal.fire('Erro', err.message || 'Erro ao excluir comentário.', 'error');
    }
  };

  if (errorMsg) return <main style={{ padding: '40px', textAlign: 'center' }}><p>{errorMsg}</p></main>;
  if (!curso) return <main style={{ padding: '40px', textAlign: 'center' }}><p>Carregando aula...</p></main>;

  const currentModulo = modulos[activeModuloIndex] || null;

  return (
    <main className="course-content">
      <div className="lesson-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{currentModulo ? currentModulo.titulo : curso.titulo}</h1>
          <p>Curso: {curso.titulo}</p>
        </div>
        <div>
          <Link href={`/curso/${courseId}`} className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Ir para a Página do Curso / Avaliar
          </Link>
        </div>
      </div>

      <YouTubePlayer videoUrl={currentModulo?.videoUrl} />

      <div className="lesson-materials">
        <h3>Sobre a Aula</h3>
        <p style={{ margin: 0, lineHeight: 1.8, color: 'var(--muted)', fontSize: '1rem' }}>
          {currentModulo?.descricao || 'Nenhuma descrição disponível para esta aula.'}
        </p>
      </div>

      <div className="lessons-nav">
        <h3 style={{ gridColumn: '1/-1', marginBottom: '20px', color: 'var(--fg)' }}>Aulas do Curso</h3>
        
        {modulos.length === 0 ? (
          <p style={{ color: 'var(--muted)', gridColumn: '1/-1' }}>Nenhum módulo disponível ainda.</p>
        ) : (
          modulos.map((mod, idx) => (
            <div 
              key={mod.idModulo || idx} 
              className={`modulo-card ${activeModuloIndex === idx ? 'active' : ''}`}
              onClick={() => {
                setActiveModuloIndex(idx);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={activeModuloIndex === idx ? { borderColor: 'var(--primary)', background: 'var(--card-solid)' } : {}}
            >
              <h4>Aula {mod.ordem}: {mod.titulo}</h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                {mod.descricao ? mod.descricao.substring(0, 80) + '...' : 'Clique para ver mais'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Comentários da Aula */}
      <div style={{ marginTop: '40px', padding: '32px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', color: 'var(--fg)' }}>Fórum e Dúvidas da Aula</h3>
        
        {/* Formulário Novo Comentário */}
        <form onSubmit={handlePostarComentario} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea 
            placeholder="Ficou com dúvida ou quer compartilhar algo sobre esta aula?" 
            value={novoComentario} 
            onChange={e => setNovoComentario(e.target.value)}
            style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn primary" disabled={!novoComentario.trim()}>Postar Comentário</button>
          </div>
        </form>

        {/* Lista de Comentários */}
        <div>
          {comentarios.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Nenhum comentário nesta aula. Seja o primeiro a participar!</p>
          ) : (
            comentarios.map(com => {
              const isMine = String(com.usuario?.idUsuario) === String(session?.userId);
              const isEditingThis = editComentarioId === com.idComentario;

              return (
                <div key={com.idComentario} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {(com.usuario?.nome || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--fg)' }}>{com.usuario?.nome || 'Aluno'}</strong>
                      <small style={{ color: 'var(--muted)' }}>{new Date(com.dataCriacao).toLocaleDateString('pt-BR')}</small>
                    </div>
                  </div>

                  {isEditingThis ? (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <textarea 
                        value={editComentarioTexto}
                        onChange={e => setEditComentarioTexto(e.target.value)}
                        style={{ width: '100%', minHeight: '60px', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn primary" onClick={() => handleSalvarEdicaoComentario(com.idComentario)}>Salvar</button>
                        <button className="btn" onClick={() => setEditComentarioId(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: '0 0 12px 0', lineHeight: 1.6, color: 'var(--fg)' }}>{com.texto}</p>
                      {isMine && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button 
                            className="btn" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'transparent', border: 'none', color: 'var(--muted)', textDecoration: 'underline' }}
                            onClick={() => {
                              setEditComentarioId(com.idComentario);
                              setEditComentarioTexto(com.texto);
                            }}
                          >
                            Editar
                          </button>
                          <button 
                            className="btn" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'transparent', border: 'none', color: '#ef4444', textDecoration: 'underline' }}
                            onClick={() => handleExcluirComentario(com.idComentario)}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
