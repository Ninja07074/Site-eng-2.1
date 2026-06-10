// Controller REST para expor os endpoints relacionados à entidade Inscricao.
// Segurança: retorna InscricaoDTO para evitar vazamento de dados sensíveis.

package com.projeto.backend.controller;

import com.projeto.backend.domain.Curso;
import com.projeto.backend.domain.Inscricao;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.dto.InscricaoDTO;
import com.projeto.backend.service.CursoService;
import com.projeto.backend.service.InscricaoService;
import com.projeto.backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public ResponseEntity<InscricaoDTO> inscreverUsuarioEmCurso(@RequestParam String usuarioId, @RequestParam String cursoId) {
        Optional<Usuario> usuario = usuarioService.buscarUsuarioPorId(usuarioId);
        Optional<Curso> curso = cursoService.buscarCursoPorId(cursoId);

        // Só tenta inscrever quando os dois recursos existem.
        if (usuario.isPresent() && curso.isPresent()) {
            Inscricao inscricao = inscricaoService.inscreverUsuarioEmCurso(usuario.get(), curso.get());
            return new ResponseEntity<>(InscricaoDTO.fromEntity(inscricao), HttpStatus.CREATED);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<InscricaoDTO> buscarInscricaoPorId(@PathVariable String id) {
        Optional<Inscricao> inscricao = inscricaoService.buscarInscricaoPorId(id);
        return inscricao.map(i -> ResponseEntity.ok(InscricaoDTO.fromEntity(i)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<InscricaoDTO>> listarInscricoesPorUsuario(@PathVariable String usuarioId) {
        List<InscricaoDTO> dtos = inscricaoService.listarInscricoesPorUsuarioId(usuarioId).stream()
                .map(InscricaoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
