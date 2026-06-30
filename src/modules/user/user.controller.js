import multer from 'multer';
import path from 'path';
import fs from 'fs';
import UserModel from './user.model.js';
import SolutionModel from '../solutions/solutions.model.js';

const uploadDir = 'src/public/uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.session && req.session.user ? req.session.user.id : 'temp';
    cb(null, `user-${userId}-${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (.jpg, .jpeg, .png, .gif)'));
    }
  },
});

export const showProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await UserModel.findByPk(userId);

    if (!user) {
      req.session.destroy();
      return res.redirect('/');
    }

    
    const solucoesAceitas = await SolutionModel.findAll({
      where: { userId, status: 'accepted' },
    });

    let novaMedia = 0;
    if (solucoesAceitas.length > 0) {
      const soma = solucoesAceitas.reduce((acc, s) => acc + (parseFloat(s.score) || 0), 0);
      novaMedia = parseFloat((soma / solucoesAceitas.length).toFixed(1));
    }

    
    if (novaMedia !== parseFloat(user.rating || 0)) {
      await user.update({ rating: novaMedia });
    }

    
    user.rating = novaMedia;
    req.session.user.rating = novaMedia;

    res.render('perfil', { user });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/dashboard');
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      req.flash('error', 'O nome não pode ficar em branco');
      return res.redirect('/perfil');
    }

    const userId = req.session.user.id;
    const updateData = { name: name.trim() };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    await UserModel.update(updateData, { where: { id: userId } });

    
    req.session.user = {
      ...req.session.user,
      name: updateData.name,
      photo: updateData.photo || req.session.user.photo,
    };

    req.flash('success', 'Perfil atualizado com sucesso!');
    res.redirect('/perfil');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/perfil');
  }
};
