// DTO para respostas de Avaliação.
// Retorna apenas o nome do usuário — sem CPF, email ou ID.

package com.projeto.backend.dto;

import com.projeto.backend.domain.Avaliacao;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AvaliacaoDTO {

    private String idAvaliacao;
    private Integer nota;
    private String comentario;
    private LocalDateTime dataAvaliacao;
    private String nomeUsuario;   // Apenas o nome, sem dados sensíveis
    private String usuarioId;     // ID do usuário (necessário para o frontend identificar "minha avaliação")

    public static AvaliacaoDTO fromEntity(Avaliacao avaliacao) {
        AvaliacaoDTO dto = new AvaliacaoDTO();
        dto.setIdAvaliacao(avaliacao.getIdAvaliacao());
        dto.setNota(avaliacao.getNota());
        dto.setComentario(avaliacao.getComentario());
        dto.setDataAvaliacao(avaliacao.getDataAvaliacao());
        if (avaliacao.getUsuario() != null) {
            dto.setNomeUsuario(avaliacao.getUsuario().getNome());
            dto.setUsuarioId(avaliacao.getUsuario().getIdUsuario());
        }
        return dto;
    }
}
