import bcrypt from 'bcryptjs';
import UserModel from './auth.model.js';

export const register = async ({ name, email, password }) => {
  const existing = await UserModel.findOne({ where: { email } });
  if (existing) {
    throw new Error('Email já cadastrado');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, password: hashed });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const login = async ({ email, password }) => {
  const user = await UserModel.findOne({ where: { email } });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error('Senha incorreta');
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};
