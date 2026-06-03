// Controller REST para expor os endpoints relacionados à entidade Curso.
// Sprint 2: endpoints de aprovação/rejeição/pendentes para o painel admin.

package com.projeto.backend.controller;

import com.projeto.backend.domain.Curso;
import com.projeto.backend.service.CursoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.io.IOException;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    // ===================== CRIAÇÃO =====================

    @PostMapping("/criar")
    public ResponseEntity<Curso> criarCurso(
            @RequestParam String instrutorId,
            @RequestParam String titulo,
            @RequestParam String descricao,
            @RequestParam(required = false, defaultValue = "") String videoUrl,
            @RequestParam(required = false, defaultValue = "ATIVO") String status,
            @RequestParam(required = false) MultipartFile imagem) {
        try {
            Curso curso = new Curso();
            curso.setTitulo(titulo);
            curso.setDescricao(descricao);
            curso.setVideoUrl(videoUrl);
            // O status é forçado para PENDENTE no Service, mas mantemos o param por compatibilidade.
            curso.setStatus(status);
            
            if (imagem != null && !imagem.isEmpty()) {
                String imagemBase64 = Base64.getEncoder().encodeToString(imagem.getBytes());
                String mimeType = imagem.getContentType();
                curso.setImagemBase64("data:" + mimeType + ";base64," + imagemBase64);
            }
            
            Curso novoCurso = cursoService.criarCurso(curso, instrutorId);
            return new ResponseEntity<>(novoCurso, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // ===================== CONSULTAS PÚBLICAS =====================

    /** Catálogo público — retorna apenas cursos ATIVOS. */
    @GetMapping
    public ResponseEntity<List<Curso>> listarCursos() {
        return ResponseEntity.ok(cursoService.listarCursos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Curso> buscarCursoPorId(@PathVariable String id) {
        Optional<Curso> curso = cursoService.buscarCursoPorId(id);
        return curso.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/instrutor/{instrutorId}")
    public ResponseEntity<List<Curso>> listarPorInstrutor(@PathVariable String instrutorId) {
        return ResponseEntity.ok(cursoService.listarCursosPorInstrutor(instrutorId));
    }

    // ===================== ADMIN: APROVAÇÃO =====================

    /** Lista cursos com status PENDENTE (painel admin). */
    @GetMapping("/pendentes")
    public ResponseEntity<List<Curso>> listarPendentes() {
        return ResponseEntity.ok(cursoService.listarCursosPendentes());
    }

    /** Lista todos os cursos do sistema (painel admin). */
    @GetMapping("/todos")
    public ResponseEntity<List<Curso>> listarTodos() {
        return ResponseEntity.ok(cursoService.listarTodosCursos());
    }

    /** Aprova um curso pendente. */
    @PutMapping("/{id}/aprovar")
    public ResponseEntity<Curso> aprovarCurso(@PathVariable String id) {
        Curso curso = cursoService.aprovarCurso(id);
        return ResponseEntity.ok(curso);
    }

    /** Rejeita um curso pendente com motivo. */
    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<Curso> rejeitarCurso(@PathVariable String id, @RequestBody Map<String, String> body) {
        String motivo = body.get("motivo");
        Curso curso = cursoService.rejeitarCurso(id, motivo);
        return ResponseEntity.ok(curso);
    }

    /** Desativa um curso ativo (moderação). */
    @PutMapping("/{id}/desativar")
    public ResponseEntity<Curso> desativarCurso(@PathVariable String id) {
        Curso curso = cursoService.desativarCurso(id);
        return ResponseEntity.ok(curso);
    }

    // ===================== ATUALIZAÇÃO =====================

    @PostMapping("/{id}/editar")
    public ResponseEntity<Curso> editarCurso(
            @PathVariable String id,
            @RequestParam String instrutorId,
            @RequestParam String titulo,
            @RequestParam String descricao,
            @RequestParam(required = false, defaultValue = "") String videoUrl,
            @RequestParam(required = false, defaultValue = "PENDENTE") String status,
            @RequestParam(required = false) MultipartFile imagem) {
        try {
            Curso cursoModificado = new Curso();
            cursoModificado.setTitulo(titulo);
            cursoModificado.setDescricao(descricao);
            cursoModificado.setVideoUrl(videoUrl);
            cursoModificado.setStatus(status);
            
            boolean novaImagem = false;
            if (imagem != null && !imagem.isEmpty()) {
                String imagemBase64 = Base64.getEncoder().encodeToString(imagem.getBytes());
                String mimeType = imagem.getContentType();
                cursoModificado.setImagemBase64("data:" + mimeType + ";base64," + imagemBase64);
                novaImagem = true;
            }
            
            Curso cursoAtualizado = cursoService.atualizarCurso(id, instrutorId, cursoModificado, novaImagem);
            return ResponseEntity.ok(cursoAtualizado);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // ===================== EXCLUSÃO =====================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCurso(@PathVariable String id, @RequestParam String instrutorId) {
        cursoService.excluirCurso(id, instrutorId);
        return ResponseEntity.noContent().build();
    }
}
