package com.projeto.backend.repository;

import com.projeto.backend.domain.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, String> {
    List<Curso> findByInstrutorIdUsuario(String idUsuario);
    List<Curso> findByStatus(String status);
}
