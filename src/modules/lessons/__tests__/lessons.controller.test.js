import { describe, it, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../lessons.service.js', () => ({
  createLesson: vi.fn(),
  getLessons: vi.fn(),
  getLessonById: vi.fn(),
  markAsCompleted: vi.fn(),
  getCompletedLessons: vi.fn(),
}));

import {
  create,
  list,
  getOne,
  conclude,
  completedByUser,
  showMyLessons,
} from '../lessons.controller.js';
import {
  createLesson,
  getLessons,
  getLessonById,
  markAsCompleted,
  getCompletedLessons,
} from '../lessons.service.js';

describe('Lessons Controller', () => {
  let res;

  beforeEach(() => {
    vi.clearAllMocks();
    res = mockRes();
  });

  describe('create()', () => {
    it('retorna 201 com a lição criada', async () => {
      const req = mockReq({ title: 'TDD Básico', category: 'Testes' });
      createLesson.mockResolvedValue({ id: 1, title: 'TDD Básico' });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    });

    it('retorna 400 quando título estiver vazio', async () => {
      const req = mockReq({ title: '' });
      createLesson.mockRejectedValue(new Error('Título é obrigatório'));

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Título é obrigatório' }));
    });
  });

  describe('list()', () => {
    test('retorna 200 com todas as lições', async () => {
      const req = mockReq();
      getLessons.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 500 quando o service falhar', async () => {
      const req = mockReq();
      getLessons.mockRejectedValue(new Error('DB error'));

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getOne()', () => {
    it('retorna 200 com a lição encontrada', async () => {
      const req = { ...mockReq(), params: { id: '1' } };
      getLessonById.mockResolvedValue({ id: 1, title: 'Vitest na prática' });

      await getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: 'Vitest na prática' }));
    });

    test('retorna 404 quando lição não existe', async () => {
      const req = { ...mockReq(), params: { id: '99' } };
      getLessonById.mockRejectedValue(new Error('Lição não encontrada'));

      await getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Lição não encontrada' }));
    });
  });

  describe('conclude()', () => {
    it('retorna 200 ao marcar lição como concluída', async () => {
      const req = { ...mockReq(), params: { id: '1' }, session: { user: { id: 2 } } };
      markAsCompleted.mockResolvedValue({ id: 1, userId: 2, lessonId: 1 });

      await conclude(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 404 quando lição não existe', async () => {
      const req = { ...mockReq(), params: { id: '99' }, session: { user: { id: 2 } } };
      markAsCompleted.mockRejectedValue(new Error('Lição não encontrada'));

      await conclude(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('completedByUser()', () => {
    it('retorna 200 com lições concluídas do usuário', async () => {
      const req = { ...mockReq(), params: { userId: '3' } };
      getCompletedLessons.mockResolvedValue([{ lessonId: 1 }, { lessonId: 2 }]);

      await completedByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('showMyLessons()', () => {
    it('renderiza a página com as lições concluídas', async () => {
      const req = { ...mockReq(), session: { user: { id: 1 } } };
      getCompletedLessons.mockResolvedValue([{ lessonId: 1 }]);

      await showMyLessons(req, res);

      expect(res.render).toHaveBeenCalledWith('minhas-licoes', expect.objectContaining({
        concluidas: expect.any(Array),
      }));
    });

    test('renderiza com lista vazia quando usuário não concluiu nada', async () => {
      const req = { ...mockReq(), session: { user: { id: 99 } } };
      getCompletedLessons.mockResolvedValue([]);

      await showMyLessons(req, res);

      expect(res.render).toHaveBeenCalledWith('minhas-licoes', expect.objectContaining({
        concluidas: [],
      }));
    });
  });
});
