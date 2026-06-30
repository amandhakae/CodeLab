import { Router } from 'express';
import { showProfile, updateProfile, upload } from './user.controller.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
}

router.get('/', requireAuth, showProfile);

router.post('/', requireAuth, (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/perfil');
    }
    next();
  });
}, updateProfile);

export default router;
