import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../challenges.model.js', () => ({
  default: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
  },
}));

import {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  deleteChallenge,
} from '../challenges.service.js';
import ChallengeModel from '../challenges.model.js';

describe('Challenges Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllChallenges()', () => {
    it('deve retornar todos os desafios', async () => {
      const lista = [{ id: 1, title: 'Soma' }, { id: 2, title: 'Inverter' }];
      ChallengeModel.findAll.mockResolvedValue(lista);

      const result = await getAllChallenges();

      expect(result).toEqual(lista);
      expect(ChallengeModel.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getChallengeById()', () => {
    it('deve retornar o desafio pelo id', async () => {
      const challenge = { id: 1, title: 'Soma de Dois Números' };
      ChallengeModel.findByPk.mockResolvedValue(challenge);

      const result = await getChallengeById(1);

      expect(result).toEqual(challenge);
      expect(ChallengeModel.findByPk).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro se desafio não for encontrado', async () => {
      ChallengeModel.findByPk.mockResolvedValue(null);

      await expect(getChallengeById(99)).rejects.toThrow('Desafio não encontrado');
    });
  });

  describe('createChallenge()', () => {
    it('deve criar um novo desafio', async () => {
      const data = { title: 'Novo', description: 'Desc', level: 'Iniciante', categoryId: 1 };
      const created = { id: 3, ...data };
      ChallengeModel.create.mockResolvedValue(created);

      const result = await createChallenge(data);

      expect(result).toEqual(created);
      expect(ChallengeModel.create).toHaveBeenCalledWith(data);
    });
  });

  describe('deleteChallenge()', () => {
    it('deve remover um desafio existente', async () => {
      const challenge = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
      ChallengeModel.findByPk.mockResolvedValue(challenge);

      const result = await deleteChallenge(1);

      expect(challenge.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Desafio removido com sucesso' });
    });
  });
});
