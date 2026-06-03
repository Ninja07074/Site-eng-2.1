// Service de Inscrição com regras de negócio para inscrição de alunos em cursos
// Semana 3: reforça regras de inscrição (tipo ALUNO, curso ATIVO e sem duplicidade).

package com.projeto.backend.service;

import com.projeto.backend.domain.Curso;
import com.projeto.backend.domain.Inscricao;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.CursoRepository;
import com.projeto.backend.repository.InscricaoRepository;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InscricaoService {

    private final InscricaoRepository inscricaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public InscricaoService(InscricaoRepository inscricaoRepository,
                            UsuarioRepository usuarioRepository,
                            CursoRepository cursoRepository) {
        this.inscricaoRepository = inscricaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
    }

    // Semana 3: reforça regras de inscrição (tipo ALUNO, curso ATIVO e sem duplicidade).

    public Inscricao inscreverUsuarioEmCurso(Usuario usuario, Curso curso) {
        if (usuario == null || curso == null) {
            throw new IllegalArgumentException("Usuário e curso são obrigatórios para inscrição.");
        }

        if (usuario.getTipoUsuario() == null || !"ALUNO".equalsIgnoreCase(usuario.getTipoUsuario())) {
            throw new IllegalArgumentException("Apenas usuários do tipo ALUNO podem se inscrever em cursos.");
        }

        // Impede dupla inscrição no mesmo curso.
        Optional<Inscricao> inscricaoExistente = inscricaoRepository
                .findByUsuarioIdUsuarioAndCursoIdCurso(usuario.getIdUsuario(), curso.getIdCurso());
        if (inscricaoExistente.isPresent()) {
            throw new IllegalArgumentException("Usuário já está inscrito neste curso.");
        }

        // Permite inscrição apenas quando o curso está ativo.
        if (curso.getStatus() == null || !"ATIVO".equalsIgnoreCase(curso.getStatus())) {
            throw new IllegalArgumentException("O curso não está ativo para inscrições.");
        }

        // Define a data automaticamente no momento da inscrição.
        Inscricao inscricao = new Inscricao();
        inscricao.setUsuario(usuario);
        inscricao.setCurso(curso);
        inscricao.setDataInscricao(LocalDateTime.now());
        return inscricaoRepository.save(inscricao);
    }

    public Optional<Inscricao> buscarInscricaoPorId(String id) {
        return inscricaoRepository.findById(id);
    }

    public List<Inscricao> listarInscricoesPorUsuarioId(String usuarioId) {
        return inscricaoRepository.findByUsuarioIdUsuario(usuarioId);
    }
}
