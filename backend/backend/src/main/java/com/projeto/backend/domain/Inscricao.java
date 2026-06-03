// Classe que representa a entidade Inscricao no banco de dados (Firebase Firestore)
// A anotação @Data do Lombok gera automaticamente getters, setters, toString, equals e hashCode
// A anotação @DocumentId mapeia o campo como ID do documento no Firestore
// A anotação @Entity define a classe como uma entidade JPA
// A anotação @Table mapeia a entidade para a tabela "inscricoes"
// O atributo dataInscricao armazena a data e hora de inscrição do usuário no curso

package com.projeto.backend.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "inscricoes")
public class Inscricao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String idInscricao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "curso_id")
    private Curso curso;

    private LocalDateTime dataInscricao;
}
