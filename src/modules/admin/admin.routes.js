import { Router } from 'express';
import {
  showDashboard,
  showDesafios, criarDesafio, excluirDesafio,
  showCategorias, criarCategoria, excluirCategoria,
  showUsuarios, alterarRole,
  showComentarios, excluirComentario,
  showLicoes, criarLicao, excluirLicao,
  setupAdmin,
  uploadChallenge,
} from './admin.controller.js';

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    req.flash('error', 'Acesso restrito a administradores.');
    return res.redirect('/dashboard');
  }
  next();
}

const router = Router();

router.get('/setup', requireAuth, setupAdmin);

router.use(requireAdmin);

router.get('/', showDashboard);

router.get('/desafios', showDesafios);
router.post('/desafios', (req, res, next) => {
  uploadChallenge.single('image')(req, res, (err) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/admin/desafios');
    }
    next();
  });
}, criarDesafio);
router.post('/desafios/:id/excluir', excluirDesafio);

router.get('/categorias', showCategorias);
router.post('/categorias', criarCategoria);
router.post('/categorias/:id/excluir', excluirCategoria);

router.get('/usuarios', showUsuarios);
router.post('/usuarios/:id/role', alterarRole);

router.get('/comentarios', showComentarios);
router.post('/comentarios/:id/excluir', excluirComentario);

router.get('/licoes', showLicoes);
router.post('/licoes', criarLicao);
router.post('/licoes/:id/excluir', excluirLicao);

export default router;
