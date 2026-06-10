// DTO para resposta de login/cadastro.
// Inclui email (necessário para o frontend) mas sem CPF e sem senha.

package com.projeto.backend.dto;

import com.projeto.backend.domain.Usuario;
import lombok.Data;

@Data
public class UsuarioLoginDTO {

    private String idUsuario;
    private String nome;
    private String email;
    private String tipoUsuario;

    public static UsuarioLoginDTO fromEntity(Usuario usuario) {
        UsuarioLoginDTO dto = new UsuarioLoginDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setTipoUsuario(usuario.getTipoUsuario());
        return dto;
    }
}
