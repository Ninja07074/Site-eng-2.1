// Controller REST para expor os endpoints relacionados à entidade Curso.
// Sprint 2: endpoints de aprovação/rejeição/pendentes para o painel admin.
// Segurança: endpoints públicos retornam DTOs, endpoints admin exigem X-User-Id.

package com.projeto.backend.controller;

import com.projeto.backend.config.AuthHelper;
import com.projeto.backend.domain.Curso;
import com.projeto.backend.dto.CursoPublicoDTO;
import com.projeto.backend.repository.UsuarioRepository;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    private final CursoService cursoService;
    private final UsuarioRepository usuarioRepository;

    public CursoController(CursoService cursoService, UsuarioRepository usuarioRepository) {
        this.cursoService = cursoService;
        this.usuarioRepository = usuarioRepository;
    }

    // ===================== CRIAÇÃO =====================

    @PostMapping("/criar")
    public ResponseEntity<CursoPublicoDTO> criarCurso(
            @RequestParam String instrutorId,
            @RequestParam String titulo,
            @RequestParam String descricao,
            @RequestParam(required = false, defaultValue = "") String videoUrl,
            @RequestParam(required = false, defaultValue = "ATIVO") String status,
            @RequestParam(required = false) MultipartFile imagem,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        // Verifica que o solicitante é o próprio instrutor
        AuthHelper.requireInstrutor(userId != null ? userId : instrutorId, usuarioRepository);
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
            return new ResponseEntity<>(CursoPublicoDTO.fromEntity(novoCurso), HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // ===================== CONSULTAS PÚBLICAS =====================

    /** Catálogo público — retorna apenas cursos ATIVOS com dados filtrados (sem CPF/email). */
    @GetMapping
    public ResponseEntity<List<CursoPublicoDTO>> listarCursos() {
        List<CursoPublicoDTO> dtos = cursoService.listarCursos().stream()
                .map(CursoPublicoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoPublicoDTO> buscarCursoPorId(@PathVariable String id) {
        Optional<Curso> curso = cursoService.buscarCursoPorId(id);
        return curso.map(c -> ResponseEntity.ok(CursoPublicoDTO.fromEntity(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/instrutor/{instrutorId}")
    public ResponseEntity<List<CursoPublicoDTO>> listarPorInstrutor(@PathVariable String instrutorId) {
        List<CursoPublicoDTO> dtos = cursoService.listarCursosPorInstrutor(instrutorId).stream()
                .map(CursoPublicoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ===================== ADMIN: APROVAÇÃO =====================

    /** Lista cursos com status PENDENTE (painel admin). Requer ADMIN. */
    @GetMapping("/pendentes")
    public ResponseEntity<List<CursoPublicoDTO>> listarPendentes(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        List<CursoPublicoDTO> dtos = cursoService.listarCursosPendentes().stream()
                .map(CursoPublicoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /** Lista todos os cursos do sistema (painel admin). Requer ADMIN. */
    @GetMapping("/todos")
    public ResponseEntity<List<CursoPublicoDTO>> listarTodos(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        List<CursoPublicoDTO> dtos = cursoService.listarTodosCursos().stream()
                .map(CursoPublicoDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /** Aprova um curso pendente. Requer ADMIN. */
    @PutMapping("/{id}/aprovar")
    public ResponseEntity<CursoPublicoDTO> aprovarCurso(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        Curso curso = cursoService.aprovarCurso(id);
        return ResponseEntity.ok(CursoPublicoDTO.fromEntity(curso));
    }

    /** Rejeita um curso pendente com motivo. Requer ADMIN. */
    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<CursoPublicoDTO> rejeitarCurso(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        String motivo = body.get("motivo");
        Curso curso = cursoService.rejeitarCurso(id, motivo);
        return ResponseEntity.ok(CursoPublicoDTO.fromEntity(curso));
    }

    /** Desativa um curso ativo (moderação). Requer ADMIN. */
    @PutMapping("/{id}/desativar")
    public ResponseEntity<CursoPublicoDTO> desativarCurso(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireAdmin(userId, usuarioRepository);
        Curso curso = cursoService.desativarCurso(id);
        return ResponseEntity.ok(CursoPublicoDTO.fromEntity(curso));
    }

    // ===================== ATUALIZAÇÃO =====================

    @PostMapping("/{id}/editar")
    public ResponseEntity<CursoPublicoDTO> editarCurso(
            @PathVariable String id,
            @RequestParam String instrutorId,
            @RequestParam String titulo,
            @RequestParam String descricao,
            @RequestParam(required = false, defaultValue = "") String videoUrl,
            @RequestParam(required = false, defaultValue = "PENDENTE") String status,
            @RequestParam(required = false) MultipartFile imagem,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        // Verifica que o solicitante é o próprio instrutor
        AuthHelper.requireLoggedIn(userId != null ? userId : instrutorId, usuarioRepository);
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
            return ResponseEntity.ok(CursoPublicoDTO.fromEntity(cursoAtualizado));
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // ===================== EXCLUSÃO =====================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirCurso(
            @PathVariable String id,
            @RequestParam String instrutorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        AuthHelper.requireLoggedIn(userId != null ? userId : instrutorId, usuarioRepository);
        cursoService.excluirCurso(id, instrutorId);
        return ResponseEntity.noContent().build();
    }
}
