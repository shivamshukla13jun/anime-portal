import Collection, { ICollection } from './collection.model';
import { CreateCollectionInput, UpdateCollectionInput } from './collection.validation';
import mongoose from 'mongoose';

export class CollectionService {
  async createCollection(data: CreateCollectionInput): Promise<ICollection> {
    const collection = new Collection({
      ...data,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
    });
    return await collection.save();
  }

  async getAllCollections(categoryId?: string): Promise<ICollection[]> {
    const query: any = {};
    if (categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    return await Collection.find(query)
      .populate('categoryId', 'name slug type')
      .sort({ isFeatured: -1, sortOrder: 1, title: 1 });
  }

  async getCollectionById(id: string): Promise<ICollection | null> {
    return await Collection.findById(id).populate('categoryId', 'name slug type');
  }

  async getFeaturedCollections(): Promise<ICollection[]> {
    return await Collection.find({ isFeatured: true })
      .populate('categoryId', 'name slug type')
      .sort({ sortOrder: 1, title: 1 });
  }

  async updateCollection(id: string, data: UpdateCollectionInput): Promise<ICollection | null> {
    const updateData: any = { ...data };
    if (data.categoryId) {
      updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    }
    return await Collection.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('categoryId', 'name slug type');
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await Collection.findByIdAndDelete(id);
    return !!result;
  }

  async getCollectionsByCategory(categoryId: string): Promise<ICollection[]> {
    return await Collection.find({ categoryId: new mongoose.Types.ObjectId(categoryId) })
      .populate('categoryId', 'name slug type')
      .sort({ isFeatured: -1, sortOrder: 1, title: 1 });
  }
}
