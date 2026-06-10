// DTO para respostas de Inscrição.
// Retorna apenas o ID da inscrição, o ID do curso e a data.
// Evita vazar dados sensíveis do usuário e do instrutor do curso.

package com.projeto.backend.dto;

import com.projeto.backend.domain.Inscricao;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InscricaoDTO {

    private String idInscricao;
    private String cursoId;
    private String cursoTitulo;
    private String cursoImagemBase64;
    private String cursoStatus;
    private LocalDateTime dataInscricao;

    public static InscricaoDTO fromEntity(Inscricao inscricao) {
        InscricaoDTO dto = new InscricaoDTO();
        dto.setIdInscricao(inscricao.getIdInscricao());
        dto.setDataInscricao(inscricao.getDataInscricao());
        if (inscricao.getCurso() != null) {
            dto.setCursoId(inscricao.getCurso().getIdCurso());
            dto.setCursoTitulo(inscricao.getCurso().getTitulo());
            dto.setCursoImagemBase64(inscricao.getCurso().getImagemBase64());
            dto.setCursoStatus(inscricao.getCurso().getStatus());
        }
        return dto;
    }
}
