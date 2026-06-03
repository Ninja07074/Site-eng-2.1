'use client';

function extrairIdYoutube(url) {
  if (!url) return null;
  
  url = url.trim();
  let idVideo = null;
  
  if (url.includes('youtube.com') && url.includes('watch')) {
      const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (match) idVideo = match[1];
  } else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match) idVideo = match[1];
  } else if (url.includes('embed/')) {
      const match = url.match(/embed\/([a-zA-Z0-9_-]+)/);
      if (match) idVideo = match[1];
  }
  
  return idVideo;
}

export default function YouTubePlayer({ videoUrl }) {
  if (!videoUrl || !videoUrl.trim()) {
    return (
      <div className="lesson-video">
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
          Esta aula não possui vídeo
        </p>
      </div>
    );
  }

  const idVideo = extrairIdYoutube(videoUrl);

  if (idVideo) {
    const embedUrl = `https://www.youtube.com/embed/${idVideo}`;
    return (
      <div className="lesson-video">
        <iframe 
          width="100%" 
          height="100%" 
          src={embedUrl}
          style={{ border: 'none', borderRadius: '12px' }} 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div className="lesson-video">
      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
        URL de vídeo inválida. Use um link do YouTube válido (youtube.com ou youtu.be)
      </p>
    </div>
  );
}
