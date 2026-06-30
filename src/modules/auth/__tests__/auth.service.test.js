import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../auth.model.js', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

import { register, login } from '../auth.service.js';
import UserModel from '../auth.model.js';
import bcrypt from 'bcryptjs';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register()', () => {
    it('deve cadastrar um novo usuário', async () => {
      UserModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed123');
      UserModel.create.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com' });

      const result = await register({ name: 'João', email: 'joao@email.com', password: '123456' });

      expect(result).toEqual({ id: 1, name: 'João', email: 'joao@email.com' });
    });

    it('deve chamar bcrypt.hash com a senha', async () => {
      UserModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      UserModel.create.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com' });

      await register({ name: 'João', email: 'joao@email.com', password: '123456' });

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    });

    it('deve lançar erro se email já estiver cadastrado', async () => {
      UserModel.findOne.mockResolvedValue({ id: 1, email: 'joao@email.com' });

      await expect(
        register({ name: 'João', email: 'joao@email.com', password: '123456' }),
      ).rejects.toThrow('Email já cadastrado');
    });

    it('não deve chamar create se email já existe', async () => {
      UserModel.findOne.mockResolvedValue({ id: 1 });

      await expect(
        register({ name: 'João', email: 'joao@email.com', password: '123456' }),
      ).rejects.toThrow();

      expect(UserModel.create).not.toHaveBeenCalled();
    });

    it('deve chamar UserModel.create com a senha já hasheada', async () => {
      UserModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hash_gerado');

      const createSpy = vi.spyOn(UserModel, 'create').mockResolvedValue({
        id: 1, name: 'João', email: 'joao@email.com',
      });

      await register({ name: 'João', email: 'joao@email.com', password: '123456' });

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hash_gerado' }),
      );

      createSpy.mockRestore();
    });

    it('deve buscar o email correto no banco ao verificar duplicidade', async () => {
      UserModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      UserModel.create.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com' });

      await register({ name: 'João', email: 'joao@email.com', password: '123456' });

      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { email: 'joao@email.com' } });
    });

    it('deve usar fator de segurança 10 ao gerar o hash da senha', async () => {
      UserModel.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      UserModel.create.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com' });

      await register({ name: 'João', email: 'joao@email.com', password: 'minhasenha' });

      expect(bcrypt.hash).toHaveBeenCalledWith('minhasenha', 10);
    });
  });

  describe('login()', () => {
    it('deve fazer login com credenciais corretas', async () => {
      UserModel.findOne.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com', password: 'hashed123' });
      bcrypt.compare.mockResolvedValue(true);

      const result = await login({ email: 'joao@email.com', password: '123456' });

      expect(result).toEqual({ id: 1, name: 'João', email: 'joao@email.com' });
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      UserModel.findOne.mockResolvedValue(null);

      await expect(
        login({ email: 'naoexiste@email.com', password: '123456' }),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro se senha estiver incorreta', async () => {
      UserModel.findOne.mockResolvedValue({ id: 1, email: 'joao@email.com', password: 'hashed123' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        login({ email: 'joao@email.com', password: 'errada' }),
      ).rejects.toThrow('Senha incorreta');
    });

    it('deve chamar bcrypt.compare com a senha informada', async () => {
      UserModel.findOne.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com', password: 'hashed123' });
      bcrypt.compare.mockResolvedValue(true);

      await login({ email: 'joao@email.com', password: '123456' });

      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed123');
    });

    it('o retorno do login deve conter id, name e email mas não a senha', async () => {
      UserModel.findOne.mockResolvedValue({ id: 1, name: 'João', email: 'joao@email.com', password: 'hashed123' });
      bcrypt.compare.mockResolvedValue(true);

      const result = await login({ email: 'joao@email.com', password: '123456' });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result.password).toBe(undefined);
    });

    it('não deve chamar bcrypt.compare se o usuário não for encontrado', async () => {
      UserModel.findOne.mockResolvedValue(null);

      await expect(
        login({ email: 'naoexiste@email.com', password: '123456' }),
      ).rejects.toThrow('Usuário não encontrado');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('deve buscar o usuário pelo email correto ao fazer login', async () => {
      UserModel.findOne.mockResolvedValue(null);

      await expect(
        login({ email: 'teste@email.com', password: '123456' }),
      ).rejects.toThrow();

      expect(UserModel.findOne).toHaveBeenCalledWith({ where: { email: 'teste@email.com' } });
    });

    it('deve retornar o id correto do usuário após login bem-sucedido', async () => {
      UserModel.findOne.mockResolvedValue({ id: 42, name: 'Maria', email: 'maria@email.com', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(true);

      const result = await login({ email: 'maria@email.com', password: '123456' });

      expect(result.id).toBe(42);
      expect(result.name).toBe('Maria');
    });
  });
});
