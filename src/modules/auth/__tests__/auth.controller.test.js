import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../auth.service.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

import { registerHandler, loginHandler } from '../auth.controller.js';
import { register, login } from '../auth.service.js';

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = global.mockReq();
    req.session = {};
    req.flash = vi.fn();
    res = global.mockRes();
    vi.clearAllMocks();
  });

  describe('registerHandler', () => {
    it('deve redirecionar para /dashboard após cadastro com sucesso', async () => {
      const user = { id: 1, name: 'João', email: 'joao@email.com' };
      register.mockResolvedValue(user);
      req.body = { name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '123456' };

      await registerHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('deve salvar o usuário na sessão após cadastro', async () => {
      const user = { id: 1, name: 'João', email: 'joao@email.com' };
      register.mockResolvedValue(user);
      req.body = { name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '123456' };

      await registerHandler(req, res);

      expect(req.session.user).toEqual(user);
    });

    it('deve redirecionar para / se as senhas não coincidirem', async () => {
      req.body = { name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '999999' };

      await registerHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(register).not.toHaveBeenCalled();
    });

    it('deve redirecionar para / se o email já estiver cadastrado', async () => {
      register.mockRejectedValue(new Error('Email já cadastrado'));
      req.body = { name: 'João', email: 'joao@email.com', password: '123456', confirmPassword: '123456' };

      await registerHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('loginHandler', () => {
    it('deve redirecionar para /dashboard após login com sucesso', async () => {
      const user = { id: 1, name: 'João', email: 'joao@email.com' };
      login.mockResolvedValue(user);
      req.body = { email: 'joao@email.com', password: '123456' };

      await loginHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('deve salvar o usuário na sessão após login', async () => {
      const user = { id: 1, name: 'João', email: 'joao@email.com' };
      login.mockResolvedValue(user);
      req.body = { email: 'joao@email.com', password: '123456' };

      await loginHandler(req, res);

      expect(req.session.user).toEqual(user);
    });

    it('deve redirecionar para / com senha incorreta', async () => {
      login.mockRejectedValue(new Error('Senha incorreta'));
      req.body = { email: 'joao@email.com', password: 'errada' };

      await loginHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('deve redirecionar para / se usuário não existir', async () => {
      login.mockRejectedValue(new Error('Usuário não encontrado'));
      req.body = { email: 'naoexiste@email.com', password: '123456' };

      await loginHandler(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });
});
