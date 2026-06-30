import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../challenges.service.js', () => ({
  getAllChallenges: vi.fn(),
  getChallengeById: vi.fn(),
  createChallenge: vi.fn(),
  updateChallenge: vi.fn(),
  deleteChallenge: vi.fn(),
}));

import { getAll, getById, create } from '../challenges.controller.js';
import {
  getAllChallenges,
  getChallengeById,
  createChallenge,
} from '../challenges.service.js';

describe('Challenges Controller', () => {
  let req, res;

  beforeEach(() => {
    req = global.mockReq();
    req.params = {};
    req.query = {};
    res = global.mockRes();
    vi.clearAllMocks();
  });

  it('getAll deve retornar 200 com lista de desafios', async () => {
    const lista = [{ id: 1, title: 'Soma' }];
    getAllChallenges.mockResolvedValue(lista);

    await getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(lista);
  });

  it('getById deve retornar 404 se desafio não existir', async () => {
    getChallengeById.mockRejectedValue(new Error('Desafio não encontrado'));
    req.params.id = '99';

    await getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Desafio não encontrado' });
  });

  it('create deve retornar 201 com desafio criado', async () => {
    const novo = { id: 2, title: 'Novo Desafio' };
    createChallenge.mockResolvedValue(novo);
    req.body = { title: 'Novo Desafio', level: 'Iniciante' };

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(novo);
  });
});
