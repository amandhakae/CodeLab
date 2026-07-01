import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const LessonProgressModel = sequelize.define('LessonProgress', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  completedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'lesson_progress', timestamps: false });

export default LessonProgressModel;
