'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { apiCadastrarUsuario, apiLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginMsg, setLoginMsg] = useState('');

  const [regForm, setRegForm] = useState({ name: '', email: '', cpf: '', password: '', tipoUsuario: 'ALUNO' });
  const [regMsg, setRegMsg] = useState('');

  const destinoPosLogin = (tipo) => tipo === 'INSTRUTOR' ? '/criar-curso' : '/meus-cursos';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await apiLogin(loginForm.email, loginForm.password);
      login({ userId: user.idUsuario, userName: user.nome, tipoUsuario: user.tipoUsuario });
      setLoginMsg('Login bem-sucedido. Redirecionando...');
      setTimeout(() => router.push(destinoPosLogin(user.tipoUsuario)), 600);
    } catch (error) {
      setLoginMsg(error.message || 'Credenciais inválidas');
    }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.cpf || !regForm.password) {
      setRegMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const user = await apiCadastrarUsuario({
        nome: regForm.name,
        email: regForm.email,
        cpf: regForm.cpf,
        senha: regForm.password,
        tipoUsuario: regForm.tipoUsuario
      });
      login({ userId: user.idUsuario, userName: user.nome, tipoUsuario: user.tipoUsuario });
      setRegMsg('Cadastro realizado. Redirecionando...');
      setTimeout(() => router.push(destinoPosLogin(user.tipoUsuario)), 800);
    } catch (error) {
      setRegMsg(error.message || 'Não foi possível cadastrar agora.');
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px' }}>
      <section className="auth-forms">
        <div className="card auth-card">
          <h2>Entrar</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-field">
              <label htmlFor="loginEmail">E-mail</label>
              <input id="loginEmail" type="email" placeholder="seu@email.com" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
            </div>
            <div className="form-field">
              <label htmlFor="loginPassword">Senha</label>
              <input id="loginPassword" type="password" placeholder="••••••" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit" style={{ width: '100%' }}>Entrar</button>
            </div>
            {loginMsg && <div className="auth-msg">{loginMsg}</div>}
          </form>
        </div>

        <div className="card auth-card">
          <h2>Cadastrar</h2>
          <form onSubmit={handleRegSubmit}>
            <div className="form-field">
              <label htmlFor="name">Nome</label>
              <input id="name" placeholder="Seu nome completo" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
            </div>
            <div className="form-field">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" placeholder="seu@email.com" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} />
            </div>
            <div className="form-field">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" placeholder="000.000.000-00" required value={regForm.cpf} onChange={e => setRegForm({...regForm, cpf: e.target.value})} />
            </div>
            <div className="form-field">
              <label htmlFor="password">Senha</label>
              <input id="password" type="password" placeholder="••••••" required value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} />
            </div>
            <div className="form-field">
              <label htmlFor="tipoUsuario">Tipo de usuário</label>
              <select id="tipoUsuario" required value={regForm.tipoUsuario} onChange={e => setRegForm({...regForm, tipoUsuario: e.target.value})}>
                <option value="ALUNO">Aluno</option>
                <option value="INSTRUTOR">Instrutor</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit" style={{ width: '100%' }}>Cadastrar</button>
            </div>
            {regMsg && <div className="auth-msg">{regMsg}</div>}
          </form>
        </div>
      </section>
    </main>
  );
}
