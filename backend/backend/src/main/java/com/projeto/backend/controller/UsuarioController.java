// Controller REST para expor os endpoints relacionados à entidade Usuario.
// Segurança: endpoints protegidos com X-User-Id, DTOs para evitar vazamento de dados.
// REMOVIDO: endpoint secret-admin (vulnerabilidade crítica).

package com.projeto.backend.controller;

import com.projeto.backend.config.AuthHelper;
import com.projeto.backend.domain.Usuario;
import com.projeto.backend.dto.UsuarioLoginDTO;
import com.projeto.backend.dto.UsuarioPublicoDTO;
import com.projeto.backend.repository.UsuarioRepository;
import com.projeto.backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioService usuarioService, UsuarioRepository usuarioRepository) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<UsuarioLoginDTO> cadastrarUsuario(@RequestBody Usuario usuario) {
        Usuario novoUsuario = usuarioService.cadastrarUsuario(usuario);
        return new ResponseEntity<>(UsuarioLoginDTO.fromEntity(novoUsuario), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioLoginDTO> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String senha = payload.get("senha");
        Usuario usuario = usuarioService.login(email, senha);
        return ResponseEntity.ok(UsuarioLoginDTO.fromEntity(usuario));
    }

    /** Lista todos os usuários. Requer ADMIN. */
    @GetMapping
    public ResponseEntity<List<UsuarioPublicoDTO>> listarUsuarios(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        List<UsuarioPublicoDTO> dtos = usuarioService.listarUsuarios().stream()
                .map(UsuarioPublicoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioPublicoDTO> buscarUsuarioPorId(@PathVariable String id) {
        Optional<Usuario> usuario = usuarioService.buscarUsuarioPorId(id);
        return usuario.map(u -> ResponseEntity.ok(UsuarioPublicoDTO.fromEntity(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ===================== ADMIN: GERENCIAMENTO =====================

    /** Exclui um usuário. Requer ADMIN. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        usuarioService.excluirUsuario(id);
        return ResponseEntity.noContent().build();
    }

    /** Atualiza o tipo de um usuário. Requer ADMIN. */
    @PutMapping("/{id}/tipo")
    public ResponseEntity<UsuarioPublicoDTO> atualizarTipoUsuario(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        String novoTipo = body.get("tipoUsuario");
        Usuario usuario = usuarioService.atualizarTipoUsuario(id, novoTipo);
        return ResponseEntity.ok(UsuarioPublicoDTO.fromEntity(usuario));
    }

    // REMOVIDO: endpoint /secret-admin — vulnerabilidade de segurança crítica.
    // Admin deve ser criado diretamente no banco de dados ou via script seguro.
}
