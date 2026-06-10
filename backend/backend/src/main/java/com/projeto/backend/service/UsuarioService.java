// Service de Usuário com regras de negócio para cadastro, login e busca
// Semana 3 e 4: valida cadastro, normaliza tipo, lista usuários e autentica login simples.

package com.projeto.backend.service;

import com.projeto.backend.domain.Usuario;
import com.projeto.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Semana 3 e 4: valida cadastro, normaliza tipo, lista usuários e autentica login simples.

    public Usuario cadastrarUsuario(Usuario usuario) {
        validarUsuario(usuario);

        if (usuarioRepository.findByEmail(usuario.getEmail().trim()).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        // Criptografar a senha antes de salvar
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarUsuarioPorId(String id) {
        return usuarioRepository.findById(id);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario login(String email, String senha) {
        if (isBlank(email) || isBlank(senha)) {
            throw new IllegalArgumentException("Email e senha são obrigatórios para login.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        // Verificar a senha criptografada
        if (!passwordEncoder.matches(senha, usuario.getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        return usuario;
    }

    // ===================== ADMIN: GERENCIAMENTO =====================

    public void excluirUsuario(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        usuarioRepository.delete(usuario);
    }

    public Usuario atualizarTipoUsuario(String id, String novoTipo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (isBlank(novoTipo)) {
            throw new IllegalArgumentException("Tipo de usuário é obrigatório.");
        }

        String tipoNormalizado = novoTipo.trim().toUpperCase();
        if (!"ALUNO".equals(tipoNormalizado) && !"INSTRUTOR".equals(tipoNormalizado) && !"ADMIN".equals(tipoNormalizado)) {
            throw new IllegalArgumentException("Tipo de usuário inválido. Use ALUNO, INSTRUTOR ou ADMIN.");
        }

        usuario.setTipoUsuario(tipoNormalizado);
        return usuarioRepository.save(usuario);
    }

    // ===================== VALIDAÇÃO =====================

    private void validarUsuario(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("Dados do usuário são obrigatórios.");
        }

        if (isBlank(usuario.getNome()) || isBlank(usuario.getEmail()) || isBlank(usuario.getSenha()) || isBlank(usuario.getCpf())) {
            throw new IllegalArgumentException("Nome, email, senha e CPF são obrigatórios.");
        }

        // Validação de formato e dígitos verificadores do CPF
        validarCpf(usuario.getCpf());

        // Mantém compatibilidade com o fluxo do frontend/mock: tipo padrão ALUNO.
        String tipoNormalizado = isBlank(usuario.getTipoUsuario())
                ? "ALUNO"
                : usuario.getTipoUsuario().trim().toUpperCase();

        if (!"ALUNO".equals(tipoNormalizado) && !"INSTRUTOR".equals(tipoNormalizado)) {
            tipoNormalizado = "ALUNO";
        }

        usuario.setTipoUsuario(tipoNormalizado);
    }

    /**
     * Valida formato e dígitos verificadores do CPF.
     * Aceita formato XXX.XXX.XXX-XX ou apenas 11 dígitos.
     */
    private void validarCpf(String cpf) {
        if (cpf == null) {
            throw new IllegalArgumentException("CPF é obrigatório.");
        }
        
        // Remove formatação
        String cpfLimpo = cpf.replaceAll("[.\\-]", "").trim();
        
        if (cpfLimpo.length() != 11 || !cpfLimpo.matches("\\d{11}")) {
            throw new IllegalArgumentException("CPF deve conter 11 dígitos numéricos (formato: XXX.XXX.XXX-XX).");
        }
        
        // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
        if (cpfLimpo.chars().distinct().count() == 1) {
            throw new IllegalArgumentException("CPF inválido.");
        }
        
        // Valida primeiro dígito verificador
        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(cpfLimpo.charAt(i)) * (10 - i);
        }
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) primeiroDigito = 0;
        
        if (Character.getNumericValue(cpfLimpo.charAt(9)) != primeiroDigito) {
            throw new IllegalArgumentException("CPF inválido.");
        }
        
        // Valida segundo dígito verificador
        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(cpfLimpo.charAt(i)) * (11 - i);
        }
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) segundoDigito = 0;
        
        if (Character.getNumericValue(cpfLimpo.charAt(10)) != segundoDigito) {
            throw new IllegalArgumentException("CPF inválido.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
