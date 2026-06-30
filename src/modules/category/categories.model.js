import { DataTypes } from 'sequelize';
import sequelize from '../../database/connection.js';

const CategoryModel = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { tableName: 'categories', timestamps: true });

export default CategoryModel;
