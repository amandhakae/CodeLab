import {
  createLesson,
  getLessons,
  getLessonById,
  markAsCompleted,
  getCompletedLessons,
} from './lessons.service.js';

export const create = async (req, res) => {
  try {
    const lesson = await createLesson(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const list = async (req, res) => {
  try {
    const lessons = await getLessons();
    res.status(200).json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const lesson = await getLessonById(req.params.id);
    res.status(200).json(lesson);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const conclude = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const result = await markAsCompleted(userId, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const completedByUser = async (req, res) => {
  try {
    const lessons = await getCompletedLessons(req.params.userId);
    res.status(200).json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const showMyLessons = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const concluidas = await getCompletedLessons(userId);
    res.render('minhas-licoes', { title: 'Minhas Lições — SkillUp', concluidas });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const showLessons = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const todasLicoes = await getLessons();
    const concluidas = await getCompletedLessons(userId);
    const idsConcluidos = new Set(concluidas.map(c => String(c.lessonId)));
    const licoes = todasLicoes.map(l => ({
      ...l.dataValues,
      concluida: idsConcluidos.has(String(l.id)),
    }));
    res.render('licoes', { title: 'SkillUp — Lições', licoes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const concludeWeb = async (req, res) => {
  try {
    const userId = req.session.user.id;
    await markAsCompleted(userId, req.params.id);
    req.flash('success', 'Lição marcada como concluída!');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/licoes');
};
