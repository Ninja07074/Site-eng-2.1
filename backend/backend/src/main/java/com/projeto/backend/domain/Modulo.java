// Classe que representa um módulo/aula dentro de um curso (Firebase Firestore)
// Cada módulo pertence a um curso e tem uma ordem de exibição
// Semana 4: URL do video da aula/modulo para consumo no frontend.

package com.projeto.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "modulos")
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String idModulo;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private Integer ordem;

    // Semana 4: URL do video da aula/modulo para consumo no frontend.
    private String videoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    @JsonIgnore
    private Curso curso;

    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Comentario> comentarios;
}
