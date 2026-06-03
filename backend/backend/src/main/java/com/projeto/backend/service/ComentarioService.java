package com.projeto.backend.service;

import com.projeto.backend.domain.Comentario;
import com.projeto.backend.domain.Modulo;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.ComentarioRepository;
import com.projeto.backend.repository.ModuloRepository;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ModuloRepository moduloRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoService notificacaoService;

    public ComentarioService(ComentarioRepository comentarioRepository,
                             ModuloRepository moduloRepository,
                             UsuarioRepository usuarioRepository,
                             NotificacaoService notificacaoService) {
        this.comentarioRepository = comentarioRepository;
        this.moduloRepository = moduloRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacaoService = notificacaoService;
    }

    public Comentario criarComentario(String usuarioId, String moduloId, String texto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new IllegalArgumentException("Módulo não encontrado."));

        Comentario comentario = new Comentario();
        comentario.setUsuario(usuario);
        comentario.setModulo(modulo);
        comentario.setTexto(texto);

        Comentario salvo = comentarioRepository.save(comentario);

        if (modulo.getCurso() != null && modulo.getCurso().getInstrutor() != null && !modulo.getCurso().getInstrutor().getIdUsuario().equals(usuarioId)) {
            notificacaoService.criarNotificacao(
                modulo.getCurso().getInstrutor().getIdUsuario(),
                usuario.getNome() + " comentou na aula '" + modulo.getTitulo() + "'.",
                "NOVO_COMENTARIO",
                modulo.getCurso().getIdCurso()
            );
        }

        return salvo;
    }

    public List<Comentario> listarComentariosPorModulo(String moduloId) {
        return comentarioRepository.findByModuloIdModuloOrderByDataCriacaoDesc(moduloId);
    }

    public Comentario atualizarComentario(String comentarioId, String usuarioId, String texto) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new IllegalArgumentException("Comentário não encontrado."));

        if (!comentario.getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new IllegalArgumentException("Você não tem permissão para editar este comentário.");
        }

        comentario.setTexto(texto);
        return comentarioRepository.save(comentario);
    }

    public void excluirComentario(String comentarioId, String usuarioId) {
        Comentario comentario = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new IllegalArgumentException("Comentário não encontrado."));

        if (!comentario.getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new IllegalArgumentException("Você não tem permissão para excluir este comentário.");
        }

        comentarioRepository.delete(comentario);
    }
}
