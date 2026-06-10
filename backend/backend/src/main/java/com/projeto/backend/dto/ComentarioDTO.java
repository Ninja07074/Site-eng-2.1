// DTO para respostas de Comentário.
// Retorna apenas o nome do usuário — sem CPF, email ou dados sensíveis.

package com.projeto.backend.dto;

import com.projeto.backend.domain.Comentario;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComentarioDTO {

    private String idComentario;
    private String texto;
    private LocalDateTime dataCriacao;
    private String nomeUsuario;   // Apenas o nome, sem dados sensíveis
    private String usuarioId;     // ID do usuário (necessário para o frontend identificar "meu comentário")

    public static ComentarioDTO fromEntity(Comentario comentario) {
        ComentarioDTO dto = new ComentarioDTO();
        dto.setIdComentario(comentario.getIdComentario());
        dto.setTexto(comentario.getTexto());
        dto.setDataCriacao(comentario.getDataCriacao());
        if (comentario.getUsuario() != null) {
            dto.setNomeUsuario(comentario.getUsuario().getNome());
            dto.setUsuarioId(comentario.getUsuario().getIdUsuario());
        }
        return dto;
    }
}
