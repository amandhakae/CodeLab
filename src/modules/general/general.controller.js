import UserModel from '../user/user.model.js';
import SolutionModel from '../solutions/solutions.model.js';
import CommentModel from '../comments/comments.model.js';
import ChallengeModel from '../challenges/challenges.model.js';
import CategoryModel from '../category/categories.model.js';
import { DEMO_CHALLENGES } from '../../constants/challenges.js';

export const showDashboard = async (req, res) => {
  let challenges;
  try {
    const dbChallenges = await ChallengeModel.findAll({ order: [['createdAt', 'DESC']] });
    if (dbChallenges.length > 0) {
      const categorias = await CategoryModel.findAll();
      const catMap = {};
      categorias.forEach(c => { catMap[c.id] = c.name; });
      challenges = dbChallenges.map((c, i) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        category: catMap[c.categoryId] || 'Geral',
        image: c.image || null,
        rating: c.rating || 0,
        commentsCount: c.commentsCount || 0,
        ordem: i + 1,
      }));
    } else {
      challenges = Object.values(DEMO_CHALLENGES).map((c, i) => ({
        ...c,
        image: null,
        commentsCount: 0,
        ordem: i + 1,
      }));
    }
  } catch {
    challenges = Object.values(DEMO_CHALLENGES).map((c, i) => ({
      ...c,
      image: null,
      commentsCount: 0,
      ordem: i + 1,
    }));
  }
  res.render('index', { title: 'CodeLab - Desafios', challenges });
};

export const showRankings = async (req, res) => {
  try {
    
    const solucoes = await SolutionModel.findAll({ where: { status: 'accepted' } });

    
    const mapaRanking = {};
    solucoes.forEach(s => {
      if (!mapaRanking[s.userId]) {
        mapaRanking[s.userId] = { userId: s.userId, totalScore: 0, solucoes: 0, melhorScore: 0 };
      }
      mapaRanking[s.userId].totalScore += s.score || 0;
      mapaRanking[s.userId].solucoes++;
      if ((s.score || 0) > mapaRanking[s.userId].melhorScore) {
        mapaRanking[s.userId].melhorScore = s.score || 0;
      }
    });

    
    const userIds = Object.keys(mapaRanking).map(Number);
    let usuarios = [];
    if (userIds.length > 0) {
      usuarios = await UserModel.findAll({
        where: { id: userIds },
        attributes: ['id', 'name', 'photo'],
      });
    }

    
    const ranking = usuarios.map(u => ({
      id: u.id,
      name: u.name,
      photo: u.photo,
      totalScore: Math.round(mapaRanking[u.id].totalScore),
      solucoes: mapaRanking[u.id].solucoes,
      melhorScore: mapaRanking[u.id].melhorScore,
    })).sort((a, b) => b.totalScore - a.totalScore);

    
    const totalUsuarios = await UserModel.count().catch(() => 0);

    res.render('rankings', {
      title: 'Rankings — CodeLab',
      ranking,
      totalUsuarios,
    });
  } catch (err) {
    req.flash('error', 'Erro ao carregar rankings: ' + err.message);
    res.render('rankings', { title: 'Rankings — CodeLab', ranking: [], totalUsuarios: 0 });
  }
};

export const showComunidade = async (req, res) => {
  try {
    
    const comentarios = await CommentModel.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15,
    }).catch(() => []);

    
    const solucoesAceitas = await SolutionModel.findAll({
      where: { status: 'accepted' },
      order: [['createdAt', 'DESC']],
      limit: 10,
    }).catch(() => []);

    
    const userIds = [...new Set(solucoesAceitas.map(s => s.userId))];
    const usuariosMap = {};
    if (userIds.length > 0) {
      const usuarios = await UserModel.findAll({
        where: { id: userIds },
        attributes: ['id', 'name'],
      }).catch(() => []);
      usuarios.forEach(u => { usuariosMap[u.id] = u.name; });
    }

    
    const [totalUsuarios, totalSolucoes, totalComentarios] = await Promise.all([
      UserModel.count().catch(() => 0),
      SolutionModel.count().catch(() => 0),
      CommentModel.count().catch(() => 0),
    ]);

    const aceitas = await SolutionModel.count({ where: { status: 'accepted' } }).catch(() => 0);

    res.render('comunidade', {
      title: 'Comunidade — CodeLab',
      comentarios,
      solucoesAceitas,
      usuariosMap,
      DEMO_CHALLENGES,
      stats: { totalUsuarios, totalSolucoes, totalComentarios, aceitas },
    });
  } catch {
    res.render('comunidade', {
      title: 'Comunidade — CodeLab',
      comentarios: [],
      solucoesAceitas: [],
      usuariosMap: {},
      DEMO_CHALLENGES,
      stats: { totalUsuarios: 0, totalSolucoes: 0, totalComentarios: 0, aceitas: 0 },
    });
  }
};
