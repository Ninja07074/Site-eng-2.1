// Service de Curso com regras de negócio para criação, busca, listagem, aprovação e exclusão.
// Sprint 2: cursos criados ficam PENDENTE até serem aprovados por um ADMIN.

package com.projeto.backend.service;

import com.projeto.backend.domain.Curso;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.CursoRepository;
import com.projeto.backend.repository.InscricaoRepository;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscricaoRepository inscricaoRepository;
    private final NotificacaoService notificacaoService;

    public CursoService(CursoRepository cursoRepository,
                        UsuarioRepository usuarioRepository,
                        InscricaoRepository inscricaoRepository,
                        NotificacaoService notificacaoService) {
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inscricaoRepository = inscricaoRepository;
        this.notificacaoService = notificacaoService;
    }

    // ===================== CRIAÇÃO =====================

    public Curso criarCurso(Curso curso, String instrutorId) {
        Usuario instrutor = usuarioRepository.findById(instrutorId)
                .orElseThrow(() -> new IllegalArgumentException("Instrutor não encontrado."));

        if (!"INSTRUTOR".equalsIgnoreCase(instrutor.getTipoUsuario())) {
            throw new IllegalArgumentException("Apenas usuários do tipo INSTRUTOR podem criar cursos.");
        }

        curso.setInstrutor(instrutor);
        // Cursos novos nascem como PENDENTE até aprovação do admin
        curso.setStatus("PENDENTE");
        validarCurso(curso);
        return cursoRepository.save(curso);
    }

    // ===================== CONSULTAS =====================

    public Optional<Curso> buscarCursoPorId(String id) {
        return cursoRepository.findById(id);
    }

    /** Catálogo público — retorna apenas cursos ATIVOS (aprovados). */
    public List<Curso> listarCursos() {
        return cursoRepository.findByStatus("ATIVO");
    }

    public List<Curso> listarCursosPorInstrutor(String instrutorId) {
        return cursoRepository.findByInstrutorIdUsuario(instrutorId);
    }

    /** Painel admin — retorna cursos com status PENDENTE. */
    public List<Curso> listarCursosPendentes() {
        return cursoRepository.findByStatus("PENDENTE");
    }

    /** Painel admin — retorna todos os cursos do sistema. */
    public List<Curso> listarTodosCursos() {
        return cursoRepository.findAll();
    }

    // ===================== APROVAÇÃO (ADMIN) =====================

    /** Admin aprova um curso pendente, tornando-o visível no catálogo. */
    public Curso aprovarCurso(String cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        if (!"PENDENTE".equalsIgnoreCase(curso.getStatus())) {
            throw new IllegalArgumentException("Apenas cursos PENDENTES podem ser aprovados.");
        }

        curso.setStatus("ATIVO");
        curso.setMotivoRejeicao(null);
        Curso cursoAtualizado = cursoRepository.save(curso);
        
        if (cursoAtualizado.getInstrutor() != null) {
            notificacaoService.criarNotificacao(
                cursoAtualizado.getInstrutor().getIdUsuario(),
                "Seu curso '" + cursoAtualizado.getTitulo() + "' foi aprovado e já está disponível no catálogo!",
                "CURSO_APROVADO",
                cursoAtualizado.getIdCurso()
            );
        }
        
        return cursoAtualizado;
    }

    /** Admin rejeita um curso pendente, informando o motivo. */
    public Curso rejeitarCurso(String cursoId, String motivo) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        if (!"PENDENTE".equalsIgnoreCase(curso.getStatus())) {
            throw new IllegalArgumentException("Apenas cursos PENDENTES podem ser rejeitados.");
        }

        if (motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("O motivo da rejeição é obrigatório.");
        }

        curso.setStatus("REJEITADO");
        curso.setMotivoRejeicao(motivo.trim());
        Curso cursoAtualizado = cursoRepository.save(curso);
        
        if (cursoAtualizado.getInstrutor() != null) {
            notificacaoService.criarNotificacao(
                cursoAtualizado.getInstrutor().getIdUsuario(),
                "Seu curso '" + cursoAtualizado.getTitulo() + "' foi rejeitado. Motivo: " + motivo.trim(),
                "CURSO_REJEITADO",
                cursoAtualizado.getIdCurso()
            );
        }
        
        return cursoAtualizado;
    }

    /** Admin desativa um curso que já estava ativo. */
    public Curso desativarCurso(String cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        curso.setStatus("INATIVO");
        return cursoRepository.save(curso);
    }

    // ===================== EXCLUSÃO =====================

    @Transactional
    public void excluirCurso(String cursoId, String solicitanteId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        if (solicitanteId == null || solicitanteId.isEmpty()) {
            throw new IllegalArgumentException("Identificação do solicitante é obrigatória para excluir o curso.");
        }

        // Admin pode excluir qualquer curso; instrutor só o próprio.
        Usuario solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitante não encontrado."));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(solicitante.getTipoUsuario());
        boolean isOwner = curso.getInstrutor() != null && solicitanteId.equals(curso.getInstrutor().getIdUsuario());

        if (!isAdmin && !isOwner) {
            throw new IllegalArgumentException("Apenas o instrutor dono ou um administrador pode excluir o curso.");
        }

        cursoRepository.delete(curso);
    }

    // ===================== ATUALIZAÇÃO =====================

    @Transactional
    public Curso atualizarCurso(String id, String instrutorId, Curso dadosAtualizados, boolean novaImagem) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        if (curso.getInstrutor() == null || !curso.getInstrutor().getIdUsuario().equals(instrutorId)) {
            throw new IllegalArgumentException("Apenas o instrutor autor do curso pode editá-lo.");
        }

        curso.setTitulo(dadosAtualizados.getTitulo());
        curso.setDescricao(dadosAtualizados.getDescricao());
        
        if (dadosAtualizados.getVideoUrl() != null) {
            curso.setVideoUrl(dadosAtualizados.getVideoUrl());
        }

        if (dadosAtualizados.getStatus() != null) {
            if ("INATIVO".equalsIgnoreCase(dadosAtualizados.getStatus())) {
                curso.setStatus("INATIVO");
            } else {
                // Ao editar um curso, ele volta para PENDENTE de aprovação
                curso.setStatus("PENDENTE");
                curso.setMotivoRejeicao(null);
            }
        }

        if (novaImagem) {
            curso.setImagemBase64(dadosAtualizados.getImagemBase64());
        }

        validarCurso(curso);
        return cursoRepository.save(curso);
    }

    // ===================== VALIDAÇÃO =====================

    private void validarCurso(Curso curso) {
        if (curso == null) {
            throw new IllegalArgumentException("Dados do curso são obrigatórios.");
        }

        if (isBlank(curso.getTitulo()) || isBlank(curso.getDescricao())) {
            throw new IllegalArgumentException("Título e descrição do curso são obrigatórios.");
        }

        if (curso.getInstrutor() == null) {
            throw new IllegalArgumentException("Curso precisa de um instrutor responsável.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
