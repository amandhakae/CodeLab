import CommentModel from './comments.model.js';

export const addComment = async ({ userId, challengeId, content, rating, userName = 'Anônimo' }) => {
  if (rating < 1 || rating > 5) throw new Error('Avaliação deve ser entre 1 e 5');
  return await CommentModel.create({ userId, challengeId, content, rating, userName });
};

export const getCommentsByChallenge = async (challengeId) => {
  return await CommentModel.findAll({ where: { challengeId } });
};

export const deleteComment = async (id) => {
  const comment = await CommentModel.findByPk(id);
  if (!comment) throw new Error('Comentário não encontrado');
  await comment.destroy();
  return { message: 'Comentário removido com sucesso' };
};
