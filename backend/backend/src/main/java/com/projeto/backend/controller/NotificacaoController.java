package com.projeto.backend.controller;

import com.projeto.backend.domain.Notificacao;
import com.projeto.backend.service.NotificacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Notificacao>> listarNotificacoes(@PathVariable String usuarioId) {
        return ResponseEntity.ok(notificacaoService.listarNotificacoes(usuarioId));
    }

    @GetMapping("/usuario/{usuarioId}/count")
    public ResponseEntity<Map<String, Long>> contarNaoLidas(@PathVariable String usuarioId) {
        long count = notificacaoService.contarNaoLidas(usuarioId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<Notificacao> marcarComoLida(@PathVariable String id) {
        return ResponseEntity.ok(notificacaoService.marcarComoLida(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirNotificacao(@PathVariable String id) {
        notificacaoService.excluirNotificacao(id);
        return ResponseEntity.noContent().build();
    }
}
