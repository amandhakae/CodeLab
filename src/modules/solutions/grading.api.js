import axios from 'axios';

const GRADING_API_URL = process.env.GRADING_API_URL || 'https://api.judge.codelab.io';

export const submitToGrader = async ({ code, language, challengeId }) => {
  const response = await axios.post(`${GRADING_API_URL}/submit`, {
    code,
    language,
    challenge_id: challengeId,
  });
  return response.data;
};

export const getGradingResult = async (submissionId) => {
  const response = await axios.get(`${GRADING_API_URL}/submissions/${submissionId}`);
  return response.data;
};
