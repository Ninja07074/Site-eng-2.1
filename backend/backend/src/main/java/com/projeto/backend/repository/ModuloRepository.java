package com.projeto.backend.repository;

import com.projeto.backend.domain.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, String> {
    List<Modulo> findByCursoIdCursoOrderByOrdemAsc(String idCurso);
}
