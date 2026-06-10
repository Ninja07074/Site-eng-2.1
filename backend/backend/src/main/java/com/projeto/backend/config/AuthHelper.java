// Utilitário de verificação de permissões.
// Lê o header X-User-Id e verifica o tipo do usuário no banco.

package com.projeto.backend.config;

import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class AuthHelper {

    public static Usuario requireAdmin(String userId, UsuarioRepository repo) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Autenticação necessária.");
        }
        Usuario usuario = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não encontrado."));
        if (!"ADMIN".equalsIgnoreCase(usuario.getTipoUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado. Permissão de administrador necessária.");
        }
        return usuario;
    }

    public static Usuario requireInstrutor(String userId, UsuarioRepository repo) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Autenticação necessária.");
        }
        Usuario usuario = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não encontrado."));
        if (!"INSTRUTOR".equalsIgnoreCase(usuario.getTipoUsuario())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado. Permissão de instrutor necessária.");
        }
        return usuario;
    }

    public static Usuario requireLoggedIn(String userId, UsuarioRepository repo) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Autenticação necessária.");
        }
        return repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário não encontrado."));
    }
}
