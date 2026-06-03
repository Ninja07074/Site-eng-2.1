'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner';
import CourseCard from '@/components/CourseCard';
import { apiListarCursos } from '@/lib/api';
import { useSession } from '@/hooks/useSession';

export default function CursosPage() {
  const { session } = useSession();
  const [cursos, setCursos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchCursos() {
      try {
        const data = await apiListarCursos();
        setCursos(data);
      } catch (err) {
        setErrorMsg(err.message || 'Erro ao carregar cursos.');
      }
    }
    fetchCursos();
  }, []);

  const displayedCourses = cursos.filter(c => {
    if (filter === 'published' && c.status !== 'ATIVO') return false;
    if (filter === 'pending' && c.status !== 'INATIVO') return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.titulo?.toLowerCase().includes(q) && !c.descricao?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sort === 'az') return (a.titulo || '').localeCompare(b.titulo || '');
    return (b.idCurso || 0) - (a.idCurso || 0); // newest first (simulated by ID)
  });

  return (
    <main>
      <HeroBanner 
        title="Catálogo de Cursos" 
        subtitle="Explore cursos gratuitos criados por nossa comunidade."
        backgroundImage="/assets/pagina de cursos.jpg"
      />

      <section style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px', background: 'var(--card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <input 
              placeholder="Buscar cursos..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ flex: 1 }}
            />
            
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="pending">Aguardando aprovação</option>
            </select>
            
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto' }}>
              <option value="newest">Mais recentes</option>
              <option value="az">A → Z</option>
            </select>
          </div>
          
          <div style={{ color: 'var(--muted)', fontWeight: 500 }}>{displayedCourses.length} cursos encontrados</div>
          
          {session?.tipoUsuario === 'INSTRUTOR' && (
            <Link href="/criar-curso" className="btn primary" style={{ marginLeft: 'auto' }}>
              + Solicitar Curso
            </Link>
          )}
        </div>

        {errorMsg ? (
          <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{errorMsg}</p>
        ) : (
          <div className="cards-grid" style={{ padding: 0 }}>
            {displayedCourses.map(c => <CourseCard key={c.idCurso} curso={c} />)}
          </div>
        )}
      </section>
    </main>
  );
}
