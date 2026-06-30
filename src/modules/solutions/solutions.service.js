import SolutionModel from './solutions.model.js';

export const submitSolution = async ({ userId, challengeId, code, language = 'javascript' }) => {
  return await SolutionModel.create({ userId, challengeId, code, language, status: 'pending' });
};

export const getSolutionsByUser = async (userId) => {
  return await SolutionModel.findAll({ where: { userId } });
};

export const getSolutionsByChallenge = async (challengeId) => {
  return await SolutionModel.findAll({ where: { challengeId } });
};

export const updateScore = async (id, { score, status }) => {
  const solution = await SolutionModel.findByPk(id);
  if (!solution) throw new Error('Solução não encontrada');
  return await solution.update({ score, status });
};
