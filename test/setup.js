import { vi } from "vitest";


process.env.SESSION_SECRET = 'test_secret';
process.env.DB_NAME = 'codelab_tdd';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';


global.mockReq = (body = {}, session = {}) => ({
  body,
  session,
  flash: vi.fn(),
  get: vi.fn(),
});
global.mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  res.render = vi.fn().mockReturnValue(res);
  return res;
};
