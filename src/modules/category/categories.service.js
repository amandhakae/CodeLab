import CategoryModel from './categories.model.js';

export const getAllCategories = async () => {
  return await CategoryModel.findAll();
};

export const getCategoryById = async (id) => {
  const category = await CategoryModel.findByPk(id);
  if (!category) throw new Error('Categoria não encontrada');
  return category;
};

export const createCategory = async ({ name }) => {
  const existing = await CategoryModel.findOne({ where: { name } });
  if (existing) throw new Error('Categoria já existe');
  return await CategoryModel.create({ name });
};

export const deleteCategory = async (id) => {
  const category = await CategoryModel.findByPk(id);
  if (!category) throw new Error('Categoria não encontrada');
  await category.destroy();
  return { message: 'Categoria removida com sucesso' };
};
