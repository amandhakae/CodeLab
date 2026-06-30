import { register, login } from './auth.service.js';

export const logoutHandler = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

export const registerHandler = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', 'As senhas não coincidem');
      return res.redirect('/');
    }

    const user = await register({ name, email, password });
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/');
  }
};

export const loginHandler = async (req, res) => {
  try {
    const user = await login(req.body);
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/');
  }
};
