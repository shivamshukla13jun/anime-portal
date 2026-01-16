import ContentItem, { IContentItem, ContentType, ContentSource } from './content.model';

export class ContentService {
  async createContentItem(data: any): Promise<IContentItem> {
    const contentItem = new ContentItem(data);
    return await contentItem.save();
  }

  async getContentById(id: string): Promise<IContentItem | null> {
    return await ContentItem.findById(id);
  }

  async getAllContent(
    type?: ContentType,
    genre?: string,
    source?: ContentSource,
    sort: string = 'trendScore',
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ items: IContentItem[]; total: number; page: number; totalPages: number }> {
    const query: any = {};
    
    if (type) query.type = type;
    if (source) query.source = source;
    if (genre) query.genres = { $in: [genre] };
    if (status) query.status = status;
    else query.status = 'published'; // Only show published content by default

    const sortOptions: any = {};
    const [sortField, sortOrder] = sort.split(':');
    sortOptions[sortField || 'trendScore'] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    
    const items = await ContentItem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    const total = await ContentItem.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return { items, total, page, totalPages };
  }


  async getContentByExternalId(externalId: string, source: ContentSource): Promise<IContentItem | null> {
    return await ContentItem.findOne({ externalId, source });
  }

  async updateContent(id: string, data: Partial<IContentItem>): Promise<IContentItem | null> {
    return await ContentItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteContent(id: string): Promise<boolean> {
    const result = await ContentItem.findByIdAndDelete(id);
    return !!result;
  }

  async getTrendingContent(limit: number = 10): Promise<IContentItem[]> {
    return await ContentItem.find()
      .sort({ trendScore: -1 })
      .limit(limit);
  }

  async getContentByGenre(genre: string, limit: number = 20): Promise<IContentItem[]> {
    return await ContentItem.find({ genres: { $in: [genre] } })
      .sort({ trendScore: -1 })
      .limit(limit);
  }

  async getContentByType(type: ContentType, limit: number = 20): Promise<IContentItem[]> {
    return await ContentItem.find({ type })
      .sort({ trendScore: -1 })
      .limit(limit);
  }

  async calculateTrendScore(content: IContentItem): Promise<number> {
    const recentBoost = content.createdAt && 
      (Date.now() - content.createdAt.getTime()) < (30 * 24 * 60 * 60 * 1000) ? 10 : 0;
    
    return (content.popularity * 0.6) + (content.rating * 20) + recentBoost;
  }

  async updateTrendScores(): Promise<void> {
    const contents = await ContentItem.find({});
    
    for (const content of contents) {
      const newScore = await this.calculateTrendScore(content);
      await ContentItem.findByIdAndUpdate(content._id, { trendScore: newScore });
    }
  }
}
