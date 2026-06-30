import {
  addComment,
  getCommentsByChallenge,
  deleteComment,
} from './comments.service.js';

export const add = async (req, res) => {
  try {
    const comment = await addComment(req.body);
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getByChallenge = async (req, res) => {
  try {
    const comments = await getCommentsByChallenge(req.params.challengeId);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await deleteComment(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
