package com.projeto.backend.controller;

import com.projeto.backend.domain.Comentario;
import com.projeto.backend.dto.ComentarioDTO;
import com.projeto.backend.service.ComentarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/comentarios")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @PostMapping
    public ResponseEntity<ComentarioDTO> criarComentario(@RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        String moduloId = (String) body.get("moduloId");
        String texto = (String) body.get("texto");

        Comentario comentario = comentarioService.criarComentario(usuarioId, moduloId, texto);
        return new ResponseEntity<>(ComentarioDTO.fromEntity(comentario), HttpStatus.CREATED);
    }

    /** Lista comentários de um módulo — retorna DTO sem dados sensíveis do usuário. */
    @GetMapping("/modulo/{moduloId}")
    public ResponseEntity<List<ComentarioDTO>> listarComentariosPorModulo(@PathVariable String moduloId) {
        List<ComentarioDTO> dtos = comentarioService.listarComentariosPorModulo(moduloId).stream()
                .map(ComentarioDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComentarioDTO> atualizarComentario(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        String texto = (String) body.get("texto");

        Comentario comentario = comentarioService.atualizarComentario(id, usuarioId, texto);
        return ResponseEntity.ok(ComentarioDTO.fromEntity(comentario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirComentario(@PathVariable String id, @RequestParam String usuarioId) {
        comentarioService.excluirComentario(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
