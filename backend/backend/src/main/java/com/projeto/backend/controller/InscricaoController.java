// Classe de controlador REST para expor os endpoints relacionados à entidade Inscricao
// Endpoints de inscrição; as regras de negócio ficam centralizadas no service.

package com.projeto.backend.controller;

import com.projeto.backend.domain.Curso;
import com.projeto.backend.domain.Inscricao;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.service.CursoService;
import com.projeto.backend.service.InscricaoService;
import com.projeto.backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/inscricoes")
public class InscricaoController {

    private final InscricaoService inscricaoService;
    private final UsuarioService usuarioService;
    private final CursoService cursoService;

    public InscricaoController(InscricaoService inscricaoService,
                               UsuarioService usuarioService,
                               CursoService cursoService) {
        this.inscricaoService = inscricaoService;
        this.usuarioService = usuarioService;
        this.cursoService = cursoService;
    }

    // Endpoints de inscrição; as regras de negócio ficam centralizadas no service.

    @PostMapping("/inscrever")
    public ResponseEntity<Inscricao> inscreverUsuarioEmCurso(@RequestParam String usuarioId, @RequestParam String cursoId) {
        Optional<Usuario> usuario = usuarioService.buscarUsuarioPorId(usuarioId);
        Optional<Curso> curso = cursoService.buscarCursoPorId(cursoId);

        // Só tenta inscrever quando os dois recursos existem.
        if (usuario.isPresent() && curso.isPresent()) {
            Inscricao inscricao = inscricaoService.inscreverUsuarioEmCurso(usuario.get(), curso.get());
            return new ResponseEntity<>(inscricao, HttpStatus.CREATED);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inscricao> buscarInscricaoPorId(@PathVariable String id) {
        Optional<Inscricao> inscricao = inscricaoService.buscarInscricaoPorId(id);
        return inscricao.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Inscricao>> listarInscricoesPorUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(inscricaoService.listarInscricoesPorUsuarioId(usuarioId));
    }
}
