// Classe de controlador REST para expor os endpoints relacionados à entidade Usuario
// A anotação @RestController indica que esta classe é um controlador REST
// A anotação @RequestMapping define o caminho base para os endpoints desta classe
// O método cadastrarUsuario é um endpoint POST para cadastrar um novo usuário
// O método buscarUsuarioPorId é um endpoint GET para buscar um usuário pelo ID

package com.projeto.backend.controller;

import com.projeto.backend.domain.Usuario;
import com.projeto.backend.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<Usuario> cadastrarUsuario(@RequestBody Usuario usuario) {
        Usuario novoUsuario = usuarioService.cadastrarUsuario(usuario);
        return new ResponseEntity<>(novoUsuario, HttpStatus.CREATED);
    }

    // Semana 4: adiciona listagem e login para fechar o fluxo principal da API.
    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String senha = payload.get("senha");
        Usuario usuario = usuarioService.login(email, senha);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarUsuarioPorId(@PathVariable String id) {
        Optional<Usuario> usuario = usuarioService.buscarUsuarioPorId(id);
        return usuario.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ===================== ADMIN: GERENCIAMENTO =====================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable String id) {
        usuarioService.excluirUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/tipo")
    public ResponseEntity<Usuario> atualizarTipoUsuario(@PathVariable String id, @RequestBody Map<String, String> body) {
        String novoTipo = body.get("tipoUsuario");
        Usuario usuario = usuarioService.atualizarTipoUsuario(id, novoTipo);
        return ResponseEntity.ok(usuario);
    }

    // ===================== SECRET ADMIN ENDPOINT =====================
    @GetMapping("/secret-admin")
    public ResponseEntity<String> createSecretAdmin() {
        try {
            Usuario admin = new Usuario();
            admin.setNome("Administrador");
            admin.setEmail("admin@gmail.com");
            admin.setSenha("12345");
            admin.setCpf("000.000.000-00");
            admin.setTipoUsuario("ADMIN");
            
            // Cadastra normal
            usuarioService.cadastrarUsuario(admin);
            
            // Força a alteração para ADMIN, pois o cadastrarUsuario muda para ALUNO por padrão
            Optional<Usuario> salvo = usuarioService.listarUsuarios().stream()
                .filter(u -> u.getEmail().equals("admin@gmail.com"))
                .findFirst();
                
            if (salvo.isPresent()) {
                usuarioService.atualizarTipoUsuario(salvo.get().getIdUsuario(), "ADMIN");
            }
            
            return ResponseEntity.ok("Admin criado com sucesso! Email: admin@gmail.com | Senha: 12345");
        } catch (IllegalArgumentException e) {
            if (e.getMessage().equals("Email já cadastrado.")) {
                // Se já existir, forçamos ele a ser ADMIN
                Optional<Usuario> salvo = usuarioService.listarUsuarios().stream()
                    .filter(u -> u.getEmail().equals("admin@gmail.com"))
                    .findFirst();
                if (salvo.isPresent()) {
                    usuarioService.atualizarTipoUsuario(salvo.get().getIdUsuario(), "ADMIN");
                    return ResponseEntity.ok("O usuário admin@gmail.com já existia e foi promovido a ADMIN!");
                }
            }
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        }
    }
}
