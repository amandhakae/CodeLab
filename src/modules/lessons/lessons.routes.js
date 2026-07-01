import { Router } from 'express';
import {
  create,
  list,
  getOne,
  conclude,
  completedByUser,
  showMyLessons,
} from './lessons.controller.js';

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) return res.redirect('/');
  next();
}

const router = Router();

router.get('/minhas', requireAuth, showMyLessons);
router.get('/usuario/:userId/concluidas', completedByUser);
router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.post('/:id/concluir', requireAuth, conclude);

export default router;
