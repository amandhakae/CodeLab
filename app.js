import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts';
import authRoutes from './src/modules/auth/auth.routes.js';
import userRoutes from './src/modules/user/user.routes.js';
import solutionRoutes from './src/modules/solutions/solutions.routes.js';
import adminRoutes from './src/modules/admin/admin.routes.js';
import generalRoutes from './src/modules/general/general.routes.js';
import challengeRoutes from './src/modules/challenges/challenges.routes.js';
import lessonRoutes from './src/modules/lessons/lessons.routes.js';
const app = express();
app.set('views', path.join(process.cwd(), 'src/views/pages'));
app.set('layout', path.join(process.cwd(), 'src/views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'src/public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  }),
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session.user || null;
  res.locals.title = 'CodeLab-App';
  next();
});
app.get('/', (req, res) => res.render('login', { title: 'CodeLab - Entrar' }));
app.use('/auth', authRoutes);
app.use('/perfil', userRoutes);
app.use('/desafio', solutionRoutes);
app.use('/admin', adminRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/licoes', lessonRoutes);
app.use('/', generalRoutes);
app.use((req, res) => res.status(404).send('Página não encontrada'));
export default app;
