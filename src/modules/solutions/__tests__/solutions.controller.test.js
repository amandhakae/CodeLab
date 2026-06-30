import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../solutions.service.js', () => ({
  submitSolution: vi.fn(),
  getSolutionsByUser: vi.fn(),
  getSolutionsByChallenge: vi.fn(),
  updateScore: vi.fn(),
}));

vi.mock('../../comments/comments.service.js', () => ({
  addComment: vi.fn(),
  getCommentsByChallenge: vi.fn(),
}));

vi.mock('../../challenges/challenges.model.js', () => ({
  default: { findByPk: vi.fn() },
}));

vi.mock('../../../constants/challenges.js', () => ({
  DEMO_CHALLENGES: {
    '1': { id: 1, title: 'Soma', level: 'Fácil', category: 'Algoritmos', description: 'Some dois números' },
  },
}));

import {
  submit,
  getByUser,
  getByChallenge,
  scoreUpdate,
  showMyChallenges,
  showChallengePage,
  submitAndGrade,
  addWebComment,
} from '../solutions.controller.js';
import {
  submitSolution,
  getSolutionsByUser,
  getSolutionsByChallenge,
  updateScore,
} from '../solutions.service.js';
import { addComment, getCommentsByChallenge } from '../../comments/comments.service.js';
import ChallengeModel from '../../challenges/challenges.model.js';

