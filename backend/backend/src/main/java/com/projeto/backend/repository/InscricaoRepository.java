package com.projeto.backend.repository;

import com.projeto.backend.domain.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscricaoRepository extends JpaRepository<Inscricao, String> {
    List<Inscricao> findByUsuarioIdUsuario(String idUsuario);
    List<Inscricao> findByCursoIdCurso(String idCurso);
    Optional<Inscricao> findByUsuarioIdUsuarioAndCursoIdCurso(String idUsuario, String idCurso);
    void deleteByCursoIdCurso(String idCurso);
}
