// Classe que representa a entidade Usuario no banco de dados (Firebase Firestore)
// A anotação @Data do Lombok gera automaticamente getters, setters, toString, equals e hashCode
// A anotação @DocumentId mapeia o campo como ID do documento no Firestore
// A anotação @JsonProperty controla a serialização da senha (apenas entrada, não retorna em respostas)

package com.projeto.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String idUsuario;

    private String nome;

    private String email;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String senha;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(unique = true)
    private String cpf;

    private String tipoUsuario;
}