describe('Solutions Controller', () => {
  let res;

  beforeEach(() => {
    vi.clearAllMocks();
    res = mockRes();
  });

  describe('submit()', () => {
    it('deve retornar 201 com a solução criada', async () => {
      const req = mockReq({ userId: 1, challengeId: 2, code: 'return a + b;' });
      submitSolution.mockResolvedValue({ id: 1, status: 'pending' });

      await submit(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('deve retornar 400 quando o service lançar erro', async () => {
      const req = mockReq({});
      submitSolution.mockRejectedValue(new Error('Dados inválidos'));

      await submit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Dados inválidos' }));
    });
  });

  describe('getByUser()', () => {
    it('deve retornar 200 com soluções do usuário', async () => {
      const req = { ...mockReq(), params: { userId: 1 } };
      getSolutionsByUser.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await getByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([{ id: 1 }]));
    });

    it('deve retornar 500 quando o service falhar', async () => {
      const req = { ...mockReq(), params: { userId: 1 } };
      getSolutionsByUser.mockRejectedValue(new Error('DB error'));

      await getByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getByChallenge()', () => {
    it('deve retornar 200 com soluções do desafio', async () => {
      const req = { ...mockReq(), params: { challengeId: 2 } };
      getSolutionsByChallenge.mockResolvedValue([{ id: 1, challengeId: 2 }]);

      await getByChallenge(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('scoreUpdate()', () => {
    it('deve retornar 200 ao atualizar score com sucesso', async () => {
      const req = { ...mockReq({ score: 90, status: 'accepted' }), params: { id: 1 } };
      updateScore.mockResolvedValue({ id: 1, score: 90, status: 'accepted' });

      await scoreUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ score: 90 }));
    });

    it('deve retornar 404 quando solução não for encontrada', async () => {
      const req = { ...mockReq({}), params: { id: 99 } };
      updateScore.mockRejectedValue(new Error('Solução não encontrada'));

      await scoreUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Solução não encontrada' }));
    });
  });

  describe('showMyChallenges()', () => {
    it('deve renderizar meus-desafios com lista de desafios respondidos', async () => {
      const req = {
        ...mockReq(),
        session: { user: { id: 1 } },
      };
      getSolutionsByUser.mockResolvedValue([
        { challengeId: 1, score: 90, status: 'accepted', createdAt: new Date() },
      ]);

      await showMyChallenges(req, res);

      expect(res.render).toHaveBeenCalledWith('meus-desafios', expect.objectContaining({
        desafiosRespondidos: expect.any(Array),
      }));
    });

    it('deve renderizar com lista vazia quando usuário não tiver soluções', async () => {
      const req = { ...mockReq(), session: { user: { id: 99 } } };
      getSolutionsByUser.mockResolvedValue([]);

      await showMyChallenges(req, res);

      expect(res.render).toHaveBeenCalledWith('meus-desafios', expect.objectContaining({
        desafiosRespondidos: [],
      }));
    });
  });

  describe('showChallengePage()', () => {
    it('deve renderizar a página do desafio com dados do DEMO_CHALLENGES', async () => {
      const req = {
        ...mockReq(),
        params: { id: '1' },
        session: { user: { id: 1 } },
      };
      ChallengeModel.findByPk.mockResolvedValue(null);
      getSolutionsByChallenge.mockResolvedValue([]);
      getCommentsByChallenge.mockResolvedValue([]);

      await showChallengePage(req, res);

      expect(res.render).toHaveBeenCalledWith('desafio', expect.objectContaining({
        challenge: expect.objectContaining({ title: 'Soma' }),
        solutions: [],
        comments: [],
      }));
    });

    it('deve redirecionar para dashboard quando desafio não for encontrado', async () => {
      const req = {
        ...mockReq(),
        params: { id: '999' },
        session: { user: { id: 1 } },
      };
      ChallengeModel.findByPk.mockResolvedValue(null);

      await showChallengePage(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('deve calcular avgRating quando houver comentários', async () => {
      const req = {
        ...mockReq(),
        params: { id: '1' },
        session: { user: { id: 1 } },
      };
      ChallengeModel.findByPk.mockResolvedValue(null);
      getSolutionsByChallenge.mockResolvedValue([]);
      getCommentsByChallenge.mockResolvedValue([
        { rating: 4, createdAt: new Date() },
        { rating: 5, createdAt: new Date() },
      ]);

      await showChallengePage(req, res);

      expect(res.render).toHaveBeenCalledWith('desafio', expect.objectContaining({
        avgRating: '4.5',
      }));
    });
  });

  describe('submitAndGrade()', () => {
    it('deve redirecionar para o desafio após submissão com sucesso (accepted)', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9); // 0.9*31+70 = 97.9 → 97 → accepted
      const req = {
        ...mockReq({ code: 'return a + b;', language: 'javascript' }),
        params: { id: '1' },
        session: { user: { id: 1 } },
      };
      submitSolution.mockResolvedValue({ id: 10 });
      updateScore.mockResolvedValue({ id: 10, score: 97, status: 'accepted' });

      await submitAndGrade(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/desafio/1');
    });

    it('deve flash de rejeitado quando score for menor que 80', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0); // 0*31+70 = 70 → rejected
      const req = {
        ...mockReq({ code: 'return a + b;', language: 'javascript' }),
        params: { id: '1' },
        session: { user: { id: 1 } },
      };
      submitSolution.mockResolvedValue({ id: 10 });
      updateScore.mockResolvedValue({ id: 10, score: 70, status: 'rejected' });

      await submitAndGrade(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/desafio/1');
    });

    it('deve redirecionar quando o código estiver vazio', async () => {
      const req = {
        ...mockReq({ code: '   ', language: 'javascript' }),
        params: { id: '1' },
        session: { user: { id: 1 } },
      };

      await submitAndGrade(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/desafio/1');
      expect(submitSolution).not.toHaveBeenCalled();
    });
  });

  describe('addWebComment()', () => {
    it('deve redirecionar após adicionar comentário com sucesso', async () => {
      const req = {
        ...mockReq({ content: 'Bom desafio!', rating: '5' }),
        params: { id: '1' },
        session: { user: { id: 1, name: 'Teste' } },
      };
      addComment.mockResolvedValue({ id: 1 });

      await addWebComment(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/desafio/1#comentarios');
    });

    it('deve redirecionar quando comentário estiver vazio', async () => {
      const req = {
        ...mockReq({ content: '  ', rating: '5' }),
        params: { id: '1' },
        session: { user: { id: 1, name: 'Teste' } },
      };

      await addWebComment(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/desafio/1#comentarios');
      expect(addComment).not.toHaveBeenCalled();
    });

    it('deve redirecionar quando avaliação for inválida', async () => {
      const req = {
        ...mockReq({ content: 'Bom!', rating: '0' }),
        params: { id: '1' },
        session: { user: { id: 1, name: 'Teste' } },
      };

      await addWebComment(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/desafio/1#comentarios');
      expect(addComment).not.toHaveBeenCalled();
    });
  });
});
