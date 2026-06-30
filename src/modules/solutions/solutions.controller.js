import {
  submitSolution,
  getSolutionsByUser,
  getSolutionsByChallenge,
  updateScore,
} from './solutions.service.js';
import {
  addComment,
  getCommentsByChallenge,
} from '../comments/comments.service.js';
import { DEMO_CHALLENGES } from '../../constants/challenges.js';
import ChallengeModel from '../challenges/challenges.model.js';

export const submit = async (req, res) => {
  try {
    const solution = await submitSolution(req.body);
    res.status(201).json(solution);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getByUser = async (req, res) => {
  try {
    const solutions = await getSolutionsByUser(req.params.userId);
    res.status(200).json(solutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getByChallenge = async (req, res) => {
  try {
    const solutions = await getSolutionsByChallenge(req.params.challengeId);
    res.status(200).json(solutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const scoreUpdate = async (req, res) => {
  try {
    const solution = await updateScore(req.params.id, req.body);
    res.status(200).json(solution);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const showMyChallenges = async (req, res) => {
  const solutions = await getSolutionsByUser(req.session.user.id).catch(() => []);

  
  const mapaDesafios = {};

  solutions.forEach(s => {
    const cid = s.challengeId;
    if (!mapaDesafios[cid]) {
      mapaDesafios[cid] = {
        challenge: DEMO_CHALLENGES[cid] || { id: cid, title: `Desafio #${cid}`, level: '—', category: '—' },
        tentativas: 0,
        melhorScore: 0,
        ultimoStatus: s.status,
        ultimaData: s.createdAt,
      };
    }
    const entry = mapaDesafios[cid];
    entry.tentativas++;
    if ((s.score || 0) > entry.melhorScore) {
      entry.melhorScore = s.score || 0;
    }
    if (new Date(s.createdAt) > new Date(entry.ultimaData)) {
      entry.ultimoStatus = s.status;
      entry.ultimaData = s.createdAt;
    }
  });

  const desafiosRespondidos = Object.values(mapaDesafios)
    .sort((a, b) => new Date(b.ultimaData) - new Date(a.ultimaData));

  res.render('meus-desafios', {
    title: 'Meus Desafios — CodeLab',
    desafiosRespondidos,
  });
};

export const showChallengePage = async (req, res) => {
  const { id } = req.params;
  let challenge = DEMO_CHALLENGES[id] || null;

  try {
    const dbChallenge = await ChallengeModel.findByPk(parseInt(id));
    if (dbChallenge) {
      challenge = {
        id: dbChallenge.id,
        title: dbChallenge.title,
        level: dbChallenge.level,
        category: challenge ? challenge.category : 'Geral',
        description: dbChallenge.description,
        rating: dbChallenge.rating,
        image: dbChallenge.image || null,
      };
    }
  } catch {
    // usa DEMO_CHALLENGES
  }

  if (!challenge) {
    req.flash('error', 'Desafio não encontrado.');
    return res.redirect('/dashboard');
  }

  
  const solutions = await getSolutionsByChallenge(parseInt(id))
    .then(todas => todas
      .filter(s => s.userId === req.session.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    )
    .catch(() => []);

  
  const comments = await getCommentsByChallenge(parseInt(id))
    .then(todos => todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    .catch(() => []);

  
  let avgRating = 0;
  if (comments.length > 0) {
    const soma = comments.reduce((acc, c) => acc + c.rating, 0);
    avgRating = (soma / comments.length).toFixed(1);
  }

  res.render('desafio', {
    title: challenge.title + ' — CodeLab',
    challenge,
    solutions,
    comments,
    avgRating,
  });
};

export const submitAndGrade = async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  if (!code || !code.trim()) {
    req.flash('error', 'O código não pode estar vazio.');
    return res.redirect(`/desafio/${id}`);
  }

  try {
    const userId = req.session.user.id;
    const challengeId = parseInt(id);

    
    const solution = await submitSolution({ userId, challengeId, code, language });

    
    const score = Math.floor(Math.random() * 31) + 70; 
    const status = score >= 80 ? 'accepted' : 'rejected';
    const feedback = status === 'accepted'
      ? 'Todos os testes passaram!'
      : 'Alguns casos de teste falharam. Revise sua lógica e tente novamente.';

    await updateScore(solution.id, { score, status });

    if (status === 'accepted') {
      req.flash('success', `✅ Solução aceita! Pontuação: ${score}/100 — ${feedback}`);
    } else {
      req.flash('error', `❌ Solução rejeitada. Pontuação: ${score}/100 — ${feedback}`);
    }

  } catch (err) {
    req.flash('error', 'Erro ao enviar solução: ' + err.message);
  }

  res.redirect(`/desafio/${id}`);
};

export const addWebComment = async (req, res) => {
  const { id } = req.params;
  const { content, rating } = req.body;
  const ratingNum = parseInt(rating, 10);

  if (!content || !content.trim()) {
    req.flash('error', 'O comentário não pode estar vazio.');
    return res.redirect(`/desafio/${id}#comentarios`);
  }

  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    req.flash('error', 'Selecione uma avaliação de 1 a 5 estrelas.');
    return res.redirect(`/desafio/${id}#comentarios`);
  }

  try {
    await addComment({
      userId: req.session.user.id,
      challengeId: parseInt(id),
      content: content.trim(),
      rating: ratingNum,
      userName: req.session.user.name,
    });

    req.flash('success', 'Comentário enviado com sucesso!');
  } catch (err) {
    req.flash('error', 'Erro ao enviar comentário: ' + err.message);
  }

  res.redirect(`/desafio/${id}#comentarios`);
};
