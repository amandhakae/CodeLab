import { describe, it, test, expect, vi, beforeEach } from 'vitest';

vi.mock('../lessons.model.js', () => ({
  default: {
    create: vi.fn(),
    findAll: vi.fn(),
    findByPk: vi.fn(),
  },
}));

vi.mock('../lesson_progress.model.js', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
  },
}));

import {
  createLesson,
  getLessons,
  getLessonById,
  markAsCompleted,
  getCompletedLessons,
} from '../lessons.service.js';
import LessonModel from '../lessons.model.js';
import LessonProgressModel from '../lesson_progress.model.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createLesson', () => {
  it('salva a lição com título e categoria', async () => {
    const data = { title: 'Introdução ao TDD', category: 'Testes', content: 'Conteúdo...' };
    LessonModel.create.mockResolvedValue({ id: 1, ...data, level: 'iniciante' });

    const result = await createLesson(data);

    expect(LessonModel.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Introdução ao TDD' }));
    expect(result.level).toBe('iniciante');
  });

  test('usa iniciante como nível padrão quando não informado', async () => {
    LessonModel.create.mockResolvedValue({ id: 1, level: 'iniciante' });

    await createLesson({ title: 'TDD na prática', category: 'Testes' });

    expect(LessonModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'iniciante' }),
    );
  });

  it('lança erro quando título estiver vazio', async () => {
    await expect(createLesson({ title: '' })).rejects.toThrow('Título é obrigatório');
    expect(LessonModel.create).not.toHaveBeenCalled();
  });
});

describe('getLessons', () => {
  it('retorna todas as lições cadastradas', async () => {
    LessonModel.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const result = await getLessons();

    expect(result).toHaveLength(3);
  });

  test('chama findAll com ordenação por data de criação', async () => {
    LessonModel.findAll.mockResolvedValue([]);

    await getLessons();

    expect(LessonModel.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [['createdAt', 'DESC']] }),
    );
  });
});

describe('getLessonById', () => {
  it('retorna a lição quando encontrada', async () => {
    LessonModel.findByPk.mockResolvedValue({ id: 5, title: 'Mocks com Vitest' });

    const result = await getLessonById(5);

    expect(result.title).toBe('Mocks com Vitest');
    expect(LessonModel.findByPk).toHaveBeenCalledWith(5);
  });

  test('lança erro quando lição não existe no banco', async () => {
    LessonModel.findByPk.mockResolvedValue(null);

    await expect(getLessonById(99)).rejects.toThrow('Lição não encontrada');
  });
});

describe('markAsCompleted', () => {
  it('cria registro de progresso quando lição existe', async () => {
    LessonModel.findByPk.mockResolvedValue({ id: 1 });
    LessonProgressModel.findOne.mockResolvedValue(null);
    LessonProgressModel.create.mockResolvedValue({ id: 1, userId: 2, lessonId: 1 });

    const result = await markAsCompleted(2, 1);

    expect(LessonProgressModel.create).toHaveBeenCalledWith({ userId: 2, lessonId: 1 });
    expect(result.userId).toBe(2);
  });

  it('retorna o registro existente sem criar duplicata', async () => {
    LessonModel.findByPk.mockResolvedValue({ id: 1 });
    const existente = { id: 5, userId: 2, lessonId: 1 };
    LessonProgressModel.findOne.mockResolvedValue(existente);

    const result = await markAsCompleted(2, 1);

    expect(LessonProgressModel.create).not.toHaveBeenCalled();
    expect(result).toBe(existente);
  });

  test('lança erro quando a lição não existe', async () => {
    LessonModel.findByPk.mockResolvedValue(null);

    await expect(markAsCompleted(1, 99)).rejects.toThrow('Lição não encontrada');
  });
});

describe('getCompletedLessons', () => {
  it('retorna as lições concluídas do usuário', async () => {
    LessonProgressModel.findAll.mockResolvedValue([{ lessonId: 1 }, { lessonId: 2 }]);

    const result = await getCompletedLessons(3);

    expect(result).toHaveLength(2);
  });

  it('filtra pelo userId correto', async () => {
    LessonProgressModel.findAll.mockResolvedValue([]);

    await getCompletedLessons(7);

    expect(LessonProgressModel.findAll).toHaveBeenCalledWith({ where: { userId: 7 } });
  });
});
