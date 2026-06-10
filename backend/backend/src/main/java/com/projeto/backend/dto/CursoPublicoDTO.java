// DTO para respostas públicas de Curso.
// Retorna apenas dados seguros — sem CPF, email ou ID do instrutor.

package com.projeto.backend.dto;

import com.projeto.backend.domain.Curso;
import lombok.Data;

@Data
public class CursoPublicoDTO {

    private String idCurso;
    private String titulo;
    private String descricao;
    private String imagemBase64;
    private String status;
    private String videoUrl;
    private String instrutorNome; // Apenas o nome, sem dados sensíveis
    private String motivoRejeicao;

    public static CursoPublicoDTO fromEntity(Curso curso) {
        CursoPublicoDTO dto = new CursoPublicoDTO();
        dto.setIdCurso(curso.getIdCurso());
        dto.setTitulo(curso.getTitulo());
        dto.setDescricao(curso.getDescricao());
        dto.setImagemBase64(curso.getImagemBase64());
        dto.setStatus(curso.getStatus());
        dto.setVideoUrl(curso.getVideoUrl());
        dto.setMotivoRejeicao(curso.getMotivoRejeicao());
        if (curso.getInstrutor() != null) {
            dto.setInstrutorNome(curso.getInstrutor().getNome());
        }
        return dto;
    }
}
