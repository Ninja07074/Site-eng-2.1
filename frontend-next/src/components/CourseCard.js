import Link from 'next/link';

export default function CourseCard({ curso, linkHref, linkText = 'Acessar' }) {
  const img = curso.imagemBase64 || '/assets/pagina de cursos.jpg';

  return (
    <article className="card">
      <img 
        src={img} 
        alt={curso.titulo} 
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/assets/pagina de cursos.jpg';
        }} 
      />
      <h3>{curso.titulo}</h3>
      <p>{curso.descricao || ''}</p>
      <Link href={linkHref || `/curso/${curso.idCurso}`} className="btn primary">
        {linkText}
      </Link>
    </article>
  );
}
