import LessonModel from './lessons.model.js';
import LessonProgressModel from './lesson_progress.model.js';

export const createLesson = async ({ title, description, content, category, level = 'iniciante' }) => {
  if (!title || !title.trim()) throw new Error('Título é obrigatório');
  return await LessonModel.create({ title, description, content, category, level });
};

export const getLessons = async () => {
  return await LessonModel.findAll({ order: [['createdAt', 'DESC']] });
};

export const getLessonById = async (id) => {
  const lesson = await LessonModel.findByPk(id);
  if (!lesson) throw new Error('Lição não encontrada');
  return lesson;
};

export const markAsCompleted = async (userId, lessonId) => {
  const lesson = await LessonModel.findByPk(lessonId);
  if (!lesson) throw new Error('Lição não encontrada');
  const existing = await LessonProgressModel.findOne({ where: { userId, lessonId } });
  if (existing) return existing;
  return await LessonProgressModel.create({ userId, lessonId });
};

export const getCompletedLessons = async (userId) => {
  return await LessonProgressModel.findAll({ where: { userId } });
};
