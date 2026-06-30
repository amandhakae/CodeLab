import { describe, it, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../src/modules/solutions/solutions.service.js', () => ({
  submitSolution: vi.fn(),
  getSolutionsByUser: vi.fn(),
  getSolutionsByChallenge: vi.fn(),
  updateScore: vi.fn(),
}));

vi.mock('../../src/modules/comments/comments.service.js', () => ({
  addComment: vi.fn(),
  getCommentsByChallenge: vi.fn(),
}));

vi.mock('../../src/modules/challenges/challenges.model.js', () => ({
  default: {
    findByPk: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock('../../src/modules/user/user.model.js', () => ({
  default: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
}));

import app from '../../app.js';
import {
  submitSolution,
  getSolutionsByUser,
  getSolutionsByChallenge,
  updateScore,
} from '../../src/modules/solutions/solutions.service.js';

describe('Rotas de Soluções', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /desafio/ retorna 201 quando solução é criada', async () => {
    submitSolution.mockResolvedValue({ id: 1, userId: 1, challengeId: 2, status: 'pending' });

    const res = await request(app)
      .post('/desafio/')
      .send({ userId: 1, challengeId: 2, code: 'return a + b;' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('POST /desafio/ retorna 400 quando service dá erro', async () => {
    submitSolution.mockRejectedValue(new Error('Dados inválidos'));

    const res = await request(app)
      .post('/desafio/')
      .send({ userId: 1, challengeId: 2, code: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Dados inválidos');
  });

  test('GET /desafio/user/:userId retorna soluções do usuário', async () => {
    getSolutionsByUser.mockResolvedValue([{ id: 1, userId: 1 }, { id: 2, userId: 1 }]);

    const res = await request(app).get('/desafio/user/1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('GET /desafio/user/:userId retorna 500 se o service falhar', async () => {
    getSolutionsByUser.mockRejectedValue(new Error('Falha no banco'));

    const res = await request(app).get('/desafio/user/1');

    expect(res.status).toBe(500);
  });

  test('GET /desafio/challenge/:challengeId retorna soluções do desafio', async () => {
    getSolutionsByChallenge.mockResolvedValue([{ id: 1, challengeId: 5 }]);

    const res = await request(app).get('/desafio/challenge/5');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('PATCH /desafio/:id/score atualiza e retorna 200', async () => {
    updateScore.mockResolvedValue({ id: 1, score: 90, status: 'accepted' });

    const res = await request(app)
      .patch('/desafio/1/score')
      .send({ score: 90, status: 'accepted' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('score', 90);
  });

  it('PATCH /desafio/:id/score retorna 404 quando solução não existe', async () => {
    updateScore.mockRejectedValue(new Error('Solução não encontrada'));

    const res = await request(app)
      .patch('/desafio/999/score')
      .send({ score: 90, status: 'accepted' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Solução não encontrada');
  });

  // rotas que precisam de sessão redirecionam pra login
  it('GET /desafio/:id sem autenticação redireciona', async () => {
    const res = await request(app).get('/desafio/1');
    expect(res.status).toBe(302);
  });

  it('POST /desafio/:id/submit sem autenticação redireciona', async () => {
    const res = await request(app)
      .post('/desafio/1/submit')
      .type('form')
      .send({ code: 'return a + b;', language: 'javascript' });

    expect(res.status).toBe(302);
  });

  test('GET /desafio/meus sem login manda pra /', async () => {
    const res = await request(app).get('/desafio/meus');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
  });
});
