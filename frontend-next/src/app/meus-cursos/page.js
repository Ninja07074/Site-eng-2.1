'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { apiListarInscricoesPorUsuario, apiListarCursosPorInstrutor } from '@/lib/api';
import CourseCard from '@/components/CourseCard';

export default function MeusCursosPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const [cursos, setCursos] = useState([]);
  const [cursosCriados, setCursosCriados] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      if (isLoading) return;
      if (!session) {
        router.push('/login');
        return;
      }
      try {
        const inscricoes = await apiListarInscricoesPorUsuario(session.userId);
        // InscricaoDTO retorna campos flat (cursoId, cursoTitulo, etc) ao invés do objeto curso aninhado
        const uniqueCourses = inscricoes
          .filter(insc => !!insc.cursoId)
          .map(insc => ({
            idCurso: insc.cursoId,
            titulo: insc.cursoTitulo,
            imagemBase64: insc.cursoImagemBase64,
            status: insc.cursoStatus
          }))
          .filter((c, index, self) => self.findIndex(x => x.idCurso === c.idCurso) === index);
        
        setCursos(uniqueCourses);

        if (session.tipoUsuario === 'INSTRUTOR' || session.tipoUsuario === 'ADMIN') {
          const criados = await apiListarCursosPorInstrutor(session.userId);
          setCursosCriados(criados);
        }
      } catch (err) {
        setErrorMsg('Erro ao carregar dados.');
      }
    }
    loadData();
  }, [session, isLoading, router]);

  if (isLoading) return <main style={{ padding: '40px', textAlign: 'center' }}><p>Carregando...</p></main>;
  if (!session) return null;

  return (
    <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '32px' }}>Meus Cursos</h2>
      
      {errorMsg && <p style={{ color: 'var(--danger)' }}>{errorMsg}</p>}
      
      {/* Seção 1: Cursos em que estou inscrito */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', marginTop: '16px' }}>Cursos que estou inscrito</h3>
      {!errorMsg && cursos.length === 0 ? (
        <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '24px' }}>Você ainda não está inscrito em nenhum curso.</p>
          <button className="btn primary" onClick={() => router.push('/cursos')}>Explorar cursos</button>
        </div>
      ) : (
        <div className="cards-grid" style={{ padding: 0 }}>
          {cursos.map(c => (
            <CourseCard key={c.idCurso} curso={c} linkHref={`/aula/${c.idCurso}`} linkText="Acessar Aula" />
          ))}
        </div>
      )}

      {/* Seção 2: Cursos criados por mim (Apenas Instrutor/Admin) */}
      {(session.tipoUsuario === 'INSTRUTOR' || session.tipoUsuario === 'ADMIN') && (
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Cursos criados por mim</h3>
          {cursosCriados.length === 0 ? (
            <div style={{ background: 'var(--card)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '24px' }}>Você ainda não criou nenhum curso.</p>
              <button className="btn secondary" onClick={() => router.push('/criar-curso')}>Criar Novo Curso</button>
            </div>
          ) : (
            <div className="cards-grid" style={{ padding: 0 }}>
              {cursosCriados.map(c => (
                <CourseCard key={c.idCurso} curso={c} linkHref={`/curso/${c.idCurso}`} linkText="Ver Detalhes" />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
