import {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from './challenges.service.js';

export const getAll = async (req, res) => {
  try {
    const challenges = await getAllChallenges(req.query);
    res.status(200).json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const challenge = await getChallengeById(req.params.id);
    res.status(200).json(challenge);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const challenge = await createChallenge(req.body);
    res.status(201).json(challenge);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const challenge = await updateChallenge(req.params.id, req.body);
    res.status(200).json(challenge);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await deleteChallenge(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
