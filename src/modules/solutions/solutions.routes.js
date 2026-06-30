import { Router } from 'express';
import {
  submit,
  getByUser,
  getByChallenge,
  scoreUpdate,
  showChallengePage,
  submitAndGrade,
  addWebComment,
  showMyChallenges,
} from './solutions.controller.js';

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  next();
}

const router = Router();

router.get('/meus', requireAuth, showMyChallenges);
router.post('/', submit);
router.get('/user/:userId', getByUser);
router.get('/challenge/:challengeId', getByChallenge);

router.get('/:id', requireAuth, showChallengePage);
router.post('/:id/submit', requireAuth, submitAndGrade);
router.post('/:id/comentar', requireAuth, addWebComment);
router.patch('/:id/score', scoreUpdate);

export default router;
