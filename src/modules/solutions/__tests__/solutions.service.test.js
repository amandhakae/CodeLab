import { describe, it, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../solutions.model.js', () => ({
  default: {
    create: vi.fn(),
    findAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

import {
  submitSolution,
  getSolutionsByUser,
  getSolutionsByChallenge,
  updateScore,
} from '../solutions.service.js';
import SolutionModel from '../solutions.model.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('submitSolution', () => {
  it('cria a solução com status pending', async () => {
    const data = { userId: 1, challengeId: 2, code: 'return a + b;' };
    SolutionModel.create.mockResolvedValue({ id: 1, ...data, language: 'javascript', status: 'pending' });

    const result = await submitSolution(data);

    expect(SolutionModel.create).toHaveBeenCalledWith({ ...data, language: 'javascript', status: 'pending' });
    expect(result.status).toBe('pending');
  });

  test('linguagem padrão é javascript quando não informada', async () => {
    SolutionModel.create.mockResolvedValue({ id: 1, status: 'pending' });

    await submitSolution({ userId: 1, challengeId: 1, code: 'x' });

    expect(SolutionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'javascript' }),
    );
  });

  it('passa userId e challengeId direto pro model sem modificar', async () => {
    SolutionModel.create.mockResolvedValue({ id: 1 });

    await submitSolution({ userId: 5, challengeId: 3, code: 'return x;' });

    expect(SolutionModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 5, challengeId: 3 }),
    );
  });
});

describe('getSolutionsByUser', () => {
  it('retorna as soluções do usuário', async () => {
    SolutionModel.findAll.mockResolvedValue([{ id: 1, userId: 1 }, { id: 2, userId: 1 }]);

    const result = await getSolutionsByUser(1);

    expect(result).toHaveLength(2);
  });

  test('manda o userId certo pro where do findAll', async () => {
    SolutionModel.findAll.mockResolvedValue([]);

    await getSolutionsByUser(42);

    expect(SolutionModel.findAll).toHaveBeenCalledWith({ where: { userId: 42 } });
  });
});

describe('getSolutionsByChallenge', () => {
  it('retorna soluções do desafio informado', async () => {
    SolutionModel.findAll.mockResolvedValue([{ id: 1, challengeId: 2 }]);

    const result = await getSolutionsByChallenge(2);

    expect(result).toHaveLength(1);
  });

  it('filtra pelo challengeId correto', async () => {
    SolutionModel.findAll.mockResolvedValue([]);

    await getSolutionsByChallenge(7);

    expect(SolutionModel.findAll).toHaveBeenCalledWith({ where: { challengeId: 7 } });
  });
});

describe('updateScore', () => {
  test('lança erro quando o id não existe no banco', async () => {
    SolutionModel.findByPk.mockResolvedValue(null);

    await expect(updateScore(99, { score: 5 })).rejects.toThrow('Solução não encontrada');
  });

  it('atualiza score e status na solução encontrada', async () => {
    const mockSolution = {
      update: vi.fn().mockResolvedValue({ id: 1, score: 95, status: 'accepted' }),
    };
    SolutionModel.findByPk.mockResolvedValue(mockSolution);

    const result = await updateScore(1, { score: 95, status: 'accepted' });

    expect(mockSolution.update).toHaveBeenCalledWith({ score: 95, status: 'accepted' });
    expect(result.score).toBe(95);
  });

  it('busca pelo id correto', async () => {
    const mockSolution = { update: vi.fn().mockResolvedValue({ id: 5 }) };
    SolutionModel.findByPk.mockResolvedValue(mockSolution);

    await updateScore(5, { score: 80, status: 'accepted' });

    expect(SolutionModel.findByPk).toHaveBeenCalledWith(5);
  });
});
