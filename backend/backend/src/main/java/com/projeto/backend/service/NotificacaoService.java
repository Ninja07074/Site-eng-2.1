package com.projeto.backend.service;

import com.projeto.backend.domain.Notificacao;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.NotificacaoRepository;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository, UsuarioRepository usuarioRepository) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Notificacao criarNotificacao(String usuarioId, String mensagem, String tipo, String cursoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Notificacao notificacao = new Notificacao();
        notificacao.setUsuario(usuario);
        notificacao.setMensagem(mensagem);
        notificacao.setTipo(tipo);
        notificacao.setCursoId(cursoId);

        return notificacaoRepository.save(notificacao);
    }

    public List<Notificacao> listarNotificacoes(String usuarioId) {
        return notificacaoRepository.findByUsuarioIdUsuarioOrderByDataCriacaoDesc(usuarioId);
    }

    public long contarNaoLidas(String usuarioId) {
        return notificacaoRepository.countByUsuarioIdUsuarioAndLidaFalse(usuarioId);
    }

    public Notificacao marcarComoLida(String idNotificacao) {
        Notificacao notificacao = notificacaoRepository.findById(idNotificacao)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada."));
        notificacao.setLida(true);
        return notificacaoRepository.save(notificacao);
    }

    public void excluirNotificacao(String idNotificacao) {
        Notificacao notificacao = notificacaoRepository.findById(idNotificacao)
                .orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada."));
        notificacaoRepository.delete(notificacao);
    }
}
