import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const LessonModel = sequelize.define('Lesson', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  content: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  level: {
    type: DataTypes.ENUM('iniciante', 'intermediario', 'avancado'),
    defaultValue: 'iniciante',
  },
}, { tableName: 'lessons', timestamps: true });

export default LessonModel;
