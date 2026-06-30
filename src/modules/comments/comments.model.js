import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const CommentModel = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  challengeId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  userName: { type: DataTypes.STRING, defaultValue: 'Anônimo' },
}, { tableName: 'comments', timestamps: true });

export default CommentModel;
