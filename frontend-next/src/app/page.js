'use client';

import { useSession } from '@/hooks/useSession';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner';
import CourseCard from '@/components/CourseCard';
import { apiListarCursos } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Home() {
  const { session, isLoading } = useSession();
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const courses = await apiListarCursos();
        const published = courses.filter((c) => c.status === 'ATIVO');
        setHighlights(published.slice(0, 4));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <main>
      <HeroBanner 
        title="Aprenda e compartilhe conhecimento" 
        subtitle="Cursos gratuitos criados pela comunidade."
      >
        <Link className="btn primary" href="/cursos">Explorar Cursos</Link>
        {!isLoading && !session && (
          <Link className="btn" href="/login">Entrar / Cadastrar</Link>
        )}
      </HeroBanner>

      <section className="mission">
        <h2>Sobre Nós</h2>
        <p><strong>Partilhando o Saber</strong> é uma plataforma colaborativa para ensino e aprendizado. Totalmente gratuita, qualquer pessoa pode criar e compartilhar cursos sobre seus conhecimentos, habilidades e paixões.</p>
      </section>

      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0, fontSize: '1.6rem' }}>Por que se juntar?</h2>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--muted)', lineHeight: 2 }}>
              <li>✓ Cursos 100% gratuitos</li>
              <li>✓ Aprenda do seu jeito e hora</li>
              <li>✓ Compartilhe seus conhecimentos</li>
              <li>✓ Comunidade de educadores</li>
              <li>✓ Sem custo, sem mensalidade</li>
            </ul>
          </div>
          <div>
            <h2 style={{ marginTop: 0, fontSize: '1.6rem' }}>Como funciona?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong>1. Se inscreva</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>Crie sua conta gratuitamente</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong>2. Escolha um curso</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>Explore cursos de diversos temas</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong>3. Aprenda</strong>
                <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>Assista aulas e estude no seu ritmo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {highlights.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '40px auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Cursos em Destaque</h2>
          <div className="cards-grid">
            {highlights.map(c => <CourseCard key={c.idCurso} curso={c} />)}
          </div>
        </section>
      )}

      <section style={{ padding: '60px 40px', background: 'var(--card)', textAlign: 'center', marginTop: '40px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px' }}>Começar agora</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>Acesse nosso catálogo de cursos e comece a aprender hoje mesmo.</p>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Link href="/cursos" className="btn primary" style={{ padding: '12px 28px' }}>Explorar Cursos</Link>
            {!isLoading && session?.tipoUsuario === 'INSTRUTOR' && (
              <Link href="/criar-curso" className="btn" style={{ padding: '12px 28px' }}>Criar Curso</Link>
            )}
            {!isLoading && !session && (
              <Link href="/login" className="btn" style={{ padding: '12px 28px' }}>Entrar / Cadastrar</Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
