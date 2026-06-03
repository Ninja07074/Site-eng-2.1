export default function HeroBanner({ title, subtitle, backgroundImage, children }) {
  const bgImage = backgroundImage || '/assets/Fundo do site.jpg';

  return (
    <section className="hero" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className="hero-overlay"></div>
      <div className="hero-text">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {children && <div className="hero-actions">{children}</div>}
      </div>
    </section>
  );
}
