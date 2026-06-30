import ChallengeModel from './challenges.model.js';

export const getAllChallenges = async (filters = {}) => {
  return await ChallengeModel.findAll({ where: filters });
};

export const getChallengeById = async (id) => {
  const challenge = await ChallengeModel.findByPk(id);
  if (!challenge) throw new Error('Desafio não encontrado');
  return challenge;
};

export const createChallenge = async (data) => {
  return await ChallengeModel.create(data);
};

export const updateChallenge = async (id, data) => {
  const challenge = await ChallengeModel.findByPk(id);
  if (!challenge) throw new Error('Desafio não encontrado');
  return await challenge.update(data);
};

export const deleteChallenge = async (id) => {
  const challenge = await ChallengeModel.findByPk(id);
  if (!challenge) throw new Error('Desafio não encontrado');
  await challenge.destroy();
  return { message: 'Desafio removido com sucesso' };
};
