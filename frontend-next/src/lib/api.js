const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Recupera o userId da sessão no localStorage (se existir).
 * Usado para enviar o header X-User-Id em requisições autenticadas.
 */
function getSessionUserId() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ps_session_v1');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.userId || null;
  } catch {
    return null;
  }
}

async function apiRequest(path, options) {
  const userId = getSessionUserId();
  const headers = {
    'Content-Type': 'application/json',
    ...(userId ? { 'X-User-Id': userId } : {}),
    ...(options?.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers,
    ...options
  });

  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      payload = raw;
    }
  }

  if (!response.ok) {
    const message = (payload && payload.erro) || `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export function apiListarCursos() {
  return apiRequest('/cursos', { method: 'GET' });
}

export function apiBuscarCurso(idCurso) {
  return apiRequest(`/cursos/${idCurso}`, { method: 'GET' });
}

export function apiListarCursosPorInstrutor(instrutorId) {
  return apiRequest(`/cursos/instrutor/${encodeURIComponent(instrutorId)}`, { method: 'GET' });
}

export function apiCadastrarUsuario(dados) {
  return apiRequest('/usuarios/cadastrar', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export function apiLogin(email, senha) {
  return apiRequest('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha })
  });
}

export function apiBuscarUsuario(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}`, { method: 'GET' });
}

export function apiCriarCurso(instrutorId, curso) {
  return apiRequest(`/cursos/criar?instrutorId=${encodeURIComponent(instrutorId)}`, {
    method: 'POST',
    body: JSON.stringify(curso)
  });
}

export function apiExcluirCurso(idCurso, instrutorId) {
  return apiRequest(`/cursos/${encodeURIComponent(idCurso)}?instrutorId=${encodeURIComponent(instrutorId)}`, {
    method: 'DELETE'
  });
}

export function apiCriarCursoComImagem(instrutorId, dados) {
  const formData = new FormData();
  formData.append('instrutorId', instrutorId);
  formData.append('titulo', dados.titulo);
  formData.append('descricao', dados.descricao);
  formData.append('videoUrl', dados.videoUrl || '');
  formData.append('status', dados.status);
  formData.append('imagem', dados.imagem);

  const userId = getSessionUserId();
  return fetch(`${API_BASE_URL}/cursos/criar`, {
    method: 'POST',
    headers: userId ? { 'X-User-Id': userId } : {},
    body: formData
  }).then(async response => {
    const raw = await response.text();
    let payload = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        payload = raw;
      }
    }

    if (!response.ok) {
      const message = (payload && payload.erro) || `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    return payload;
  });
}

export function apiInscrever(usuarioId, cursoId) {
  return apiRequest(`/inscricoes/inscrever?usuarioId=${encodeURIComponent(usuarioId)}&cursoId=${encodeURIComponent(cursoId)}`, {
    method: 'POST'
  });
}

export function apiListarInscricoesPorUsuario(usuarioId) {
  return apiRequest(`/inscricoes/usuario/${usuarioId}`, { method: 'GET' });
}

export function apiCriarModulo(cursoId, modulo) {
  return apiRequest(`/modulos/criar?cursoId=${encodeURIComponent(cursoId)}`, {
    method: 'POST',
    body: JSON.stringify(modulo)
  });
}

export function apiListarModulosPorCurso(cursoId) {
  return apiRequest(`/modulos/curso/${cursoId}`, { method: 'GET' });
}

export function apiEditarCursoComImagem(idCurso, instrutorId, dados) {
  const formData = new FormData();
  formData.append('instrutorId', instrutorId);
  formData.append('titulo', dados.titulo);
  formData.append('descricao', dados.descricao);
  formData.append('videoUrl', dados.videoUrl || '');
  formData.append('status', dados.status);
  if (dados.imagem) {
    formData.append('imagem', dados.imagem);
  }

  const userId = getSessionUserId();
  return fetch(`${API_BASE_URL}/cursos/${encodeURIComponent(idCurso)}/editar`, {
    method: 'POST',
    headers: userId ? { 'X-User-Id': userId } : {},
    body: formData
  }).then(async response => {
    const raw = await response.text();
    let payload = null;
    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        payload = raw;
      }
    }

    if (!response.ok) {
      const message = (payload && payload.erro) || `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    return payload;
  });
}

