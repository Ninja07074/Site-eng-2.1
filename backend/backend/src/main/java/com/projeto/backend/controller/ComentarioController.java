package com.projeto.backend.controller;

import com.projeto.backend.domain.Comentario;
import com.projeto.backend.service.ComentarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/comentarios")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @PostMapping
    public ResponseEntity<Comentario> criarComentario(@RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        String moduloId = (String) body.get("moduloId");
        String texto = (String) body.get("texto");

        Comentario comentario = comentarioService.criarComentario(usuarioId, moduloId, texto);
        return new ResponseEntity<>(comentario, HttpStatus.CREATED);
    }

    @GetMapping("/modulo/{moduloId}")
    public ResponseEntity<List<Comentario>> listarComentariosPorModulo(@PathVariable String moduloId) {
        List<Comentario> comentarios = comentarioService.listarComentariosPorModulo(moduloId);
        return ResponseEntity.ok(comentarios);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comentario> atualizarComentario(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String usuarioId = (String) body.get("usuarioId");
        String texto = (String) body.get("texto");

        Comentario comentario = comentarioService.atualizarComentario(id, usuarioId, texto);
        return ResponseEntity.ok(comentario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirComentario(@PathVariable String id, @RequestParam String usuarioId) {
        comentarioService.excluirComentario(id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}
