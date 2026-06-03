package com.projeto.backend.service;

import com.projeto.backend.domain.Avaliacao;
import com.projeto.backend.domain.Curso;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.AvaliacaoRepository;
import com.projeto.backend.repository.CursoRepository;
import com.projeto.backend.repository.InscricaoRepository;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscricaoRepository inscricaoRepository;
    private final NotificacaoService notificacaoService;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                            CursoRepository cursoRepository,
                            UsuarioRepository usuarioRepository,
                            InscricaoRepository inscricaoRepository,
                            NotificacaoService notificacaoService) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inscricaoRepository = inscricaoRepository;
        this.notificacaoService = notificacaoService;
    }

    public Avaliacao criarAvaliacao(String usuarioId, String cursoId, Integer nota, String comentario) {
        if (nota == null || nota < 1 || nota > 5) {
            throw new IllegalArgumentException("A nota deve ser entre 1 e 5 estrelas.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        // Verifica se o usuário está inscrito no curso
        boolean isEmrolled = inscricaoRepository.findByUsuarioIdUsuario(usuarioId).stream()
                .anyMatch(inscricao -> inscricao.getCurso().getIdCurso().equals(cursoId));

        if (!isEmrolled) {
            throw new IllegalArgumentException("Apenas alunos inscritos podem avaliar este curso.");
        }

        // Verifica se já avaliou
        Optional<Avaliacao> existente = avaliacaoRepository.findByUsuarioIdUsuarioAndCursoIdCurso(usuarioId, cursoId);
        if (existente.isPresent()) {
            throw new IllegalArgumentException("Você já avaliou este curso.");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setCurso(curso);
        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);

        Avaliacao salva = avaliacaoRepository.save(avaliacao);

        // Notifica o instrutor dono do curso
        if (curso.getInstrutor() != null && !curso.getInstrutor().getIdUsuario().equals(usuarioId)) {
            notificacaoService.criarNotificacao(
                curso.getInstrutor().getIdUsuario(),
                usuario.getNome() + " avaliou seu curso '" + curso.getTitulo() + "' com " + nota + " estrelas.",
                "NOVA_AVALIACAO",
                curso.getIdCurso()
            );
        }

        return salva;
    }

    public List<Avaliacao> listarAvaliacoesPorCurso(String cursoId) {
        return avaliacaoRepository.findByCursoIdCursoOrderByDataAvaliacaoDesc(cursoId);
    }

    public Avaliacao atualizarAvaliacao(String idAvaliacao, String usuarioId, Integer nota, String comentario) {
        if (nota == null || nota < 1 || nota > 5) {
            throw new IllegalArgumentException("A nota deve ser entre 1 e 5 estrelas.");
        }

        Avaliacao avaliacao = avaliacaoRepository.findById(idAvaliacao)
                .orElseThrow(() -> new IllegalArgumentException("Avaliação não encontrada."));

        if (!avaliacao.getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new IllegalArgumentException("Você não tem permissão para editar esta avaliação.");
        }

        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        return avaliacaoRepository.save(avaliacao);
    }

    public void excluirAvaliacao(String idAvaliacao, String usuarioId) {
        Avaliacao avaliacao = avaliacaoRepository.findById(idAvaliacao)
                .orElseThrow(() -> new IllegalArgumentException("Avaliação não encontrada."));

        if (!avaliacao.getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new IllegalArgumentException("Você não tem permissão para excluir esta avaliação.");
        }

        avaliacaoRepository.delete(avaliacao);
    }
}
