import Category, { ICategory } from './category.model';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation';

export class CategoryService {
  async createCategory(data: CreateCategoryInput): Promise<ICategory> {
    const category = new Category(data);
    return await category.save();
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await Category.find().sort({ type: 1, name: 1 });
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await Category.findById(id);
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug });
  }

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await Category.findByIdAndDelete(id);
    return !!result;
  }

  async getCategoriesByType(type: string): Promise<ICategory[]> {
    return await Category.find({ type }).sort({ name: 1 });
  }
}
