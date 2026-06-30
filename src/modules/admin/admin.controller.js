import multer from 'multer';
import path from 'path';
import fs from 'fs';
import UserModel from '../user/user.model.js';
import SolutionModel from '../solutions/solutions.model.js';
import CommentModel from '../comments/comments.model.js';
import ChallengeModel from '../challenges/challenges.model.js';
import { getAllCategories, createCategory, deleteCategory } from '../category/categories.service.js';
import { getAllChallenges, createChallenge, deleteChallenge } from '../challenges/challenges.service.js';
import { deleteComment } from '../comments/comments.service.js';

const challengeUploadDir = 'src/public/uploads/challenges/';
if (!fs.existsSync(challengeUploadDir)) {
  fs.mkdirSync(challengeUploadDir, { recursive: true });
}

const challengeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, challengeUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `challenge-${Date.now()}${ext}`);
  },
});

export const uploadChallenge = multer({
  storage: challengeStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Apenas imagens são permitidas'));
  },
});

export const showDashboard = async (req, res) => {
  try {
    const [totalUsuarios, totalSolucoes, totalComentarios] = await Promise.all([
      UserModel.count(),
      SolutionModel.count(),
      CommentModel.count(),
    ]);

    const totalDesafios = await ChallengeModel.count().catch(() => 6);

    
    const aceitas = await SolutionModel.count({ where: { status: 'accepted' } }).catch(() => 0);
    const taxaAceitacao = totalSolucoes > 0
      ? Math.round((aceitas / totalSolucoes) * 100)
      : 0;

    
    const usuariosRecentes = await UserModel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    }).catch(() => []);

    
    const solucoesRecentes = await SolutionModel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
    }).catch(() => []);

    res.render('admin-dashboard', {
      title: 'Admin — Dashboard',
      stats: { totalUsuarios, totalSolucoes, totalComentarios, totalDesafios, taxaAceitacao, aceitas },
      usuariosRecentes,
      solucoesRecentes,
    });
  } catch (err) {
    req.flash('error', 'Erro ao carregar dashboard: ' + err.message);
    res.redirect('/dashboard');
  }
};

export const showDesafios = async (req, res) => {
  try {
    const [desafios, categorias] = await Promise.all([
      getAllChallenges(),
      getAllCategories(),
    ]);

    res.render('admin-desafios', {
      title: 'Admin — Desafios',
      desafios,
      categorias,
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin');
  }
};

export const criarDesafio = async (req, res) => {
  const { title, description, level, categoryId } = req.body;
  try {
    const data = { title, description, level, categoryId: parseInt(categoryId) };
    if (req.file) {
      data.image = `/uploads/challenges/${req.file.filename}`;
    }
    await createChallenge(data);
    req.flash('success', `Desafio "${title}" criado com sucesso!`);
  } catch (err) {
    req.flash('error', 'Erro ao criar desafio: ' + err.message);
  }
  res.redirect('/admin/desafios');
};

export const excluirDesafio = async (req, res) => {
  try {
    await deleteChallenge(req.params.id);
    req.flash('success', 'Desafio removido.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/desafios');
};

export const showCategorias = async (req, res) => {
  try {
    const categorias = await getAllCategories();
    res.render('admin-categorias', {
      title: 'Admin — Categorias',
      categorias,
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin');
  }
};

export const criarCategoria = async (req, res) => {
  try {
    await createCategory({ name: req.body.name });
    req.flash('success', `Categoria "${req.body.name}" criada!`);
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/categorias');
};

export const excluirCategoria = async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    req.flash('success', 'Categoria removida.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/categorias');
};

export const showUsuarios = async (req, res) => {
  try {
    const usuarios = await UserModel.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    });

    res.render('admin-usuarios', {
      title: 'Admin — Usuários',
      usuarios,
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin');
  }
};

export const alterarRole = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.session.user.id) {
    req.flash('error', 'Você não pode alterar sua própria role.');
    return res.redirect('/admin/usuarios');
  }

  try {
    const usuario = await UserModel.findByPk(id);
    if (!usuario) throw new Error('Usuário não encontrado');

    const novaRole = usuario.role === 'admin' ? 'user' : 'admin';
    await usuario.update({ role: novaRole });

    req.flash('success', `${usuario.name} agora é ${novaRole === 'admin' ? 'administrador' : 'usuário'}.`);
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/usuarios');
};

export const showComentarios = async (req, res) => {
  try {
    const comentarios = await CommentModel.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.render('admin-comentarios', {
      title: 'Admin — Comentários',
      comentarios,
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/admin');
  }
};

export const excluirComentario = async (req, res) => {
  try {
    await deleteComment(req.params.id);
    req.flash('success', 'Comentário removido.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/comentarios');
};

export const setupAdmin = async (req, res) => {
  try {
    const totalAdmins = await UserModel.count({ where: { role: 'admin' } });
    if (totalAdmins > 0) {
      req.flash('error', 'Já existe um administrador. Operação não permitida.');
      return res.redirect('/dashboard');
    }

    const usuario = await UserModel.findByPk(req.session.user.id);
    await usuario.update({ role: 'admin' });
    req.session.user.role = 'admin';

    req.flash('success', 'Você agora é administrador!');
    res.redirect('/admin');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/dashboard');
  }
};
