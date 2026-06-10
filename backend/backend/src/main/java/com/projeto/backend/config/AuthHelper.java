// Utilitário de verificação de permissões.
// Lê o header X-User-Id e verifica o tipo do usuário no banco.

package com.projeto.backend.config;

import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.UsuarioRepository;

public class AuthHelper {

    /**
     * Verifica se o userId corresponde a um ADMIN.
     * @throws IllegalArgumentException se não for ADMIN ou userId inválido.
     */
    public static Usuario requireAdmin(String userId, UsuarioRepository repo) {
        if (userId == null || userId.isBlank()) {
            throw new SecurityException("Autenticação necessária.");
        }
        Usuario usuario = repo.findById(userId)
                .orElseThrow(() -> new SecurityException("Usuário não encontrado."));
        if (!"ADMIN".equalsIgnoreCase(usuario.getTipoUsuario())) {
            throw new SecurityException("Acesso negado. Permissão de administrador necessária.");
        }
        return usuario;
    }

    /**
     * Verifica se o userId corresponde a um INSTRUTOR.
     * @throws SecurityException se não for INSTRUTOR ou userId inválido.
     */
    public static Usuario requireInstrutor(String userId, UsuarioRepository repo) {
        if (userId == null || userId.isBlank()) {
            throw new SecurityException("Autenticação necessária.");
        }
        Usuario usuario = repo.findById(userId)
                .orElseThrow(() -> new SecurityException("Usuário não encontrado."));
        if (!"INSTRUTOR".equalsIgnoreCase(usuario.getTipoUsuario())) {
            throw new SecurityException("Acesso negado. Permissão de instrutor necessária.");
        }
        return usuario;
    }

    /**
     * Verifica se o userId é válido (qualquer tipo de usuário logado).
     * @throws SecurityException se userId inválido.
     */
    public static Usuario requireLoggedIn(String userId, UsuarioRepository repo) {
        if (userId == null || userId.isBlank()) {
            throw new SecurityException("Autenticação necessária.");
        }
        return repo.findById(userId)
                .orElseThrow(() -> new SecurityException("Usuário não encontrado."));
    }
}
