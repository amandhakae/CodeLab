import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const UserModel = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  photo: { type: DataTypes.STRING, defaultValue: null },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
}, { tableName: 'users', timestamps: true });

export default UserModel;
