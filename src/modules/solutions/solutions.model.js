import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const SolutionModel = sequelize.define('Solution', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  challengeId: { type: DataTypes.INTEGER, allowNull: false },
  code: { type: DataTypes.TEXT, allowNull: false },
  language: { type: DataTypes.STRING, defaultValue: 'javascript' },
  score: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
}, { tableName: 'solutions', timestamps: true });

export default SolutionModel;
