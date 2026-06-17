'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { apiCriarCursoComImagem, apiCriarModulo } from '@/lib/api';
import Link from 'next/link';

export default function CriarCursoPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  
  const [form, setForm] = useState({ titulo: '', descricao: '', status: 'ATIVO' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [modulos, setModulos] = useState([{ titulo: 'Módulo 1', descricao: '', ordem: 1, videoUrl: '' }]);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
      return;
    }
    if (!isLoading && session && session.tipoUsuario !== 'INSTRUTOR') {
      setAuthorized(false);
    }
  }, [session, isLoading, router]);

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
    setModulos(newModulos);
  };

  const updateModulo = (index, field, value) => {
    const newModulos = [...modulos];
    newModulos[index][field] = value;
    setModulos(newModulos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.descricao) return setMsg('Preencha título e descrição do curso.');
    if (!imageFile) return setMsg('Selecione uma imagem para o curso.');
    if (modulos.length === 0) return setMsg('Adicione pelo menos um módulo.');
    for (let i = 0; i < modulos.length; i++) {
      if (!modulos[i].titulo.trim()) return setMsg(`Preencha o título do módulo ${i + 1}.`);
    }

    try {
      setIsSubmitting(true);
      setMsg('Enviando curso e imagem...');
      
      const curso = await apiCriarCursoComImagem(session.userId, {
        ...form,
        imagem: imageFile
      });

      setMsg('Criando aulas...');
      for (const mod of modulos) {
        await apiCriarModulo(curso.idCurso, {
          titulo: mod.titulo,
          descricao: mod.descricao,
          ordem: mod.ordem,
          videoUrl: mod.videoUrl
        });
      }

      setSuccess(true);
      setTimeout(() => router.push('/cursos'), 2000);
    } catch (err) {
      setMsg(err.message || 'Não foi possível criar o curso.');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !session) return null;

  if (!authorized) {
    return (
      <main style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Acesso Não Autorizado</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Você não tem permissão. Apenas instrutores podem criar cursos.</p>
          <button type="button" className="btn primary" onClick={() => router.push('/cursos')}>Voltar para Cursos</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 0 }}>
      {/* Header */}
      <div className="criar-header">
        <div className="criar-header-content">
          <h1>Criar Novo Curso</h1>
          <p>Compartilhe seus conhecimentos com a comunidade</p>
        </div>
      </div>

      {success ? (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          <div className="success-message" style={{ display: 'block' }}>
            <h3>Curso Enviado para Aprovação!</h3>
            <p>Seu curso foi enviado e será analisado por um administrador em breve.</p>
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
                  <small style={{ color: form.titulo.length === 60 ? 'var(--danger)' : 'var(--muted)' }}>{form.titulo.length}/60</small>
                </div>
                <input required maxLength={60} value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: React Masterclass — Do Zero ao Avançado" />
              </div>
              
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Descrição do Curso *</label>
                  <small style={{ color: form.descricao.length === 2000 ? 'var(--danger)' : 'var(--muted)' }}>{form.descricao.length}/2000</small>
                </div>
                <textarea required maxLength={2000} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descreva o que o aluno vai aprender, os pré-requisitos, e o que torna esse curso especial..." style={{ minHeight: '140px' }}></textarea>
              </div>
            </div>

            {/* Módulos */}
            <div className="criar-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="criar-section-title" style={{ margin: 0 }}>Módulos / Aulas</h2>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{modulos.length} {modulos.length === 1 ? 'módulo' : 'módulos'}</span>
              </div>
              
              {modulos.map((mod, idx) => (
                <div key={idx} className="criar-modulo-card">
                  <div className="criar-modulo-header">
                    <div className="criar-modulo-num">{idx + 1}</div>
                    <strong style={{ flex: 1 }}>Módulo {idx + 1}</strong>
                    {modulos.length > 1 && (
                      <button type="button" onClick={() => handleRemoveModulo(idx)} className="criar-modulo-remove">✕</button>
                    )}
                  </div>
                  
                  <div className="criar-modulo-fields">
                    <div className="form-field" style={{ flex: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>Título da Aula *</label>
                        <small style={{ color: mod.titulo.length === 255 ? 'var(--danger)' : 'var(--muted)' }}>{mod.titulo.length}/255</small>
                      </div>
                      <input required maxLength={255} value={mod.titulo} onChange={e => updateModulo(idx, 'titulo', e.target.value)} placeholder="Ex: Introdução ao React" />
                    </div>
                    <div className="form-field" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label>URL do Vídeo</label>
                        <small style={{ color: (mod.videoUrl || '').length === 255 ? 'var(--danger)' : 'var(--muted)' }}>{(mod.videoUrl || '').length}/255</small>
                      </div>
                      <input type="url" maxLength={255} value={mod.videoUrl} onChange={e => updateModulo(idx, 'videoUrl', e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                  </div>

                  <div className="form-field">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label>Descrição da Aula</label>
                      <small style={{ color: (mod.descricao || '').length === 2000 ? 'var(--danger)' : 'var(--muted)' }}>{(mod.descricao || '').length}/2000</small>
                    </div>
                    <textarea maxLength={2000} value={mod.descricao} onChange={e => updateModulo(idx, 'descricao', e.target.value)} placeholder="O que o aluno vai aprender nesta aula..." style={{ minHeight: '70px' }}></textarea>
                  </div>
                </div>
              ))}
              
              <button type="button" onClick={handleAddModulo} className="criar-add-modulo">
                + Adicionar Módulo
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
                    <span>Imagem</span>
                    <p>Clique para selecionar</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  required 
                  onChange={handleImageChange} 
                  className="criar-img-input"
                />
              </div>
              <small style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '8px', display: 'block' }}>
                Recomendado: 750×422px (16:9)
              </small>
            </div>

            {/* Configurações */}
            <div className="criar-section">
              <h2 className="criar-section-title">Configurações</h2>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="ATIVO">Ativo (Visível para alunos)</option>
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
                {isSubmitting ? 'Publicando...' : 'Publicar Curso'}
              </button>
              <Link href="/cursos" className="criar-cancel-btn">
                Cancelar
              </Link>
              {msg && <p className="auth-msg" style={{ marginTop: '12px' }}>{msg}</p>}
            </div>
          </aside>
        </form>
      )}
    </main>
  );
}
