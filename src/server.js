import 'dotenv/config';
import app from '../app.js';
import sequelize from './database/connection.js';

const PORT = process.env.PORT || 3000;

sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Banco de dados sincronizado');
    app.listen(PORT, () => {
      console.log(`🚀 CodeLab App rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar com o banco:', err.message);
  });
