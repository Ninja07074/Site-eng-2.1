'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { 
  apiBuscarCurso, 
  apiListarModulosPorCurso, 
  apiEditarCursoComImagem, 
  apiCriarModulo, 
  apiAtualizarModulo, 
  apiExcluirModulo 
} from '@/lib/api';
import Link from 'next/link';

export default function EditarCursoPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const { session, isLoading } = useSession();
  
  const [form, setForm] = useState({ titulo: '', descricao: '', status: 'PENDENTE' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalModulos, setOriginalModulos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
      return;
    }
    if (!isLoading && session && session.tipoUsuario !== 'INSTRUTOR') {
      setAuthorized(false);
    }

    async function loadCourseData() {
      try {
        const curso = await apiBuscarCurso(id);
        
        // A proteção real de ownership é feita no backend via X-User-Id.

        setForm({
          titulo: curso.titulo || '',
          descricao: curso.descricao || '',
          status: curso.status || 'PENDENTE'
        });
        
        if (curso.imagemBase64) {
          setImagePreview(curso.imagemBase64);
        }

        const mods = await apiListarModulosPorCurso(id);
        // Garante que cada módulo tenha um identificador único para o frontend (pode ser o idModulo do BD)
        const modsMapped = mods.map(m => ({
          idModulo: m.idModulo,
          titulo: m.titulo || '',
          descricao: m.descricao || '',
          ordem: m.ordem || 1,
          videoUrl: m.videoUrl || ''
        }));
        
        setOriginalModulos(JSON.parse(JSON.stringify(modsMapped)));
        setModulos(modsMapped);
        setLoadingData(false);
      } catch (err) {
        setMsg('Não foi possível carregar as informações do curso.');
        setLoadingData(false);
      }
    }

    if (session) {
      loadCourseData();
    }
  }, [session, isLoading, id, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddModulo = () => {
    setModulos([...modulos, { titulo: `Módulo ${modulos.length + 1}`, descricao: '', ordem: modulos.length + 1, videoUrl: '' }]);
  };

  const handleRemoveModulo = (index) => {
    const newModulos = [...modulos];
    newModulos.splice(index, 1);
    // Atualiza a ordem dos módulos remanescentes
    const reordered = newModulos.map((m, idx) => ({ ...m, ordem: idx + 1 }));
    setModulos(reordered);
  };

  const updateModulo = (index, field, value) => {
    const newModulos = [...modulos];
    newModulos[index][field] = value;
    setModulos(newModulos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.descricao) return setMsg('Preencha o título e a descrição do curso.');
    if (modulos.length === 0) return setMsg('Adicione pelo menos uma aula/módulo.');
    
    for (let i = 0; i < modulos.length; i++) {
      if (!modulos[i].titulo.trim()) return setMsg(`Preencha o título do módulo ${i + 1}.`);
    }

    try {
      setIsSubmitting(true);
      setMsg('Salvando alterações do curso...');
      
      // 1. Atualizar informações básicas e capa do curso
      await apiEditarCursoComImagem(id, session.userId, {
        titulo: form.titulo,
        descricao: form.descricao,
        status: form.status,
        imagem: imageFile // Se null, backend mantém a imagem atual
      });

      setMsg('Sincronizando aulas...');
      
      // 2. Determinar exclusões (módulos que estavam no original mas não estão no atual)
      const modulosParaExcluir = originalModulos.filter(
        orig => !modulos.some(curr => curr.idModulo === orig.idModulo)
      );

      for (const modToDelete of modulosParaExcluir) {
        if (modToDelete.idModulo) {
          await apiExcluirModulo(modToDelete.idModulo);
        }
      }

      // 3. Determinar atualizações e inserções
      for (const currMod of modulos) {
        if (currMod.idModulo) {
          // É um módulo existente. Vamos verificar se mudou de valor antes de chamar a API (opcional, mas simples)
          await apiAtualizarModulo(currMod.idModulo, {
            titulo: currMod.titulo,
            descricao: currMod.descricao,
            ordem: currMod.ordem,
            videoUrl: currMod.videoUrl
          });
        } else {
          // É um novo módulo criado na tela de edição
          await apiCriarModulo(id, {
            titulo: currMod.titulo,
            descricao: currMod.descricao,
            ordem: currMod.ordem,
            videoUrl: currMod.videoUrl
          });
        }
      }

      setSuccess(true);
      setMsg('Curso atualizado com sucesso!');
      setTimeout(() => router.push(`/curso/${id}`), 2000);
    } catch (err) {
      setMsg(err.message || 'Não foi possível salvar as edições do curso.');
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingData) {
    return <main style={{ padding: '80px 20px', textAlign: 'center' }}><p>Carregando dados do curso...</p></main>;
  }

  if (!authorized) {
    return (
      <main style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Acesso Não Autorizado</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Você não tem permissão para editar este curso, pois você não é o autor dele.</p>
          <button className="btn primary" onClick={() => router.push('/cursos')}>Voltar para Cursos</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 0 }}>
      {/* Header */}
      <div className="criar-header">
        <div className="criar-header-content">
          <h1>Editar Curso</h1>
          <p>Mantenha as aulas e detalhes do seu curso sempre atualizados</p>
        </div>
      </div>

      {success ? (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          <div className="success-message" style={{ display: 'block', textAlign: 'center' }}>
            <h3>Curso Atualizado!</h3>
            <p>Suas alterações foram salvas com sucesso.</p>
            {form.status !== 'INATIVO' && (
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '8px' }}>
                Nota: O curso foi enviado para re-avaliação do administrador.
              </p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="criar-layout">
          {/* Coluna esquerda: Info principal */}
          <div className="criar-main">
            <div className="criar-section">
              <h2 className="criar-section-title">Informações Básicas</h2>
              
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Título do Curso *</label>
                  <small style={{ color: form.titulo.length === 255 ? 'var(--danger)' : 'var(--muted)' }}>{form.titulo.length}/255</small>
                </div>
                <input 
                  required 
                  maxLength={255}
                  value={form.titulo} 
                  onChange={e => setForm({...form, titulo: e.target.value})} 
                  placeholder="Ex: React Masterclass — Do Zero ao Avançado" 
                />
              </div>
              
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Descrição do Curso *</label>
                  <small style={{ color: form.descricao.length === 2000 ? 'var(--danger)' : 'var(--muted)' }}>{form.descricao.length}/2000</small>
                </div>
                <textarea 
                  required 
                  maxLength={2000}
                  value={form.descricao} 
                  onChange={e => setForm({...form, descricao: e.target.value})} 
                  placeholder="Descreva o que o aluno vai aprender, os pré-requisitos, e o que torna esse curso especial..." 
                  style={{ minHeight: '140px' }}
                ></textarea>
              </div>
            </div>

            {/* Módulos */}
            <div className="criar-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="criar-section-title" style={{ margin: 0 }}>Módulos / Aulas</h2>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {modulos.length} {modulos.length === 1 ? 'aula' : 'aulas'}
                </span>
              </div>
              
              {modulos.map((mod, idx) => (
                <div key={mod.idModulo || idx} className="criar-modulo-card">
                  <div className="criar-modulo-header">
                    <div className="criar-modulo-num">{idx + 1}</div>
                    <strong style={{ flex: 1 }}>Módulo {idx + 1}</strong>
                    {modulos.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveModulo(idx)} 
                        className="criar-modulo-remove"
                        title="Remover aula"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <div className="criar-modulo-fields">
                    <div className="form-field" style={{ flex: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>Título da Aula *</label>
                        <small style={{ color: mod.titulo.length === 255 ? 'var(--danger)' : 'var(--muted)' }}>{mod.titulo.length}/255</small>
                      </div>
                      <input 
                        required 
                        maxLength={255}
                        value={mod.titulo} 
                        onChange={e => updateModulo(idx, 'titulo', e.target.value)} 
                        placeholder="Ex: Introdução ao React" 
                      />
                    </div>
                    <div className="form-field" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>URL do Vídeo</label>
                        <small style={{ color: (mod.videoUrl || '').length === 255 ? 'var(--danger)' : 'var(--muted)' }}>{(mod.videoUrl || '').length}/255</small>
                      </div>
                      <input 
                        type="url" 
                        maxLength={255}
                        value={mod.videoUrl} 
                        onChange={e => updateModulo(idx, 'videoUrl', e.target.value)} 
                        placeholder="https://youtube.com/..." 
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label>Descrição da Aula</label>
                      <small style={{ color: (mod.descricao || '').length === 2000 ? 'var(--danger)' : 'var(--muted)' }}>{(mod.descricao || '').length}/2000</small>
                    </div>
                    <textarea 
                      maxLength={2000}
                      value={mod.descricao} 
                      onChange={e => updateModulo(idx, 'descricao', e.target.value)} 
                      placeholder="O que o aluno vai aprender nesta aula..." 
                      style={{ minHeight: '70px' }}
                    ></textarea>
                  </div>
                </div>
              ))}
              
              <button type="button" onClick={handleAddModulo} className="criar-add-modulo">
                + Adicionar Módulo / Aula
              </button>
            </div>
          </div>

          {/* Coluna direita: Sidebar */}
          <aside className="criar-sidebar">
            {/* Preview da imagem */}
            <div className="criar-section">
              <h2 className="criar-section-title">Imagem de Capa</h2>
              <div className="criar-img-upload">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="criar-img-preview" />
                ) : (
                  <div className="criar-img-placeholder">
                    <span>Sem Imagem</span>
                    <p>Clique para selecionar</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="criar-img-input"
                />
              </div>
              <small style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '8px', display: 'block' }}>
                Clique sobre a imagem para alterar a capa. Recomendado: 16:9
              </small>
            </div>

            {/* Configurações */}
            <div className="criar-section">
              <h2 className="criar-section-title">Configurações</h2>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="ATIVO">Publicar (Passará por moderação)</option>
                  <option value="INATIVO">Inativo (Rascunho)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Idioma</label>
                <select disabled>
                  <option>Português (Brasil)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Nível</label>
                <select disabled>
                  <option>Iniciante</option>
                </select>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="criar-section" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
              <button type="submit" className="btn primary criar-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <Link href={`/curso/${id}`} className="criar-cancel-btn">
                Cancelar
              </Link>
              {msg && <p className="auth-msg" style={{ marginTop: '12px', textAlign: 'center' }}>{msg}</p>}
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
