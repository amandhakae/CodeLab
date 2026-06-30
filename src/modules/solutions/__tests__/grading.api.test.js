import { describe, it, expect, afterEach } from 'vitest';
import nock from 'nock';
import { submitToGrader, getGradingResult } from '../grading.api.js';

const API_URL = 'https://api.judge.codelab.io';

afterEach(() => {
  nock.cleanAll();
});

describe('Grading API — Testes com nock (API Externa)', () => {

  describe('submitToGrader()', () => {

    it('deve enviar o código para a API e retornar submissionId com status pending', async () => {
      nock(API_URL)
        .post('/submit', { code: 'console.log(1+1)', language: 'javascript', challenge_id: 1 })
        .reply(200, { submissionId: 'abc123', status: 'pending' });

      const result = await submitToGrader({
        code: 'console.log(1+1)',
        language: 'javascript',
        challengeId: 1,
      });

      expect(result).toHaveProperty('submissionId', 'abc123');
      expect(result.status).toBe('pending');
    });

    it('deve lançar erro quando a API retornar status 500', async () => {
      nock(API_URL)
        .post('/submit')
        .reply(500, { message: 'Internal Server Error' });

      await expect(
        submitToGrader({ code: 'x', language: 'python', challengeId: 2 }),
      ).rejects.toThrow();
    });

    it('deve lançar erro quando a API estiver inacessível (timeout)', async () => {
      nock(API_URL)
        .post('/submit')
        .replyWithError('connect ECONNREFUSED');

      await expect(
        submitToGrader({ code: 'x', language: 'javascript', challengeId: 3 }),
      ).rejects.toThrow();
    });

  });

  describe('getGradingResult()', () => {

    it('deve retornar resultado accepted com score quando a solução for correta', async () => {
      nock(API_URL)
        .get('/submissions/abc123')
        .reply(200, { submissionId: 'abc123', status: 'accepted', score: 100, feedback: 'Todos os testes passaram!' });

      const result = await getGradingResult('abc123');

      expect(result.status).toBe('accepted');
      expect(result.score).toBe(100);
      expect(result).toHaveProperty('feedback');
    });

    it('deve retornar resultado rejected com feedback quando a solução for incorreta', async () => {
      nock(API_URL)
        .get('/submissions/xyz999')
        .reply(200, { submissionId: 'xyz999', status: 'rejected', score: 0, feedback: '3 de 5 testes falharam.' });

      const result = await getGradingResult('xyz999');

      expect(result.status).toBe('rejected');
      expect(result.score).toBe(0);
      expect(result.feedback).toBe('3 de 5 testes falharam.');
    });

  });
});
