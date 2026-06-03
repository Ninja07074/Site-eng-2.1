// Classe de controlador REST para expor os endpoints relacionados a Módulos de cursos

package com.projeto.backend.controller;

import com.projeto.backend.domain.Modulo;
import com.projeto.backend.service.ModuloService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/modulos")
public class ModuloController {

    private final ModuloService moduloService;

    public ModuloController(ModuloService moduloService) {
        this.moduloService = moduloService;
    }

    @PostMapping("/criar")
    public ResponseEntity<Modulo> criarModulo(
            @RequestParam String cursoId,
            @RequestBody Modulo modulo) {
        Modulo novoModulo = moduloService.criarModulo(cursoId, modulo);
        return new ResponseEntity<>(novoModulo, HttpStatus.CREATED);
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Modulo>> listarModulosPorCurso(@PathVariable String cursoId) {
        List<Modulo> modulos = moduloService.listarModulosPorCurso(cursoId);
        return ResponseEntity.ok(modulos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modulo> buscarModuloPorId(@PathVariable String id) {
        Optional<Modulo> modulo = moduloService.buscarModuloPorId(id);
        return modulo.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Modulo> atualizarModulo(
            @PathVariable String id,
            @RequestBody Modulo modulo) {
        Modulo moduloAtualizado = moduloService.atualizarModulo(id, modulo);
        return ResponseEntity.ok(moduloAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarModulo(@PathVariable String id) {
        moduloService.deletarModulo(id);
        return ResponseEntity.noContent().build();
    }
}
