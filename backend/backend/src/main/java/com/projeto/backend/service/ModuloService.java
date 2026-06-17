// Service de Módulo com regras de negócio para criação, busca, atualização e exclusão
// Cada módulo pertence a um curso e tem uma ordem de exibição

package com.projeto.backend.service;

import com.projeto.backend.domain.Curso;
import com.projeto.backend.domain.Modulo;
import com.projeto.backend.repository.CursoRepository;
import com.projeto.backend.repository.ModuloRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModuloService {

    private final ModuloRepository moduloRepository;
    private final CursoRepository cursoRepository;

    public ModuloService(ModuloRepository moduloRepository, CursoRepository cursoRepository) {
        this.moduloRepository = moduloRepository;
        this.cursoRepository = cursoRepository;
    }

    public Modulo criarModulo(String cursoId, Modulo modulo) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado."));

        modulo.setCurso(curso);
        if (modulo.getOrdem() == null) {
            modulo.setOrdem(1);
        }
        if (modulo.getVideoUrl() == null) {
            modulo.setVideoUrl("");
        }
        validarModulo(modulo);
        return moduloRepository.save(modulo);
    }

    public List<Modulo> listarModulosPorCurso(String cursoId) {
        return moduloRepository.findByCursoIdCursoOrderByOrdemAsc(cursoId);
    }

    public Optional<Modulo> buscarModuloPorId(String id) {
        return moduloRepository.findById(id);
    }

    public Modulo atualizarModulo(String id, Modulo moduloAtualizado) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Módulo não encontrado."));

        if (moduloAtualizado.getTitulo() != null) {
            modulo.setTitulo(moduloAtualizado.getTitulo());
        }
        if (moduloAtualizado.getDescricao() != null) {
            modulo.setDescricao(moduloAtualizado.getDescricao());
        }
        if (moduloAtualizado.getOrdem() != null) {
            modulo.setOrdem(moduloAtualizado.getOrdem());
        }
        if (moduloAtualizado.getVideoUrl() != null) {
            modulo.setVideoUrl(moduloAtualizado.getVideoUrl());
        }

        validarModulo(modulo);
        return moduloRepository.save(modulo);
    }

    public void deletarModulo(String id) {
        moduloRepository.deleteById(id);
    }

    private void validarModulo(Modulo modulo) {
        if (modulo == null) {
            throw new IllegalArgumentException("Dados do módulo são obrigatórios.");
        }

        if (isBlank(modulo.getTitulo())) {
            throw new IllegalArgumentException("Título do módulo é obrigatório.");
        }

        if (modulo.getOrdem() == null || modulo.getOrdem() < 1) {
            throw new IllegalArgumentException("Ordem do módulo deve ser um número positivo.");
        }

        if (modulo.getCurso() == null) {
            throw new IllegalArgumentException("Módulo precisa estar associado a um curso.");
        }

        if (modulo.getTitulo() != null && modulo.getTitulo().length() > 255) {
            throw new IllegalArgumentException("O título da aula excede o limite de 255 caracteres.");
        }

        if (modulo.getDescricao() != null && modulo.getDescricao().length() > 2000) {
            throw new IllegalArgumentException("A descrição da aula excede o limite de 2000 caracteres.");
        }

        if (modulo.getVideoUrl() != null && modulo.getVideoUrl().length() > 255) {
            throw new IllegalArgumentException("A URL do vídeo excede o limite de 255 caracteres.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
