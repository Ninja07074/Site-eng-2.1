package com.projeto.backend.repository;

import com.projeto.backend.domain.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, String> {
    List<Avaliacao> findByCursoIdCursoOrderByDataAvaliacaoDesc(String idCurso);
    Optional<Avaliacao> findByUsuarioIdUsuarioAndCursoIdCurso(String idUsuario, String idCurso);
}
