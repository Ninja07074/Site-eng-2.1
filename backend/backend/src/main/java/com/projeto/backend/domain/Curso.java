// Entidade Curso — representa um curso criado por um instrutor.
// Status possíveis: PENDENTE (aguardando aprovação), ATIVO (aprovado), REJEITADO, INATIVO.

package com.projeto.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String idCurso;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private String videoUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrutor_id")
    private Usuario instrutor;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String motivoRejeicao;

    @Column(columnDefinition = "TEXT")
    private String imagemBase64;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Modulo> modulos;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Avaliacao> avaliacoes;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Inscricao> inscricoes;
}
