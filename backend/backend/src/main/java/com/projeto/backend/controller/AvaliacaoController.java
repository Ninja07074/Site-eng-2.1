package com.projeto.backend.controller;

import com.projeto.backend.domain.Avaliacao;
import com.projeto.backend.dto.AvaliacaoDTO;
import com.projeto.backend.service.AvaliacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoDTO> criarAvaliacao(@RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        String cursoId = (String) body.get("cursoId");
        Integer nota = null;
        if (body.get("nota") != null) {
            nota = Integer.parseInt(body.get("nota").toString());
        }
        String comentario = (String) body.get("comentario");

        Avaliacao avaliacao = avaliacaoService.criarAvaliacao(usuarioId, cursoId, nota, comentario);
        return new ResponseEntity<>(AvaliacaoDTO.fromEntity(avaliacao), HttpStatus.CREATED);
    }

    /** Lista avaliações de um curso — retorna DTO sem dados sensíveis do usuário. */
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<AvaliacaoDTO>> listarAvaliacoesPorCurso(@PathVariable String cursoId) {
        List<AvaliacaoDTO> dtos = avaliacaoService.listarAvaliacoesPorCurso(cursoId).stream()
                .map(AvaliacaoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvaliacaoDTO> atualizarAvaliacao(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        Integer nota = null;
        if (body.get("nota") != null) {
            nota = Integer.parseInt(body.get("nota").toString());
        }
        String comentario = (String) body.get("comentario");

        Avaliacao avaliacao = avaliacaoService.atualizarAvaliacao(id, usuarioId, nota, comentario);
        return ResponseEntity.ok(AvaliacaoDTO.fromEntity(avaliacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirAvaliacao(@PathVariable String id, @RequestParam String usuarioId) {
        avaliacaoService.excluirAvaliacao(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
