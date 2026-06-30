import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const ChallengeModel = sequelize.define('Challenge', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  level: {
    type: DataTypes.ENUM('Iniciante', 'Intermediário', 'Avançado', 'Expert'),
    allowNull: false,
  },
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  image: { type: DataTypes.STRING, defaultValue: null },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'challenges', timestamps: true });

export default ChallengeModel;
