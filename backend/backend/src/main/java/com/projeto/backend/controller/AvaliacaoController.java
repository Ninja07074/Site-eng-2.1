package com.projeto.backend.controller;

import com.projeto.backend.domain.Avaliacao;
import com.projeto.backend.service.AvaliacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<Avaliacao> criarAvaliacao(@RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        String cursoId = (String) body.get("cursoId");
        Integer nota = null;
        if (body.get("nota") != null) {
            nota = Integer.parseInt(body.get("nota").toString());
        }
        String comentario = (String) body.get("comentario");

        Avaliacao avaliacao = avaliacaoService.criarAvaliacao(usuarioId, cursoId, nota, comentario);
        return new ResponseEntity<>(avaliacao, HttpStatus.CREATED);
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Avaliacao>> listarAvaliacoesPorCurso(@PathVariable String cursoId) {
        List<Avaliacao> avaliacoes = avaliacaoService.listarAvaliacoesPorCurso(cursoId);
        return ResponseEntity.ok(avaliacoes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Avaliacao> atualizarAvaliacao(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        Integer nota = null;
        if (body.get("nota") != null) {
            nota = Integer.parseInt(body.get("nota").toString());
        }
        String comentario = (String) body.get("comentario");

        Avaliacao avaliacao = avaliacaoService.atualizarAvaliacao(id, usuarioId, nota, comentario);
        return ResponseEntity.ok(avaliacao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirAvaliacao(@PathVariable String id, @RequestParam String usuarioId) {
        avaliacaoService.excluirAvaliacao(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
