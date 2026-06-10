// DTO para respostas públicas de Usuário.
// Retorna apenas dados seguros — sem CPF, email ou senha.

package com.projeto.backend.dto;

import com.projeto.backend.domain.Usuario;
import lombok.Data;

@Data
public class UsuarioPublicoDTO {

    private String idUsuario;
    private String nome;
    private String tipoUsuario;

    public static UsuarioPublicoDTO fromEntity(Usuario usuario) {
        UsuarioPublicoDTO dto = new UsuarioPublicoDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setNome(usuario.getNome());
        dto.setTipoUsuario(usuario.getTipoUsuario());
        return dto;
    }
}
