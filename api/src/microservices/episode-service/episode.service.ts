import Episode, { IEpisode } from './episode.model';
import { CreateEpisodeInput, UpdateEpisodeInput } from './episode.validation';
import mongoose from 'mongoose';

export class EpisodeService {
  async createEpisode(data: CreateEpisodeInput): Promise<IEpisode> {
    const episode = new Episode({
      ...data,
      playlistId: new mongoose.Types.ObjectId(data.playlistId),
      videoId: data.videoId ? new mongoose.Types.ObjectId(data.videoId) : undefined,
    });
    return await episode.save();
  }

  async getAllEpisodes(playlistId?: string): Promise<IEpisode[]> {
    const query: any = {};
    if (playlistId) {
      query.playlistId = new mongoose.Types.ObjectId(playlistId);
    }
    return await Episode.find(query)
      .populate('playlistId', 'title type')
      .populate('videoId', 'videoUrl thumbnailUrl status')
      .sort({ episodeNumber: 1 });
  }

  async getEpisodeById(id: string): Promise<IEpisode | null> {
    return await Episode.findById(id)
      .populate('playlistId', 'title type')
      .populate('videoId', 'videoUrl thumbnailUrl status');
  }

  async updateEpisode(id: string, data: UpdateEpisodeInput): Promise<IEpisode | null> {
    const updateData: any = { ...data };
    if (data.playlistId) {
      updateData.playlistId = new mongoose.Types.ObjectId(data.playlistId);
    }
    if (data.videoId) {
      updateData.videoId = new mongoose.Types.ObjectId(data.videoId);
    }
    return await Episode.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('playlistId', 'title type')
      .populate('videoId', 'videoUrl thumbnailUrl status');
  }

  async deleteEpisode(id: string): Promise<boolean> {
    const result = await Episode.findByIdAndDelete(id);
    return !!result;
  }

  async getEpisodesByPlaylist(playlistId: string): Promise<IEpisode[]> {
    return await Episode.find({ playlistId: new mongoose.Types.ObjectId(playlistId) })
      .populate('playlistId', 'title type')
      .populate('videoId', 'videoUrl thumbnailUrl status')
      .sort({ episodeNumber: 1 });
  }

  async getPublishedEpisodes(): Promise<IEpisode[]> {
    return await Episode.find({ status: 'published' })
      .populate('playlistId', 'title type')
      .populate('videoId', 'videoUrl thumbnailUrl status')
      .sort({ createdAt: -1 });
  }

  async getEpisodesByType(type: 'short' | 'long'): Promise<IEpisode[]> {
    return await Episode.find({ type, status: 'published' })
      .populate('playlistId', 'title type')
      .populate('videoId', 'videoUrl thumbnailUrl status')
      .sort({ createdAt: -1 });
  }
}
