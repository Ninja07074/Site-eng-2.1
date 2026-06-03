package com.projeto.backend.repository;

import com.projeto.backend.domain.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, String> {
    List<Comentario> findByModuloIdModuloOrderByDataCriacaoDesc(String moduloId);
}
