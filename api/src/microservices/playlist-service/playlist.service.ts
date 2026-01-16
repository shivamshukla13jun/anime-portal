import Playlist, { IPlaylist } from './playlist.model';
import { CreatePlaylistInput, UpdatePlaylistInput } from './playlist.validation';
import mongoose from 'mongoose';

export class PlaylistService {
  async createPlaylist(data: CreatePlaylistInput): Promise<IPlaylist> {
    const playlist = new Playlist({
      ...data,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
      collectionId: data.collectionId ? new mongoose.Types.ObjectId(data.collectionId) : undefined,
    });
    return await playlist.save();
  }

  async getAllPlaylists(categoryId?: string, collectionId?: string): Promise<IPlaylist[]> {
    const query: any = {};
    if (categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (collectionId) {
      query.collectionId = new mongoose.Types.ObjectId(collectionId);
    }
    return await Playlist.find(query)
      .populate('categoryId', 'name slug type')
      .populate('collectionId', 'title')
      .sort({ createdAt: -1 });
  }

  async getPlaylistById(id: string): Promise<IPlaylist | null> {
    return await Playlist.findById(id)
      .populate('categoryId', 'name slug type')
      .populate('collectionId', 'title');
  }

  async updatePlaylist(id: string, data: UpdatePlaylistInput): Promise<IPlaylist | null> {
    const updateData: any = { ...data };
    if (data.categoryId) {
      updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    }
    if (data.collectionId) {
      updateData.collectionId = new mongoose.Types.ObjectId(data.collectionId);
    }
    return await Playlist.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('categoryId', 'name slug type')
      .populate('collectionId', 'title');
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const result = await Playlist.findByIdAndDelete(id);
    return !!result;
  }

  async getPlaylistsByCategory(categoryId: string): Promise<IPlaylist[]> {
    return await Playlist.find({ categoryId: new mongoose.Types.ObjectId(categoryId) })
      .populate('categoryId', 'name slug type')
      .populate('collectionId', 'title')
      .sort({ createdAt: -1 });
  }

  async getPlaylistsByCollection(collectionId: string): Promise<IPlaylist[]> {
    return await Playlist.find({ collectionId: new mongoose.Types.ObjectId(collectionId) })
      .populate('categoryId', 'name slug type')
      .populate('collectionId', 'title')
      .sort({ createdAt: -1 });
  }
}
