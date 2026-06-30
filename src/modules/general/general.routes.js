import { Router } from 'express';
import { showRankings, showComunidade, showDashboard } from './general.controller.js';

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) return res.redirect('/');
  next();
}

const router = Router();

router.get('/dashboard', showDashboard);
router.get('/rankings', requireAuth, showRankings);
router.get('/comunidade', requireAuth, showComunidade);

export default router;
