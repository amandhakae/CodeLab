import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../src/modules/auth/auth.service.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

vi.mock('../../src/modules/user/user.model.js', () => ({
  default: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

import app from '../../app.js';
import { register, login } from '../../src/modules/auth/auth.service.js';

describe('Integração - Rotas de Autenticação (Controller + HTTP)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  

  describe('GET / (página de login)', () => {
    it('deve retornar status 200 e renderizar a página de login', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /dashboard', () => {
    it('deve retornar status 200 e renderizar o dashboard', async () => {
      const res = await request(app).get('/dashboard');

      expect(res.status).toBe(200);
    });
  });

  

  describe('POST /auth/register', () => {
    it('deve chamar register() e redirecionar para /dashboard com sucesso', async () => {
      const usuario = { id: 1, name: 'João', email: 'joao@email.com' };
      register.mockResolvedValue(usuario);

      const res = await request(app)
        .post('/auth/register')
        .type('form')
        .send({ name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '123456' });

      expect(register).toHaveBeenCalledOnce();
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/dashboard');
    });

    it('deve redirecionar para / sem chamar o service se as senhas não coincidirem', async () => {
      const res = await request(app)
        .post('/auth/register')
        .type('form')
        .send({ name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '999999' });

      expect(register).not.toHaveBeenCalled();
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('deve redirecionar para / quando o service lançar erro de email duplicado', async () => {
      register.mockRejectedValue(new Error('Email já cadastrado'));

      const res = await request(app)
        .post('/auth/register')
        .type('form')
        .send({ name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '123456' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    });
  });

  

  describe('POST /auth/login', () => {
    it('deve chamar login() e redirecionar para /dashboard com sucesso', async () => {
      const usuario = { id: 1, name: 'João', email: 'joao@email.com' };
      login.mockResolvedValue(usuario);

      const res = await request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: 'joao@email.com', password: '123456' });

      expect(login).toHaveBeenCalledOnce();
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/dashboard');
    });

    it('deve redirecionar para / quando o service lançar erro de senha incorreta', async () => {
      login.mockRejectedValue(new Error('Senha incorreta'));

      const res = await request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: 'joao@email.com', password: 'errada' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('deve redirecionar para / quando o service lançar erro de usuário não encontrado', async () => {
      login.mockRejectedValue(new Error('Usuário não encontrado'));

      const res = await request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: 'naoexiste@email.com', password: '123456' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('deve chamar login() com os dados enviados pelo formulário', async () => {
      login.mockResolvedValue({ id: 2, name: 'Maria', email: 'maria@email.com' });

      await request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: 'maria@email.com', password: 'senha123' });

      expect(login).toHaveBeenCalledWith({ email: 'maria@email.com', password: 'senha123' });
    });
  });

  

  describe('GET /perfil (rota protegida)', () => {
    it('deve redirecionar para / quando o usuário não estiver autenticado', async () => {
      const res = await request(app).get('/perfil');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    });
  });
});