export function apiAtualizarModulo(idModulo, modulo) {
  return apiRequest(`/modulos/${encodeURIComponent(idModulo)}`, {
    method: 'PUT',
    body: JSON.stringify(modulo)
  });
}

export function apiExcluirModulo(idModulo) {
  return apiRequest(`/modulos/${encodeURIComponent(idModulo)}`, {
    method: 'DELETE'
  });
}

// ===================== ADMIN: APROVAÇÃO =====================

export function apiListarCursosPendentes() {
  return apiRequest('/cursos/pendentes', { method: 'GET' });
}

export function apiListarTodosCursos() {
  return apiRequest('/cursos/todos', { method: 'GET' });
}

export function apiAprovarCurso(idCurso) {
  return apiRequest(`/cursos/${idCurso}/aprovar`, { method: 'PUT' });
}

export function apiRejeitarCurso(idCurso, motivo) {
  return apiRequest(`/cursos/${idCurso}/rejeitar`, {
    method: 'PUT',
    body: JSON.stringify({ motivo })
  });
}

export function apiDesativarCurso(idCurso) {
  return apiRequest(`/cursos/${idCurso}/desativar`, { method: 'PUT' });
}

// ===================== ADMIN: USUÁRIOS =====================

export function apiListarUsuarios() {
  return apiRequest('/usuarios', { method: 'GET' });
}

export function apiExcluirUsuario(idUsuario) {
  return apiRequest(`/usuarios/${idUsuario}`, { method: 'DELETE' });
}

export function apiAtualizarTipoUsuario(idUsuario, novoTipo) {
  return apiRequest(`/usuarios/${idUsuario}/tipo`, {
    method: 'PUT',
    body: JSON.stringify({ tipoUsuario: novoTipo })
  });
}

// ===================== AVALIAÇÕES =====================

export function apiCriarAvaliacao(dados) {
  return apiRequest('/avaliacoes', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export function apiAtualizarAvaliacao(idAvaliacao, dados) {
  return apiRequest(`/avaliacoes/${idAvaliacao}`, {
    method: 'PUT',
    body: JSON.stringify(dados)
  });
}

export function apiExcluirAvaliacao(idAvaliacao, usuarioId) {
  return apiRequest(`/avaliacoes/${idAvaliacao}?usuarioId=${encodeURIComponent(usuarioId)}`, {
    method: 'DELETE'
  });
}

export function apiListarAvaliacoes(cursoId) {
  return apiRequest(`/avaliacoes/curso/${cursoId}`, { method: 'GET' });
}

// ===================== COMENTÁRIOS (Aulas) =====================

export function apiCriarComentario(dados) {
  return apiRequest('/comentarios', {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export function apiListarComentariosPorModulo(moduloId) {
  return apiRequest(`/comentarios/modulo/${moduloId}`, { method: 'GET' });
}

export function apiAtualizarComentario(idComentario, dados) {
  return apiRequest(`/comentarios/${idComentario}`, {
    method: 'PUT',
    body: JSON.stringify(dados)
  });
}

export function apiExcluirComentario(idComentario, usuarioId) {
  return apiRequest(`/comentarios/${idComentario}?usuarioId=${encodeURIComponent(usuarioId)}`, {
    method: 'DELETE'
  });
}

// ===================== NOTIFICAÇÕES =====================

export function apiListarNotificacoes(usuarioId) {
  return apiRequest(`/notificacoes/usuario/${usuarioId}`, { method: 'GET' });
}

export function apiContarNotificacoesNaoLidas(usuarioId) {
  return apiRequest(`/notificacoes/usuario/${usuarioId}/count`, { method: 'GET' });
}

export function apiMarcarNotificacaoComoLida(idNotificacao) {
  return apiRequest(`/notificacoes/${idNotificacao}/lida`, { method: 'PUT' });
}

export function apiExcluirNotificacao(idNotificacao) {
  return apiRequest(`/notificacoes/${idNotificacao}`, { method: 'DELETE' });
}
